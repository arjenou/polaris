-- Optional banner image between「私たちが選ばれる理由」and the bottom photo
-- carousel on 不動産取引 / リノベーション / 不動産管理 (one per page_key).
CREATE TABLE IF NOT EXISTS page_mid_images (
  page_key TEXT PRIMARY KEY CHECK (page_key IN ('real-estate', 'renovation', 'asset-management')),
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
