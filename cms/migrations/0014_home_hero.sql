-- Manages the homepage hero: the headline text (per locale, since ja/zh
-- have independent copy) and the background slide carousel (shared across
-- ja/zh, mirrors page_gallery_images). Replaces the hardcoded heroHeadline /
-- heroHeadlineZh / heroSlides in src/data/home.ts and src/data/home.zh.ts.
-- Two fixed headline rows are seeded up front since the UI always shows
-- exactly one field per locale rather than a manageable list.
CREATE TABLE IF NOT EXISTS home_hero_headlines (
  locale TEXT PRIMARY KEY CHECK (locale IN ('ja', 'zh')),
  headline TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO home_hero_headlines (locale, headline) VALUES
  ('ja', '境を乗り越え、道を切り拓く'),
  ('zh', '跨域筑新，启径拓远');

CREATE TABLE IF NOT EXISTS home_hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_key TEXT NOT NULL,
  image_width INTEGER,
  image_height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_home_hero_slides_sort ON home_hero_slides (sort_order);
