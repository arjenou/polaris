-- Lets an event's uploaded video have a custom poster/cover image, shown in
-- place of the browser's default (often blank/black) first-frame poster
-- until the visitor clicks play.
ALTER TABLE events ADD COLUMN video_poster_key TEXT;
ALTER TABLE events ADD COLUMN video_poster_width INTEGER;
ALTER TABLE events ADD COLUMN video_poster_height INTEGER;
