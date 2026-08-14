-- "社員紹介" (team member introduction) — shown as a homepage carousel with a
-- detail modal. Unlike news/recommended, ja/zh are independent content (not
-- just a UI-label translation), and members within a locale have an explicit
-- admin-managed display order instead of being sorted by date.
CREATE TABLE IF NOT EXISTS team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name_kana TEXT NOT NULL DEFAULT '',
  first_name_kana TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  languages TEXT NOT NULL DEFAULT '[]',
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_team_members_locale_sort ON team_members (locale, sort_order);
