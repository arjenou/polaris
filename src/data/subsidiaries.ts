// Group-company ("subsidiary") lockup logos + legal names shown in the footer,
// matching the legacy site's per-business footer (Group logo | subsidiary logo + legal name).
// Logos are reused from the group-info company cards (src/data/pages/groupInfo.ts).
export type SubsidiaryKey = "next" | "property" | "arknest" | "kyoboku" | "shanghai";

export interface SubsidiaryInfo {
  image: string;
  name: string;
  nameZh: string;
  address: string;
  addressZh: string;
}

export const subsidiaries: Record<SubsidiaryKey, SubsidiaryInfo> = {
  next: {
    image: "/images/pages/group-info/company-nexus.png",
    name: "ポラリス・ネクスト株式会社",
    nameZh: "Polaris Next株式会社",
    address: "〒102-0083 東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    addressZh: "〒102-0083 東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
  },
  property: {
    image: "/images/pages/group-info/company-property.png",
    name: "ポラリス・プロパティ株式会社",
    nameZh: "Polaris Property株式会社",
    address: "〒102-0083 東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
    addressZh: "〒102-0083 東京都千代田区麴町３丁目５−１５ 得水ビル 5F",
  },
  arknest: {
    image: "/images/pages/group-info/company-arknest.png",
    name: "ArkNest株式会社",
    nameZh: "ArkNest株式会社",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-A",
    addressZh: "東京都新宿区百人町1-18-8大久保カドビル903-A",
  },
  kyoboku: {
    image: "/images/pages/group-info/company-takagi.png",
    name: "喬木商事合同会社",
    nameZh: "喬木商事合同会社",
    address: "東京都新宿区百人町1-18-8大久保カドビル903-C",
    addressZh: "東京都新宿区百人町1-18-8大久保カドビル903-C",
  },
  shanghai: {
    image: "/images/pages/group-info/company-shanghai.png",
    name: "妙見川禾（上海）商務諮詢有限公司",
    nameZh: "妙见川禾（上海）商务咨询有限公司",
    address: "中国上海市长宁区SOHO天山广场T2座 5F",
    addressZh: "中国上海市长宁区SOHO天山广场T2座 5F",
  },
};
