-- Phase 1: News module only. Other content types (team/events/subsidiaries/forms)
-- will get their own migrations when those phases are implemented.

CREATE TABLE IF NOT EXISTS news_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  tag TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_news_posts_locale_date ON news_posts (locale, date DESC);
