-- "おすすめ情報" (recommended picks) — a second, independent content type with
-- the exact same shape as news_posts (own slug/detail page/rich content),
-- shown as a homepage card grid and its own list/detail pages.
CREATE TABLE IF NOT EXISTS recommended_posts (
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
  scheduled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_recommended_posts_locale_date ON recommended_posts (locale, date DESC);
