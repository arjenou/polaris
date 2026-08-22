-- Simple show/hide for グループ企業紹介 and 私たちが選ばれる理由.
-- Existing rows stay visible (DEFAULT 1). No scheduled publish time.
ALTER TABLE group_companies ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
ALTER TABLE page_advantages ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
