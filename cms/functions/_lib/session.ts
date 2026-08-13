/// <reference types="@cloudflare/workers-types" />
import type { Env } from "./env";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return arrayBufferToBase64Url(signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export interface SessionPayload {
  username: string;
  tokenVersion: number;
}

export async function createSessionToken(payload: SessionPayload, secret: string): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const raw = `${payload.username}|${expires}|${payload.tokenVersion}`;
  const signature = await hmacSign(secret, raw);
  return `${base64UrlEncode(raw)}.${signature}`;
}

/** Verifies the cookie's signature/expiry only. Does NOT check that
 * `tokenVersion` still matches the user's current password — callers that
 * need that guarantee should use `requireSession` instead. */
async function verifySessionSignature(token: string, secret: string): Promise<SessionPayload | null> {
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  let raw: string;
  try {
    raw = base64UrlDecode(payloadB64);
  } catch {
    return null;
  }

  const expectedSignature = await hmacSign(secret, raw);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  const [username, expiresStr, tokenVersionStr] = raw.split("|");
  const expires = Number(expiresStr);
  const tokenVersion = Number(tokenVersionStr);
  if (!username || Number.isNaN(expires) || Date.now() > expires || !Number.isInteger(tokenVersion)) return null;

  return { username, tokenVersion };
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readSessionTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Verifies the session cookie's signature/expiry AND that its `tokenVersion`
 * still matches the user's current row in D1 — so changing a password (which
 * bumps `token_version`) immediately invalidates any other outstanding
 * sessions for that user. */
export async function requireSession(request: Request, env: Env): Promise<{ username: string } | null> {
  const token = readSessionTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifySessionSignature(token, env.SESSION_SECRET);
  if (!payload) return null;

  const row = await env.DB.prepare("SELECT token_version FROM admin_users WHERE username = ?")
    .bind(payload.username)
    .first<{ token_version: number }>();

  if (!row || row.token_version !== payload.tokenVersion) return null;

  return { username: payload.username };
}
