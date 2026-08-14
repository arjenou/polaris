-- Manages the "グループ企業紹介" (CompanyCards) section on the グループ情報 /
-- enterprise-intelligence page. Content is locale-specific (name/business
-- text and href differ ja vs zh), mirroring team_members. `region`
-- distinguishes the two sub-lists rendered on the page (日本国内企業 /
-- 海外企業); ordering is independent within each locale+region group.
CREATE TABLE IF NOT EXISTS group_companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  region TEXT NOT NULL CHECK (region IN ('domestic', 'overseas')),
  name TEXT NOT NULL,
  business TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  href TEXT,
  coming_soon INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_group_companies_locale_region_sort ON group_companies (locale, region, sort_order);
