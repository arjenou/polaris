-- Manages the グループ情報 (enterprise-intelligence) page's hero title +
-- intro text + section titles (per locale, text only) and the グループ沿革
-- timeline (full CRUD list, per locale). Replaces the hardcoded groupInfo /
-- groupInfoZh objects in src/data/pages/groupInfo.ts / groupInfo.zh.ts.
--
-- The hero banner photo and intro watermark badge image are shared across
-- ja/zh (same files regardless of language) and are managed as two fixed
-- named slots, mirroring contact_qr_codes.
CREATE TABLE IF NOT EXISTS group_info_content (
  locale TEXT PRIMARY KEY CHECK (locale IN ('ja', 'zh')),
  hero_title TEXT NOT NULL DEFAULT '',
  intro_title TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '[]',
  timeline_title TEXT NOT NULL DEFAULT '',
  companies_title TEXT NOT NULL DEFAULT '',
  domestic_title TEXT NOT NULL DEFAULT '',
  overseas_title TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO group_info_content (locale, hero_title, intro_title, intro, timeline_title, companies_title, domestic_title, overseas_title) VALUES
  ('ja', 'ポラリス・グループ', 'グループ情報',
   '["ポラリス・グループは、2018年に日本東京で創立され、不動産業界において豊富な経験と実績を誇る総合グループです。不動産賃貸売買、不動産管理、リノベーション、投資コンサルティングなど、幅広い事業を展開し、専門チームによる高品質なワンストップサービスを提供しています。","2024年には、中国上海に100%出資子会社「妙見川禾（上海）商務諮詢有限公司」を設立。これにより、グローバル展開の重要な一歩を踏み出しました。グループの強固なリソースを活かし、日中間の情報の壁を取り除き、高効率かつ透明性の高い不動産投資サービスを提供することで、お客様の多様なニーズに応えています。","今後も「革新・誠実・共栄」を理念に掲げ、お客様の資産価値向上と安定した財産形成を支援することに全力を尽くしてまいります。"]',
   'グループ沿革', 'グループ企業紹介', '日本国内企業', '海外企業'),
  ('zh', 'Polaris Group', '集团简介',
   '["Polaris集团创立于2018年，总部位于日本东京。","以不动产为中心，涵盖不动产投资、资产管理、室内装潢、创业支援、日本身份规划等多领域业务的综合型集团企业。","由专业团队提供高效、一站式的综合解决方案，为客户提供全面有力保障。","2024年，Polaris集团在中国上海设立全资子公司——妙见川禾（上海）商务咨询有限公司，正式迈出全球业务布局的重要一步。","依托集团强大的资源与专业优势，打破中日两地信息壁垒，为客户提供高效、透明的跨境服务，全方位满足客户多样化的需求。","未来，Polaris集团将继续秉承「革新・信赖・共荣」的企业理念，以专业实力和优质服务，助力客户提升资产价值，实现财富稳步增长。"]',
   '集团沿革', '集团企业介绍', '日本企业', '海外企业');

CREATE TABLE IF NOT EXISTS group_info_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('hero', 'badge')),
  image_key TEXT,
  image_width INTEGER,
  image_height INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO group_info_assets (type) VALUES ('hero'), ('badge');

CREATE TABLE IF NOT EXISTS group_timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('ja', 'zh')),
  date TEXT NOT NULL DEFAULT '',
  event TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_group_timeline_locale_sort ON group_timeline (locale, sort_order);

INSERT INTO group_timeline (locale, date, event, sort_order) VALUES
  ('ja', '2025.06', 'グループ本部を東京都千代田区に移転', 0),
  ('ja', '2025.04', 'マンスリーマンション事業展開', 1),
  ('ja', '2024.12', '「妙見行政書士事務所」登録', 2),
  ('ja', '2024.10', '「ポラリス・ネクスト株式会社」特許庁商標登録', 3),
  ('ja', '2024.08', '「ポラリス・ネクスト株式会社」経営革新計画の東京都認定取得', 4),
  ('ja', '2024.08', '「喬木商事合同会社」設立（起業家向け創業経営支援）', 5),
  ('ja', '2024.03', '中国上海で100％子会社「妙見川禾（上海）商務諮詢有限公司」設立', 6),
  ('ja', '2023.11', '東京都新宿区で自社ビル取得', 7),
  ('ja', '2023.06', '現状回復、退室清掃業務完全自社化', 8),
  ('ja', '2023.01', '東京都港区でレンタルオフィス事業展開', 9),
  ('ja', '2022.01', '中古不動産売買事業展開', 10),
  ('ja', '2021.09', 'Polaris Next Co., Ltd.の設立（不動産取引業）', 11),
  ('ja', '2021.03', 'リノベーション事業展開', 12),
  ('ja', '2020.01', '不動産管理事業開始', 13),
  ('ja', '2018.04', 'Polaris Property Co., Ltd.の創立', 14),
  ('zh', '2025.06', '千代田区新办公室正式启用', 0),
  ('zh', '2025.04', '短租公寓项目事业开展', 1),
  ('zh', '2024.12', '「妙見行政書士事務所」注册登记', 2),
  ('zh', '2024.10', '「Polaris Next株式会社」在日本特许厅完成专属商标注册', 3),
  ('zh', '2024.08', '「Polaris Next株式会社」取得东京都经营革新计划认证', 4),
  ('zh', '2024.08', '「喬木商事合同会社」成立（为创业者提供全方位创业经营支持）', 5),
  ('zh', '2024.03', '在上海成立100%全资子公司「妙见川禾（上海）商务咨询有限公司」', 6),
  ('zh', '2023.11', '购置位于东京都新宿区的自有办公大厦', 7),
  ('zh', '2023.06', '实现房屋原状恢复与退房清扫业务的全面自主化运营', 8),
  ('zh', '2023.01', '启动东京都港区共享办公项目', 9),
  ('zh', '2022.01', '二手住房交易业务展开', 10),
  ('zh', '2021.09', '「Polaris Next株式会社」成立（专注于日本不动产）', 11),
  ('zh', '2021.03', '启动室内装潢项目', 12),
  ('zh', '2020.01', '启动在日资产管理项目', 13),
  ('zh', '2018.04', '「Polaris Property株式会社」创立', 14);
