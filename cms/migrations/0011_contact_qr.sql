-- Manages the two QR code images (WeChat / Line) shown on the お問い合わせ
-- (Contact) page, replacing the hardcoded "QRコード準備中" placeholder text.
-- Shared across ja/zh (same scannable QR code regardless of language), so
-- there's no locale column — mirrors page_gallery_images in that respect.
-- Two fixed rows are seeded up front since the UI always shows exactly one
-- slot per type rather than a manageable list.
CREATE TABLE IF NOT EXISTS contact_qr_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('wechat', 'line')),
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO contact_qr_codes (type) VALUES ('wechat'), ('line');
