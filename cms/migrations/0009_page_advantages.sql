-- Manages the "私たちが選ばれる理由" (AdvantageList) section on the same three
-- fixed pages as page_gallery_images. Unlike the gallery, this content is
-- locale-specific (heading/body text differs ja vs zh), so each item has its
-- own locale row, mirroring team_members.
CREATE TABLE IF NOT EXISTS page_advantages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL CHECK (page_key IN ('real-estate', 'renovation', 'asset-management')),
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  badge TEXT NOT NULL DEFAULT '',
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_page_advantages_page_locale_sort ON page_advantages (page_key, locale, sort_order);
