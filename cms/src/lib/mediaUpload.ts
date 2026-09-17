import type { ToastType } from "./ToastContext";
import { ApiError } from "./apiError";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

export interface MediaUploadResult {
  key: string;
  url: string;
  width: number | null;
  height: number | null;
}

interface UploadProgressListener {
  onStart?: (fileName: string) => void;
  onProgress?: (percent: number) => void;
  onEnd?: () => void;
}

const progressListeners = new Set<UploadProgressListener>();

export function subscribeMediaUpload(listener: UploadProgressListener): () => void {
  progressListeners.add(listener);
  return () => progressListeners.delete(listener);
}

function notifyStart(fileName: string) {
  progressListeners.forEach((listener) => listener.onStart?.(fileName));
}

function notifyProgress(percent: number) {
  progressListeners.forEach((listener) => listener.onProgress?.(percent));
}

function notifyEnd() {
  progressListeners.forEach((listener) => listener.onEnd?.());
}

export function formatMediaSizeLimit(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${bytes / (1024 * 1024)}MB`;
  return `${bytes / 1024}KB`;
}

/** Client-side validation so oversized files fail immediately with a clear message. */
export function validateMediaFile(file: File): string | null {
  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);

  if (!isImage && !isVideo) {
    return "unsupported-type";
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return "image-too-large";
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return "video-too-large";
  }
  return null;
}

/** Friendly copy for upload issues — shown as a soft notice, not a harsh error. */
export function formatUploadFailureMessage(err: unknown, fallback?: string): string {
  const raw = err instanceof Error ? err.message : fallback ?? "upload-failed";
  const code = raw;

  switch (code) {
    case "image-too-large":
    case "图片不能超过 10MB":
      return "图片稍大一些，压缩到 10MB 以内就可以上传了";
    case "video-too-large":
    case "视频不能超过 100MB":
      return "视频超过了 100MB 上限，压缩一下再试吧";
    case "unsupported-type":
    case "仅支持 jpg/png/webp/gif 图片或 mp4/webm/ogg 视频":
      return "这个格式暂时不支持，请换成 JPG、PNG 或 MP4 等常见格式";
    case "upload-failed":
    case "上传失败":
      return "这次没能上传成功，稍后再试一次吧";
    case "上传失败，请检查网络连接后重试":
      return "网络好像不太稳定，可以稍后再试";
    case "上传已取消":
      return "已取消上传";
    default:
      break;
  }

  if (raw.includes("文件过大") || raw.includes("100MB")) {
    return "文件太大了，视频请控制在 100MB 以内";
  }
  if (raw.includes("10MB")) {
    return "图片稍大一些，压缩到 10MB 以内就可以上传了";
  }
  if (raw.includes("网络")) {
    return "网络好像不太稳定，可以稍后再试";
  }
  if (fallback && raw === fallback) {
    return "这次没能上传成功，稍后再试一次吧";
  }
  return raw.endsWith("。") || raw.endsWith("吧") ? raw : `${raw}，请稍后再试`;
}

export function notifyUploadFailure(
  err: unknown,
  showToast: (message: string, type?: ToastType) => void,
  fallback?: string,
) {
  showToast(formatUploadFailureMessage(err, fallback), "notice");
}

export function uploadMediaFile(file: File, folder = "news"): Promise<MediaUploadResult> {
  const validationError = validateMediaFile(file);
  if (validationError) {
    return Promise.reject(new ApiError(validationError, 400));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/media/upload?folder=${encodeURIComponent(folder)}`);
    xhr.withCredentials = true;
    xhr.responseType = "json";

    notifyStart(file.name);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      notifyProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      notifyEnd();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response as MediaUploadResult);
        return;
      }

      const body =
        xhr.response && typeof xhr.response === "object"
          ? (xhr.response as { error?: string })
          : null;
      const message =
        body?.error ??
        (xhr.status === 413 ? "video-too-large" : "upload-failed");
      reject(new ApiError(message, xhr.status));
    };

    xhr.onerror = () => {
      notifyEnd();
      reject(new ApiError("上传失败，请检查网络连接后重试", 0));
    };

    xhr.onabort = () => {
      notifyEnd();
      reject(new ApiError("上传已取消", 0));
    };

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}
