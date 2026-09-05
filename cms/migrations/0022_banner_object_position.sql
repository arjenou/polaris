-- Stores the object-position focal point (percentages) for banner images
-- managed in the CMS. Default 50% 0% matches object-position: top center.
ALTER TABLE maintenance_page ADD COLUMN object_position_x REAL NOT NULL DEFAULT 50;
ALTER TABLE maintenance_page ADD COLUMN object_position_y REAL NOT NULL DEFAULT 0;

ALTER TABLE group_info_assets ADD COLUMN object_position_x REAL NOT NULL DEFAULT 50;
ALTER TABLE group_info_assets ADD COLUMN object_position_y REAL NOT NULL DEFAULT 0;

ALTER TABLE home_hero_slides ADD COLUMN object_position_x REAL NOT NULL DEFAULT 50;
ALTER TABLE home_hero_slides ADD COLUMN object_position_y REAL NOT NULL DEFAULT 0;
