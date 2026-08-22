-- Extends group_companies with the additional 会社概要 fields for
-- グループ企業紹介 cards on the グループ情報 page: phone, established date,
-- capital, and representative director. All are optional — CompanyCards only
-- renders a detail row when the CMS-managed value for it is non-empty.
ALTER TABLE group_companies ADD COLUMN phone TEXT;
ALTER TABLE group_companies ADD COLUMN established TEXT;
ALTER TABLE group_companies ADD COLUMN capital TEXT;
ALTER TABLE group_companies ADD COLUMN representative TEXT;
