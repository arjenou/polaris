-- Admin-managed display order for 社内イベント (same pattern as team_members).
ALTER TABLE events ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Preserve the previous date DESC ordering as the initial sort_order per locale.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY locale ORDER BY date DESC) - 1 AS new_order
  FROM events
)
UPDATE events
SET sort_order = (SELECT new_order FROM ranked WHERE ranked.id = events.id);

CREATE INDEX IF NOT EXISTS idx_events_locale_sort ON events (locale, sort_order);
