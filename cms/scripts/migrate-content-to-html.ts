/**
 * One-time migration: converts the legacy Markdown `news_posts.content`
 * values to sanitized HTML, so the new rich text editor (which reads/writes
 * HTML) can load and continue editing existing posts, and so the public
 * Next.js site can render `content` directly instead of running it through
 * a markdown processor.
 *
 * Writes a JSON backup of the original rows before touching anything, and
 * skips any row whose content already looks like HTML (idempotent — safe to
 * re-run).
 *
 * Usage: npm run migrate:content-to-html
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { sanitizeNewsContent } from "../functions/_lib/sanitizeHtml";

const CMS_ROOT = path.resolve(import.meta.dirname, "..");
const BACKUP_PATH = path.join(CMS_ROOT, "migrations-data", `news-content-backup-${Date.now()}.json`);
const SQL_PATH = path.join(CMS_ROOT, "migrations-data", "content-to-html.sql");

interface NewsRow {
  id: number;
  slug: string;
  content: string;
}

function sqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

function looksLikeHtml(content: string): boolean {
  return /^\s*<[a-z][\s\S]*>/i.test(content);
}

function runWrangler(args: string[]): string {
  return execFileSync("npx", ["wrangler", ...args], { cwd: CMS_ROOT, encoding: "utf8" });
}

async function main() {
  console.log("Fetching current news_posts rows from remote D1...");
  const output = runWrangler([
    "d1",
    "execute",
    "polaris-cms",
    "--remote",
    "--json",
    "--command=SELECT id, slug, content FROM news_posts ORDER BY id",
  ]);
  const parsed = JSON.parse(output) as Array<{ results: NewsRow[] }>;
  const rows = parsed[0]?.results ?? [];

  if (rows.length === 0) {
    console.log("No rows found. Nothing to do.");
    return;
  }

  fs.mkdirSync(path.dirname(BACKUP_PATH), { recursive: true });
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(rows, null, 2), "utf8");
  console.log(`Backed up ${rows.length} rows to ${BACKUP_PATH}`);

  const statements: string[] = [];
  let skipped = 0;

  for (const row of rows) {
    if (looksLikeHtml(row.content)) {
      skipped++;
      continue;
    }

    const processed = remark().use(remarkHtml).processSync(row.content ?? "");
    const html = sanitizeNewsContent(processed.toString());

    statements.push(`UPDATE news_posts SET content = '${sqlEscape(html)}' WHERE id = ${row.id};`);
    console.log(`  #${row.id} (${row.slug}): markdown -> HTML`);
  }

  console.log(`\n${statements.length} row(s) to convert, ${skipped} already HTML (skipped).`);
  if (statements.length === 0) {
    console.log("Nothing to convert. Done.");
    return;
  }

  fs.writeFileSync(SQL_PATH, statements.join("\n") + "\n", "utf8");
  console.log(`\nApplying ${statements.length} UPDATE statement(s) to remote D1...`);
  console.log(runWrangler(["d1", "execute", "polaris-cms", "--remote", `--file=${SQL_PATH}`]));

  console.log("\n✅ Done. Original content is backed up at:", BACKUP_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
