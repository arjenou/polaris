-- ja/zh content rows are independent (own slug), so the public site cannot tell
-- which Chinese article is the translation of which Japanese one. Rows that
-- share the same non-null translation_key (one per locale) are counterparts of
-- each other; the language switch on a detail page uses this to jump straight
-- to the matching article instead of a non-existent slug (404).
ALTER TABLE news_posts ADD COLUMN translation_key TEXT;
ALTER TABLE recommended_posts ADD COLUMN translation_key TEXT;
ALTER TABLE events ADD COLUMN translation_key TEXT;

CREATE INDEX IF NOT EXISTS idx_news_posts_translation_key ON news_posts (translation_key);
CREATE INDEX IF NOT EXISTS idx_recommended_posts_translation_key ON recommended_posts (translation_key);
CREATE INDEX IF NOT EXISTS idx_events_translation_key ON events (translation_key);
