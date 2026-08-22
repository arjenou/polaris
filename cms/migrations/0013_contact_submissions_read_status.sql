-- Tracks whether an admin has opened a contact submission yet, so the
-- sidebar nav and the submissions list can show a "new" dot for unread
-- inquiries. Existing rows are marked as already read (no retroactive
-- badges for old submissions).
ALTER TABLE contact_submissions ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0;
UPDATE contact_submissions SET is_read = 1;
