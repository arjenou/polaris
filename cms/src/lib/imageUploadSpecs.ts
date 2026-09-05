/** Recommended upload dimensions aligned with frontend display areas (container 1140px). */
export interface ImageUploadSpec {
  /** Human-readable aspect ratio */
  ratio: string;
  /** Recommended pixel size */
  pixels: string;
  /** Optional extra guidance */
  note?: string;
}

export const IMAGE_UPLOAD_SPECS = {
  teamPhoto: {
    ratio: "11:16（竖版）",
    pixels: "440×640 px 以上",
    note: "首页社员轮播卡片按竖版裁切显示，请使用人物半身照",
  },
  newsCover: {
    ratio: "16:10",
    pixels: "1600×1000 px",
    note: "用于新闻列表与首页卡片封面",
  },
  recommendedCover: {
    ratio: "16:10",
    pixels: "1600×1000 px",
    note: "用于推荐信息列表与首页卡片封面",
  },
  eventCover: {
    ratio: "4:3",
    pixels: "1600×1200 px",
    note: "用于首页轮播与活动列表，前台按 cover 裁切",
  },
  eventHeroImage: {
    ratio: "16:9",
    pixels: "1920×1080 px",
    note: "活动详情页顶部大图；不上传时使用封面图",
  },
  eventVideoPoster: {
    ratio: "16:9",
    pixels: "1920×1080 px",
    note: "视频播放前的封面图，与详情页视频区域一致",
  },
  eventGallery: {
    ratio: "4:3",
    pixels: "1600×1200 px",
    note: "详情页照片墙展示，点击可放大",
  },
  homeHeroSlide: {
    ratio: "约 16:9",
    pixels: "1920×1100 px",
    note: "首页顶部全屏背景轮播，上传后可拖动调整显示区域",
  },
  pageGalleryCarousel: {
    ratio: "16:9",
    pixels: "1920×1080 px",
    note: "页面底部 3D 轮播展示，建议横版风景/项目图",
  },
  pageMidBanner: {
    ratio: "通栏横图",
    pixels: "1920×600 px 以上",
    note: "显示在「私たちが選ばれる理由」与底部轮播之间，按原比例完整显示",
  },
  pageAdvantage: {
    ratio: "538:360",
    pixels: "1076×720 px",
    note: "企业优势条目配图，与前台展示框比例一致",
  },
  groupInfoHero: {
    ratio: "1140:420",
    pixels: "1920×720 px",
    note: "グループ情報页面顶部通栏 Banner，上传后可拖动调整显示区域",
  },
  groupInfoBadge: {
    ratio: "横版 Logo",
    pixels: "800×400 px 以上",
    note: "简介区标题旁水印装饰，完整显示不裁切",
  },
  maintenanceBanner: {
    ratio: "通栏横图",
    pixels: "1920×880 px",
    note: "メンテナンス中页面全屏背景，上传后可拖动调整显示区域",
  },
  groupCompanyLogo: {
    ratio: "818:322",
    pixels: "1636×644 px",
    note: "集团企业 logo 展示框，完整缩放显示不裁切",
  },
  contactQr: {
    ratio: "1:1",
    pixels: "400×400 px 以上",
    note: "联系页悬浮按钮弹窗中的二维码",
  },
} as const satisfies Record<string, ImageUploadSpec>;

export type ImageUploadSpecKey = keyof typeof IMAGE_UPLOAD_SPECS;

export function formatUploadSizeHint(spec: ImageUploadSpec): string {
  return `推荐尺寸：${spec.pixels}（比例 ${spec.ratio}）${spec.note ? `。${spec.note}` : ""}`;
}
