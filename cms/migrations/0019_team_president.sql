-- One president per locale; shown first (center) in the homepage team carousel.
ALTER TABLE team_members ADD COLUMN is_president INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_locale_president
  ON team_members (locale)
  WHERE is_president = 1;
