import { useEffect, useRef, useState } from "react";
import { cropImageToFile, type CropRect } from "../lib/coverImage";

const STAGE_MAX_WIDTH = 720;
const STAGE_MAX_HEIGHT = 460;
const MIN_CROP_PX = 40;

type Handle = "nw" | "ne" | "sw" | "se";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 在给定尺寸内取指定比例的最大居中矩形 */
function centeredRect(width: number, height: number, aspectRatio: number): CropRect {
  let w = width;
  let h = w / aspectRatio;
  if (h > height) {
    h = height;
    w = h * aspectRatio;
  }
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

function resizeRect(
  start: CropRect,
  handle: Handle,
  dx: number,
  dy: number,
  bounds: { width: number; height: number },
  aspectRatio: number,
): CropRect {
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  const growRight = handle === "ne" || handle === "se";
  const growDown = handle === "se" || handle === "sw";

  // 以角点对侧为锚点，宽度决定高度，保证比例固定
  const maxWidth = Math.min(
    growRight ? bounds.width - start.x : right,
    (growDown ? bounds.height - start.y : bottom) * aspectRatio,
  );
  const minWidth = Math.min(MIN_CROP_PX * aspectRatio, maxWidth);
  // 横向、纵向拖动都可改变尺寸，取变化更大的一侧
  const widthFromX = growRight ? start.width + dx : start.width - dx;
  const widthFromY = (growDown ? start.height + dy : start.height - dy) * aspectRatio;
  const target =
    Math.abs(widthFromX - start.width) >= Math.abs(widthFromY - start.width) ? widthFromX : widthFromY;
  const width = clamp(target, minWidth, maxWidth);
  const height = width / aspectRatio;

  return {
    x: growRight ? start.x : right - width,
    y: growDown ? start.y : bottom - height,
    width,
    height,
  };
}

export default function ImageCropper({
  file,
  aspectRatio,
  busy = false,
  title = "调整封面裁剪范围",
  hint,
  onCancel,
  onConfirm,
}: {
  file: File;
  aspectRatio: number;
  busy?: boolean;
  title?: string;
  hint?: string;
  onCancel: () => void;
  onConfirm: (croppedFile: File) => void;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<CropRect | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stageLimit, setStageLimit] = useState(STAGE_MAX_WIDTH);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setNatural(null);
    setCrop(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    function sync() {
      setStageLimit(Math.min(STAGE_MAX_WIDTH, window.innerWidth - 140));
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const scale = natural
    ? Math.min(stageLimit / natural.width, STAGE_MAX_HEIGHT / natural.height, 1)
    : 1;
  const stageWidth = natural ? natural.width * scale : 0;
  const stageHeight = natural ? natural.height * scale : 0;

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNatural({ width: naturalWidth, height: naturalHeight });
    setCrop(centeredRect(naturalWidth, naturalHeight, aspectRatio));
  }

  function startDrag(e: React.PointerEvent, handle: Handle | "move") {
    if (!crop || !natural || busy) return;
    e.preventDefault();
    e.stopPropagation();
    const start = crop;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      if (handle === "move") {
        setCrop({
          ...start,
          x: clamp(start.x + dx, 0, natural.width - start.width),
          y: clamp(start.y + dy, 0, natural.height - start.height),
        });
      } else {
        setCrop(resizeRect(start, handle, dx, dy, natural, aspectRatio));
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function handleConfirm() {
    if (!imageRef.current || !crop) return;
    setError(null);
    try {
      const cropped = await cropImageToFile(imageRef.current, crop, file.name, file.type);
      onConfirm(cropped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片裁剪失败");
    }
  }

  function handleReset() {
    if (!natural) return;
    setCrop(centeredRect(natural.width, natural.height, aspectRatio));
  }

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true">
      <div className="cropper-dialog">
        <h2 className="cropper-title">{title}</h2>
        {hint && <p className="cropper-hint">{hint}</p>}

        <div className="cropper-stage" style={{ width: stageWidth || undefined, height: stageHeight || undefined }}>
          {src && (
            <img
              ref={imageRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="cropper-image"
              style={{ width: stageWidth || undefined, height: stageHeight || undefined }}
            />
          )}
          {crop && (
            <div
              className="cropper-box"
              style={{
                left: crop.x * scale,
                top: crop.y * scale,
                width: crop.width * scale,
                height: crop.height * scale,
              }}
              onPointerDown={(e) => startDrag(e, "move")}
            >
              {(["nw", "ne", "sw", "se"] as Handle[]).map((handle) => (
                <span
                  key={handle}
                  className={`cropper-handle cropper-handle-${handle}`}
                  onPointerDown={(e) => startDrag(e, handle)}
                />
              ))}
            </div>
          )}
        </div>

        {crop && (
          <p className="cropper-meta">
            裁剪尺寸：{Math.round(crop.width)} × {Math.round(crop.height)} px
          </p>
        )}
        {error && <p className="form-error">{error}</p>}

        <div className="cropper-actions">
          <button type="button" className="cropper-reset" onClick={handleReset} disabled={busy || !natural}>
            重置选框
          </button>
          <div className="cropper-actions-right">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
              取消
            </button>
            <button type="button" className="btn-primary" onClick={handleConfirm} disabled={busy || !crop}>
              {busy ? "上传中…" : "确定并上传"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
