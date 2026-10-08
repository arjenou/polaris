import { NextResponse, type NextRequest } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { moveOutFormCopyJa, moveOutFormCopyZh } from "@/data/moveOutForm";
import type { MoveOutRequestPayload } from "@/lib/moveOutRequest";

// nodemailer opens a real SMTP connection, so this route cannot run on the edge.
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED_FIELDS = [
  "propertyName",
  "roomNumber",
  "contractorName",
  "phone",
  "email",
  "cancelReason",
  "cancelDate",
  "attendanceDate",
  "attendanceTime",
  "newAddress",
] as const satisfies readonly (keyof MoveOutRequestPayload)[];

function parsePayload(raw: unknown): MoveOutRequestPayload | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const text = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");

  const payload: MoveOutRequestPayload = {
    locale: input.locale === "zh" ? "zh" : "ja",
    propertyName: text("propertyName"),
    roomNumber: text("roomNumber"),
    contractorName: text("contractorName"),
    phone: text("phone"),
    email: text("email"),
    cancelReason: text("cancelReason"),
    cancelReasonDetail: text("cancelReasonDetail"),
    cancelDate: text("cancelDate"),
    attendanceDate: text("attendanceDate"),
    attendanceTime: text("attendanceTime"),
    newAddress: text("newAddress"),
    bankName: text("bankName"),
    branchName: text("branchName"),
    accountType: text("accountType"),
    accountNumber: text("accountNumber"),
    accountHolderKana: text("accountHolderKana"),
    leftoverItemsAgree: input.leftoverItemsAgree === true,
    utilitiesAgree: input.utilitiesAgree === true,
    otherMessage: text("otherMessage"),
  };

  if (REQUIRED_FIELDS.some((field) => !payload[field])) return null;
  if (!EMAIL_RE.test(payload.email)) return null;
  if (!payload.leftoverItemsAgree || !payload.utilitiesAgree) return null;

  return payload;
}

type OptionListKey = "cancelReasonOptions" | "accountTypeOptions" | "attendanceTimeOptions";

/** Select options are submitted in the visitor's own language. The desk reads
 * Japanese, so Chinese choices are mapped back through the parallel option
 * arrays and the original is kept in parentheses. */
function localizeChoice(value: string, locale: "ja" | "zh", options: OptionListKey) {
  if (!value || locale === "ja") return value;
  const index = moveOutFormCopyZh[options].indexOf(value);
  return index >= 0 ? `${moveOutFormCopyJa[options][index]}（${value}）` : value;
}

function buildRows(payload: MoveOutRequestPayload): Array<[string, string]> {
  const labels = moveOutFormCopyJa.fields;
  const reason = localizeChoice(payload.cancelReason, payload.locale, "cancelReasonOptions");
  const rows: Array<[string, string]> = [
    ["言語", payload.locale === "zh" ? "中文（zh）" : "日本語（ja）"],
    [labels.propertyName, payload.propertyName],
    [labels.roomNumber, payload.roomNumber],
    [labels.contractorName, payload.contractorName],
    [labels.phone, payload.phone],
    [labels.email, payload.email],
    [labels.cancelReason, payload.cancelReasonDetail ? `${reason}（${payload.cancelReasonDetail}）` : reason],
    [labels.cancelDate, payload.cancelDate],
    [labels.attendanceDate, payload.attendanceDate],
    [labels.attendanceTime, payload.attendanceTime],
    [labels.newAddress, payload.newAddress],
    [labels.bankName, payload.bankName || "―"],
    [labels.branchName, payload.branchName || "―"],
    [labels.accountType, localizeChoice(payload.accountType, payload.locale, "accountTypeOptions") || "―"],
    [labels.accountNumber, payload.accountNumber || "―"],
    [labels.accountHolderKana, payload.accountHolderKana || "―"],
    [labels.leftoverItemsTitle, payload.leftoverItemsAgree ? "同意済み" : "未同意"],
    [labels.utilitiesTitle, payload.utilitiesAgree ? "同意済み" : "未同意"],
    [labels.otherMessage, payload.otherMessage || "―"],
  ];
  return rows;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(rows: Array<[string, string]>, receivedAt: string) {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;color:#555;">${escapeHtml(label)}</th>` +
        `<td style="padding:6px 0;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return (
    `<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#111;">` +
    `<p>退去受付フォームから新しい申請が届きました。（受付日時: ${escapeHtml(receivedAt)}）</p>` +
    `<table cellpadding="0" cellspacing="0">${body}</table>` +
    `</div>`
  );
}

/** MOVE_OUT_MAIL_TO holds one or more comma-separated desk addresses. */
function getRecipients() {
  const configured = (process.env.MOVE_OUT_MAIL_TO ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : [process.env.SMTP_USER!];
}

let transporter: Transporter | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter ??= nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = parsePayload(raw);
  if (!payload) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.error("[move-out-request] SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS)");
    return NextResponse.json({ error: "Mailer not configured" }, { status: 500 });
  }

  const rows = buildRows(payload);
  const receivedAt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const labelWidth = Math.max(...rows.map(([label]) => label.length));

  try {
    await mailer.sendMail({
      from: { name: "ポラリス 退去受付フォーム", address: process.env.SMTP_USER! },
      to: getRecipients(),
      // Lets the desk reply straight to the tenant from their inbox.
      replyTo: payload.email,
      subject: `【退去受付】${payload.propertyName} ${payload.roomNumber} / ${payload.contractorName}`,
      text: [
        `退去受付フォームから新しい申請が届きました。`,
        `受付日時: ${receivedAt}`,
        "",
        ...rows.map(([label, value]) => `${label.padEnd(labelWidth, "　")} : ${value}`),
      ].join("\n"),
      html: buildHtml(rows, receivedAt),
    });
  } catch (error) {
    console.error("[move-out-request] failed to send mail", error);
    return NextResponse.json({ error: "Failed to send mail" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
