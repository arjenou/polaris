-- Stores actual /contact form submissions (previously a UI-only demo with no
-- backend at all). `member_id` is set when the visitor arrived via a team
-- member's "このメンバーに相談する" button, so the admin can count real
-- submissions attributed to each staff member — a click on that button alone
-- does not count, only a completed submission does.
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  member_id INTEGER REFERENCES team_members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  furigana TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  inquiry_type TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  contact_method TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_member ON contact_submissions (member_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions (created_at DESC);
