import { sanitize } from "unsane";

/**
 * Allowlist matches exactly what the admin rich text editor (TipTap) can
 * produce. This is defense-in-depth against someone calling the news API
 * directly (bypassing the editor UI) with hand-crafted HTML, since content
 * is rendered unescaped on the public site via `dangerouslySetInnerHTML`.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "code",
  "pre",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
};

export function sanitizeNewsContent(html: string): string {
  if (!html) return "";
  return sanitize(html, { allowedTags: ALLOWED_TAGS, allowedAttributes: ALLOWED_ATTRIBUTES });
}
