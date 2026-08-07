export interface TeamMember {
  id: number;
  lastNameJp: string;
  lastName: string;
  firstNameJp: string;
  firstName: string;
  position: string;
  department: string;
  description: string;
  tags: string[];
  languages: string[];
  image: string;
}

// NOTE: names/descriptions are placeholder content pending real staff bios;
// photos are AI-generated stand-ins (see /images/team) until real headshots are supplied.
export const teamMembers: TeamMember[] = [
  {
    id: 1,
    lastNameJp: "サトウ",
    lastName: "佐藤",
    firstNameJp: "タロウ",
    firstName: "太郎",
    position: "/ 宅地建物取引士",
    department: "営業部 チームリーダー",
    description:
      "新築マンションの販売を得意とし、お客様のニーズに合わせた物件をご紹介します。",
    tags: ["売買仲介", "新築マンション"],
    languages: ["日本語", "英語"],
    image: "/images/team/staff-sato.jpg",
  },
  {
    id: 2,
    lastNameJp: "ヤマダ",
    lastName: "山田",
    firstNameJp: "ハナコ",
    firstName: "花子",
    position: "/ 宅地建物取引士 | 宅地建物取引士",
    department: "営業部 マネージャー",
    description:
      "不動産業界で10年以上の経験を持ち、安心・丁寧なサポートを心がけています。",
    tags: ["売買仲介", "投資物件", "住宅ローン相談"],
    languages: ["日本語", "中国語", "英語"],
    image: "/images/team/staff-yamada.jpg",
  },
  {
    id: 3,
    lastNameJp: "タナカ",
    lastName: "田中",
    firstNameJp: "アキ",
    firstName: "明",
    position: "/ 宅地建物取引士",
    department: "営業部",
    description:
      "不動産投資のアドバイザーとして、収益物件の選定から管理までサポートいたします。",
    tags: ["投資物件", "資産運用"],
    languages: ["日本語"],
    image: "/images/team/staff-tanaka.jpg",
  },
  {
    id: 4,
    lastNameJp: "スズキ",
    lastName: "鈴木",
    firstNameJp: "ミカ",
    firstName: "美香",
    position: "/ 宅地建物取引士",
    department: "営業部",
    description:
      "中古住宅のリノベーション提案が得意です。住まいの価値を最大限に引き出します。",
    tags: ["リノベーション", "中古住宅"],
    languages: ["日本語", "中国語"],
    image: "/images/team/staff-suzuki.jpg",
  },
  {
    id: 5,
    lastNameJp: "ワタナベ",
    lastName: "渡辺",
    firstNameJp: "ヒロシ",
    firstName: "浩",
    position: "/ 宅地建物取引士 | FP2級",
    department: "営業部 シニアアドバイザー",
    description:
      "20年以上の実績があり、特に資産運用としての不動産購入をサポートします。",
    tags: ["資産運用", "住宅ローン相談"],
    languages: ["日本語", "英語"],
    image: "/images/team/staff-watanabe.jpg",
  },
];

export const MEMBER_CONTACT_URL = "/contact";
