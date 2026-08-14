-- "社内イベント" (company events) — richer shape than news/recommended: a
-- colored badge, optional date range, optional hero image (falls back to the
-- cover), an optional real video link, a fixed 6-field "开催概要" block, and
-- an optional photo gallery (JSON array of R2 keys). ja/zh are independent
-- content rows, same as news/recommended/team.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  date_range TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL,
  badge_color TEXT NOT NULL DEFAULT '#1E6FD9',
  summary TEXT NOT NULL DEFAULT '',
  cover_image_key TEXT,
  cover_image_width INTEGER,
  cover_image_height INTEGER,
  hero_image_key TEXT,
  hero_image_width INTEGER,
  hero_image_height INTEGER,
  video_url TEXT NOT NULL DEFAULT '',
  overview_event_name TEXT NOT NULL DEFAULT '',
  overview_datetime TEXT NOT NULL DEFAULT '',
  overview_venue TEXT NOT NULL DEFAULT '',
  overview_participants TEXT NOT NULL DEFAULT '',
  overview_content TEXT NOT NULL DEFAULT '',
  overview_organizer TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 1,
  scheduled_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (locale, slug)
);

CREATE INDEX IF NOT EXISTS idx_events_locale_date ON events (locale, date DESC);
