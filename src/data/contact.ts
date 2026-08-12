export interface ContactCopy {
  heroTitle: string;
  intro: string;
  steps: {
    input: string;
    confirm: string;
    complete: string;
  };
  fields: {
    name: string;
    namePlaceholder: string;
    furigana: string;
    furiganaPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phoneNote: string;
    phonePlaceholder: string;
    inquiryType: string;
    message: string;
    messagePlaceholder: string;
    contactMethod: string;
  };
  inquiryOptions: string[];
  contactMethodOptions: string[];
  confirmButton: string;
  editButton: string;
  submitButton: string;
  submittingNote: string;
  successTitle: string;
  successBody: string;
  continueLabel: string;
  homeLabel: string;
  qr: {
    title: string;
    wechatLabel: string;
    wechatNote: string;
    lineLabel: string;
    lineNote: string;
    comingSoon: string;
  };
}

export const contactCopyJa: ContactCopy = {
  heroTitle: "お問い合わせ",
  intro:
    "ご不明な点やご相談などがございましたら、お気軽にお問い合わせください。\n担当者より折り返しご連絡いたします。",
  steps: {
    input: "入力",
    confirm: "確認",
    complete: "完了",
  },
  fields: {
    name: "お名前",
    namePlaceholder: "山田 太郎",
    furigana: "フリガナ",
    furiganaPlaceholder: "ヤマダ タロウ",
    email: "メールアドレス",
    emailPlaceholder: "example@email.com",
    phone: "電話番号",
    phoneNote: "※ハイフンなし",
    phonePlaceholder: "09012345678",
    inquiryType: "お問い合わせの種類",
    message: "お問い合わせ内容",
    messagePlaceholder: "ご質問・ご相談内容をご記入ください",
    contactMethod: "ご希望の連絡方法",
  },
  inquiryOptions: [
    "不動産取引",
    "不動産管理",
    "リノベーション",
    "海外ビジネス",
    "創業支援",
    "マンスリー",
    "その他",
  ],
  contactMethodOptions: ["メール", "電話", "両方"],
  confirmButton: "確認する",
  editButton: "修正する",
  submitButton: "送信する",
  submittingNote:
    "※ このフォームは現在デモ表示のみです。送信機能は今後実装予定です。",
  successTitle: "送信が完了しました",
  successBody:
    "（デモ）お問い合わせ内容を確認しました。実際の送信機能は準備中です。担当者より折り返しご連絡いたします。",
  continueLabel: "引き続き相談する",
  homeLabel: "ホームに戻る",
  qr: {
    title: "QRコードで連絡する",
    wechatLabel: "WeChat",
    wechatNote: "中国語対応こちら",
    lineLabel: "Line",
    lineNote: "日本語対応こちら",
    comingSoon: "QRコード準備中",
  },
};

export const contactCopyZh: ContactCopy = {
  heroTitle: "联系我们",
  intro:
    "如有任何疑问或咨询，欢迎随时与我们联系，我们的负责人将尽快与您联系。",
  steps: {
    input: "填写",
    confirm: "确认",
    complete: "完成",
  },
  fields: {
    name: "姓名",
    namePlaceholder: "山田 太郎",
    furigana: "姓名读音（假名）",
    furiganaPlaceholder: "ヤマダ タロウ",
    email: "邮箱地址",
    emailPlaceholder: "example@email.com",
    phone: "电话号码",
    phoneNote: "※无需输入横线",
    phonePlaceholder: "09012345678",
    inquiryType: "咨询类型",
    message: "咨询内容",
    messagePlaceholder: "请填写您的问题或咨询内容",
    contactMethod: "希望的联系方式",
  },
  inquiryOptions: [
    "不动产买卖",
    "资产管理",
    "室内装潢",
    "日本身份规划",
    "创业支援",
    "短租公寓",
    "其他",
  ],
  contactMethodOptions: ["邮件", "电话", "均可"],
  confirmButton: "确认内容",
  editButton: "返回修改",
  submitButton: "提交",
  submittingNote: "※ 当前表单仅为演示效果，提交功能将在后续版本中实现。",
  successTitle: "提交成功",
  successBody:
    "（演示）我们已收到您的咨询内容，实际提交功能正在开发中。我们的负责人将尽快与您联系。",
  continueLabel: "继续咨询",
  homeLabel: "返回首页",
  qr: {
    title: "扫码联系我们",
    wechatLabel: "微信",
    wechatNote: "中文咨询专用",
    lineLabel: "Line",
    lineNote: "日语咨询专用",
    comingSoon: "二维码准备中",
  },
};
