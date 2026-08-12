export interface MoveOutFormCopy {
  title: string;
  intro: string;
  requiredBadge: string;
  optionalBadge: string;
  fields: {
    propertyName: string;
    propertyNamePlaceholder: string;
    roomNumber: string;
    roomNumberPlaceholder: string;
    contractorName: string;
    contractorNamePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    cancelReason: string;
    cancelReasonOtherPlaceholder: string;
    cancelDate: string;
    cancelDateNote: string;
    attendanceDate: string;
    attendanceDateNote: string;
    attendanceNoticeTitle: string;
    attendanceTime: string;
    newAddress: string;
    newAddressPlaceholder: string;
    refundAccountTitle: string;
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolderKana: string;
    leftoverItemsTitle: string;
    leftoverItemsNote: string;
    leftoverItemsAgree: string;
    utilitiesTitle: string;
    utilitiesNote: string;
    utilitiesAgree: string;
    otherMessage: string;
    otherMessagePlaceholder: string;
  };
  cancelReasonOptions: string[];
  accountTypeOptions: string[];
  attendanceTimeOptions: string[];
  attendanceNoticeItems: string[];
  submitLabel: string;
  backLabel: string;
  submittingNote: string;
  successTitle: string;
  successBody: string;
  continueLabel: string;
  homeLabel: string;
}

export const moveOutFormCopyJa: MoveOutFormCopy = {
  title: "退去受付フォーム",
  intro:
    "ご契約物件の退去（解約）をご希望の場合は、以下のフォームにご記入のうえ送信してください。担当者より内容を確認しご連絡いたします。",
  requiredBadge: "必須",
  optionalBadge: "任意",
  fields: {
    propertyName: "物件名",
    propertyNamePlaceholder: "◯◯マンション",
    roomNumber: "部屋番号",
    roomNumberPlaceholder: "101",
    contractorName: "契約者氏名",
    contractorNamePlaceholder: "山田 太郎",
    phone: "電話番号",
    phonePlaceholder: "09012345678",
    email: "メールアドレス",
    emailPlaceholder: "example@email.com",
    cancelReason: "解約理由",
    cancelReasonOtherPlaceholder: "具体的な理由をご記入ください",
    cancelDate: "解約希望日",
    cancelDateNote: "※賃料最終発生日です。契約上の解約予告期間をご注意ください。",
    attendanceDate: "立会希望日",
    attendanceDateNote: "※解約希望日以前の日付をご指定ください。",
    attendanceNoticeTitle: "立会に関する注意事項（必ずご確認ください）",
    attendanceTime: "立会希望時間",
    newAddress: "転居先",
    newAddressPlaceholder: "転居先のご住所をご記入ください",
    refundAccountTitle: "返金先口座",
    bankName: "金融機関名",
    branchName: "支店名",
    accountType: "口座種別",
    accountNumber: "口座番号",
    accountHolderKana: "口座名義（カタカナ）",
    leftoverItemsTitle: "残置物について",
    leftoverItemsNote:
      "処分予定の自転車や粗大ごみ等を無断で放置することは絶対におやめください。万が一、無断放置が発生した場合は、当社指定の業者により処分を行います。その際にかかる処分費用は一括でご請求いたしますので、あらかじめご了承ください。",
    leftoverItemsAgree: "上記内容に同意します",
    utilitiesTitle: "インフラ解約について",
    utilitiesNote:
      "水道・電気については、退去時の設備状況点検の為、立会当日まで解約しないようお願いいたします。一方、ガス・ネットについては、事前に解約手続きを完了させてください。",
    utilitiesAgree: "上記内容に同意します",
    otherMessage: "その他伝達事項",
    otherMessagePlaceholder: "その他ご連絡事項があればご記入ください",
  },
  cancelReasonOptions: [
    "転勤",
    "転職",
    "自宅購入",
    "更新を機に",
    "部屋数不足/狭い",
    "結婚",
    "独立",
    "賃料が高い",
    "物件老朽化",
    "設備に不満",
    "その他",
  ],
  accountTypeOptions: ["普通（フツウ）", "当座（トウザ）"],
  attendanceTimeOptions: [
    "10:00〜10:30",
    "11:00〜11:30",
    "12:00〜12:30",
    "13:00〜13:30",
    "14:00〜14:30",
    "15:00〜15:30",
    "16:00〜16:30",
    "17:00〜17:30",
    "18:00〜",
  ],
  attendanceNoticeItems: [
    "土日祝に指定する場合には、休日立会対応料金（税込11,000円）が別途発生致します。予めご了承ください。",
    "立会時間までに、部屋内は荷物全部撤去済みの状態でお願いします。",
    "立会完了後、その場で鍵を全部回収致しますので、二度と部屋に戻られないこととなりますのでご注意ください。",
    "立会の際に、借主に帰する責任（例：残置物あり、ご不在）で立会できない場合、立会日程再調整手数料（税込11,000円）が別途発生致します。予めご了承ください。",
    "立会後、借主に帰す責任（例：ガス停止立会、郵便物・書類の回収等）により再度室内対応が必要となる場合、事務手数料（税込11,000円）が別途発生致します。予めご了承ください。",
  ],
  submitLabel: "送信する",
  backLabel: "戻る",
  submittingNote: "※ このフォームは現在デモ表示のみです。送信機能は今後実装予定です。",
  successTitle: "送信が完了しました",
  successBody:
    "（デモ）退去受付フォームの内容を確認しました。実際の送信機能は準備中です。担当者より折り返しご連絡いたします。",
  continueLabel: "フォームを見直す",
  homeLabel: "ホームに戻る",
};

export const moveOutFormCopyZh: MoveOutFormCopy = {
  title: "退租受理表单",
  intro:
    "如您希望办理房屋退租（解约）手续，请填写以下表单并提交，我们的负责人将在核实信息后与您联系。",
  requiredBadge: "必填",
  optionalBadge: "选填",
  fields: {
    propertyName: "物业名称",
    propertyNamePlaceholder: "◯◯公寓",
    roomNumber: "房间号",
    roomNumberPlaceholder: "101",
    contractorName: "签约人姓名",
    contractorNamePlaceholder: "山田 太郎",
    phone: "电话号码",
    phonePlaceholder: "09012345678",
    email: "邮箱地址",
    emailPlaceholder: "example@email.com",
    cancelReason: "退租原因",
    cancelReasonOtherPlaceholder: "请填写具体原因",
    cancelDate: "希望退租日期",
    cancelDateNote: "※该日期为租金最后计算日，请注意合同约定的退租通知期限。",
    attendanceDate: "希望现场验收日期",
    attendanceDateNote: "※请指定不晚于希望退租日期的日期。",
    attendanceNoticeTitle: "关于现场验收的注意事项（请务必确认）",
    attendanceTime: "希望验收时间段",
    newAddress: "迁居地址",
    newAddressPlaceholder: "请填写迁居后的地址",
    refundAccountTitle: "退款账户信息",
    bankName: "银行名称",
    branchName: "支行名称",
    accountType: "账户类型",
    accountNumber: "账号",
    accountHolderKana: "账户名义（片假名）",
    leftoverItemsTitle: "关于遗留物品",
    leftoverItemsNote:
      "请勿擅自留下计划丢弃的自行车或大件垃圾等物品。如发生擅自留置的情况，本公司将委托指定业者进行处理，由此产生的处理费用将一并向您收取，敬请谅解。",
    leftoverItemsAgree: "我同意以上内容",
    utilitiesTitle: "关于水电气网络等解约",
    utilitiesNote:
      "自来水、电力请在验收当天之前不要办理解约手续，以便退租时确认设备状况；燃气、网络请提前完成解约手续。",
    utilitiesAgree: "我同意以上内容",
    otherMessage: "其他备注事项",
    otherMessagePlaceholder: "如有其他需告知事项，请填写在此",
  },
  cancelReasonOptions: [
    "工作调动",
    "跳槽",
    "购买自住房",
    "借续约之机",
    "房间数量不足/狭小",
    "结婚",
    "独立生活",
    "房租过高",
    "房屋老化",
    "设施不满意",
    "其他",
  ],
  accountTypeOptions: ["普通账户", "支票账户"],
  attendanceTimeOptions: [
    "10:00〜10:30",
    "11:00〜11:30",
    "12:00〜12:30",
    "13:00〜13:30",
    "14:00〜14:30",
    "15:00〜15:30",
    "16:00〜16:30",
    "17:00〜17:30",
    "18:00〜",
  ],
  attendanceNoticeItems: [
    "如指定周六、周日或节假日进行验收，将另行收取假日验收服务费（含税11,000日元），敬请谅解。",
    "在验收时间之前，请确保房间内所有物品已全部搬出。",
    "验收完成后，我们将当场收回全部钥匙，此后将无法再次进入房间，请知悉。",
    "如因承租人原因（如：仍有遗留物品、本人不在场等）导致无法进行验收，将另行收取验收日程调整手续费（含税11,000日元），敬请谅解。",
    "验收后如因承租人原因（如：燃气停用验收、邮件文件领取等）需再次上门处理，将另行收取事务手续费（含税11,000日元），敬请谅解。",
  ],
  submitLabel: "提交",
  backLabel: "返回",
  submittingNote: "※ 当前表单仅为演示效果，提交功能将在后续版本中实现。",
  successTitle: "提交成功",
  successBody:
    "（演示）我们已收到您的退租申请内容，实际提交功能正在开发中。我们的负责人将尽快与您联系。",
  continueLabel: "重新填写",
  homeLabel: "返回首页",
};
