/** 前台列表 / 首页卡片封面的显示比例（16:10），裁剪比例必须与其一致。 */
export const COVER_ASPECT_RATIO = 16 / 10;

/** 前台「グループ企業紹介」logo 展示框比例，裁剪比例必须与其一致，避免 logo 被截断。 */
export const LOGO_ASPECT_RATIO = 818 / 322;

const MAX_OUTPUT_WIDTH = 1600;
const JPEG_QUALITY = 0.9;

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 图片在展示框内的摆放位置，坐标均为展示框显示像素。 */
export interface FitLayout {
  frameWidth: number;
  frameHeight: number;
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
}

function buildFileName(original: string, type: string): string {
  const ext = type === "image/png" ? "png" : "jpg";
  const base = original.replace(/\.[^./\\]+$/, "") || "cover";
  return `${base}-cover.${ext}`;
}

/** 按选框裁剪图片，返回可直接上传的新文件。rect 使用图片原始像素坐标。 */
export async function cropImageToFile(
  source: HTMLImageElement,
  rect: CropRect,
  originalName: string,
  originalType: string,
): Promise<File> {
  const outputWidth = Math.max(1, Math.min(Math.round(rect.width), MAX_OUTPUT_WIDTH));
  const outputHeight = Math.max(1, Math.round((outputWidth * rect.height) / rect.width));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持图片裁剪");

  const keepAlpha = originalType === "image/png";
  const outputType = keepAlpha ? "image/png" : "image/jpeg";
  if (!keepAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, JPEG_QUALITY);
  });
  if (!blob) throw new Error("图片裁剪失败，请重试");

  return new File([blob], buildFileName(originalName, outputType), { type: outputType });
}

/**
 * 把整张图片按 layout 缩放绘制到展示框大小的画布上（不足处留白 / 透明），
 * 用于 logo 这类不能被截断、需要整体缩放进取景框的图片。
 */
export async function fitImageToFile(
  source: HTMLImageElement,
  layout: FitLayout,
  originalName: string,
  originalType: string,
): Promise<File> {
  // 输出至少与展示框等大，最多放大到图片原始分辨率，且不超过 MAX_OUTPUT_WIDTH
  const scale = Math.min(
    MAX_OUTPUT_WIDTH / layout.frameWidth,
    Math.max(1, source.naturalWidth / layout.drawWidth),
  );
  const outputWidth = Math.max(1, Math.round(layout.frameWidth * scale));
  const outputHeight = Math.max(1, Math.round(layout.frameHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持图片处理");

  const keepAlpha = originalType === "image/png";
  const outputType = keepAlpha ? "image/png" : "image/jpeg";
  if (!keepAlpha) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    layout.drawX * scale,
    layout.drawY * scale,
    layout.drawWidth * scale,
    layout.drawHeight * scale,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, JPEG_QUALITY);
  });
  if (!blob) throw new Error("图片处理失败，请重试");

  return new File([blob], buildFileName(originalName, outputType), { type: outputType });
}
