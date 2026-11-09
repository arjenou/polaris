-- Backfill translation_key for content that existed before 0024, so the
-- language switch on article pages lands on the other-language article
-- instead of the list page.
--
-- Conservative heuristic: two rows are paired only when, among rows that are
-- not linked yet, a date has exactly ONE ja row and exactly ONE zh row. Dates
-- with several candidates on either side are left alone (ambiguous) and can be
-- linked by hand from the CMS editor ("对应的中文/日语内容"). Wrong pairs can be
-- fixed or removed there as well.
--
-- The key is derived from the date, which is unique per pair by construction.

UPDATE news_posts
   SET translation_key = 'auto-news-' || date
 WHERE translation_key IS NULL
   AND date IN (
     SELECT j.date
       FROM news_posts j
       JOIN news_posts z
         ON z.date = j.date AND z.locale = 'zh' AND z.translation_key IS NULL
      WHERE j.locale = 'ja' AND j.translation_key IS NULL
      GROUP BY j.date
     HAVING COUNT(DISTINCT j.id) = 1 AND COUNT(DISTINCT z.id) = 1
   );

UPDATE recommended_posts
   SET translation_key = 'auto-recommended-' || date
 WHERE translation_key IS NULL
   AND date IN (
     SELECT j.date
       FROM recommended_posts j
       JOIN recommended_posts z
         ON z.date = j.date AND z.locale = 'zh' AND z.translation_key IS NULL
      WHERE j.locale = 'ja' AND j.translation_key IS NULL
      GROUP BY j.date
     HAVING COUNT(DISTINCT j.id) = 1 AND COUNT(DISTINCT z.id) = 1
   );

UPDATE events
   SET translation_key = 'auto-events-' || date
 WHERE translation_key IS NULL
   AND date IN (
     SELECT j.date
       FROM events j
       JOIN events z
         ON z.date = j.date AND z.locale = 'zh' AND z.translation_key IS NULL
      WHERE j.locale = 'ja' AND j.translation_key IS NULL
      GROUP BY j.date
     HAVING COUNT(DISTINCT j.id) = 1 AND COUNT(DISTINCT z.id) = 1
   );
