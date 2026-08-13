/**
 * One-time bootstrap: creates the first row in `admin_users` so that the
 * D1-backed login (replacing the old ADMIN_USERNAME/ADMIN_PASSWORD secrets)
 * has an account to log in with.
 *
 * Usage: npm run bootstrap:admin -- <username> <password>
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const PBKDF2_ITERATIONS = 100_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(new Uint8Array(derived))}`;
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: npm run bootstrap:admin -- <username> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const sql = `INSERT INTO admin_users (username, password_hash, token_version) VALUES ('${sqlEscape(username)}', '${sqlEscape(passwordHash)}', 1) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash, token_version = admin_users.token_version + 1, updated_at = datetime('now');\n`;

  const sqlPath = path.join(CMS_ROOT, "migrations-data", "bootstrap-admin.sql");
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, sql, "utf8");

  console.log(`Creating/updating admin user "${username}" in the remote D1 database...`);
  execFileSync("npx", ["wrangler", "d1", "execute", "polaris-cms", "--remote", `--file=${sqlPath}`], {
    cwd: CMS_ROOT,
    stdio: "inherit",
  });

  console.log("\n✅ Done.");
}

main();
