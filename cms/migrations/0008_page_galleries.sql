-- Manages the photo carousel ("PhotoCoverflow") at the bottom of three fixed
-- content pages, replacing the hardcoded image lists in
-- src/data/pages/realEstate.ts and src/data/pages/assetsManagement.ts.
-- Images are shared across ja/zh (the two locales already showed identical
-- photos, only the section title text differs), so there's no locale column.
-- The three pages are independently manageable even though 不動産取引 and
-- リノベーション happened to share the same photos before this migration.
CREATE TABLE IF NOT EXISTS page_gallery_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL CHECK (page_key IN ('real-estate', 'renovation', 'asset-management')),
  image_key TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_page_gallery_images_page_sort ON page_gallery_images (page_key, sort_order);
