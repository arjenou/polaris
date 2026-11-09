-- Japanese pages moved from the site root to the /jp prefix (Chinese stays
-- under /zh). Internal links stored for Japanese content must follow, e.g.
-- "/business-headquarters" -> "/jp/business-headquarters". Old URLs also keep
-- working through redirects on the site, so this only avoids the extra hop.
-- Idempotent: already-prefixed and external links are left untouched.
UPDATE group_companies
   SET href = '/jp' || href
 WHERE locale = 'ja'
   AND href LIKE '/%'
   AND href NOT LIKE '/jp%'
   AND href NOT LIKE '/zh%';
