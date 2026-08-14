-- Optional scheduled publish time for a draft post. Stored as UTC
-- 'YYYY-MM-DD HH:MM:SS' (same format SQLite's datetime('now') produces) so it
-- can be compared directly in SQL without a timezone conversion.
ALTER TABLE news_posts ADD COLUMN scheduled_at TEXT;
