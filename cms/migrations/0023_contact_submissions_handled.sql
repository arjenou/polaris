-- Lets an admin mark a contact submission as "handled" (已处理) from the
-- detail page; the submissions list then shows a red tag on that row.
ALTER TABLE contact_submissions ADD COLUMN is_handled INTEGER NOT NULL DEFAULT 0;
