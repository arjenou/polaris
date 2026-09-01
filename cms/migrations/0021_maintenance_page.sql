-- Background image for the メンテナンス中 (coming soon) pages, e.g.
-- マンスリー / 創業支援. Shared across ja/zh.
CREATE TABLE IF NOT EXISTS maintenance_page (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO maintenance_page (id) VALUES (1);
