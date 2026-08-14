/// <reference types="@cloudflare/workers-types" />
import type { Env } from "../../_lib/env";
import { errorJson, json, PUBLIC_WRITE_CORS_HEADERS } from "../../_lib/response";

interface ContactSubmissionInput {
  locale?: string;
  memberId?: number | null;
  name?: string;
  furigana?: string;
  email?: string;
  phone?: string;
  inquiryType?: string;
  message?: string;
  contactMethod?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: ContactSubmissionInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!input.name) return "姓名不能为空";
  if (!input.email || !EMAIL_RE.test(input.email)) return "邮箱格式不正确";
  if (input.memberId !== undefined && input.memberId !== null && !Number.isInteger(input.memberId)) {
    return "memberId 必须是整数";
  }
  return null;
}

/** Public write endpoint backing the /contact form. A row here is the only
 * thing that counts as a "real" inquiry for a team member — merely clicking
 * through from the team carousel does not create one. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let input: ContactSubmissionInput;
  try {
    input = await request.json();
  } catch {
    return errorJson("请求格式错误", 400, PUBLIC_WRITE_CORS_HEADERS);
  }

  const validationError = validate(input);
  if (validationError) return errorJson(validationError, 400, PUBLIC_WRITE_CORS_HEADERS);

  let memberId: number | null = input.memberId ?? null;
  if (memberId !== null) {
    const member = await env.DB.prepare("SELECT id FROM team_members WHERE id = ?").bind(memberId).first();
    if (!member) memberId = null;
  }

  await env.DB.prepare(
    `INSERT INTO contact_submissions (locale, member_id, name, furigana, email, phone, inquiry_type, message, contact_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      input.locale,
      memberId,
      input.name,
      input.furigana ?? "",
      input.email,
      input.phone ?? "",
      input.inquiryType ?? "",
      input.message ?? "",
      input.contactMethod ?? "",
    )
    .run();

  return json({ ok: true }, { status: 201 }, PUBLIC_WRITE_CORS_HEADERS);
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: PUBLIC_WRITE_CORS_HEADERS });
};
