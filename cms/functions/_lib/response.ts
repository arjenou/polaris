export const PUBLIC_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/** Same as PUBLIC_CORS_HEADERS but also allows POST, for public write
 * endpoints (e.g. the /contact form submission) called directly from the
 * browser on the Next.js site's origin. */
export const PUBLIC_WRITE_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(data: unknown, init: ResponseInit = {}, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

export function errorJson(message: string, status = 400, extraHeaders: Record<string, string> = {}) {
  return json({ error: message }, { status }, extraHeaders);
}
