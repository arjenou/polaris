import { useEffect, useRef, useState } from "react";
import { cropImageToFile, fitImageToFile, type CropRect, type FitLayout } from "../lib/coverImage";

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

const MAX_ZOOM = 3;

export default function ImageCropper({
  file,
  aspectRatio,
  busy = false,
  mode = "crop",
  title = "调整封面裁剪范围",
  hint,
  onCancel,
  onConfirm,
}: {
  file: File;
  aspectRatio: number;
  busy?: boolean;
  /** crop：拖动选框裁剪；fit：整图自动缩放进固定比例的取景框 */
  mode?: "crop" | "fit";
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
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setNatural(null);
    setCrop(null);
    setZoom(1);
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
  // fit 模式下舞台是固定比例的取景框，整图缩放后放进去
  const frameWidth = Math.min(stageLimit, STAGE_MAX_HEIGHT * aspectRatio);
  const frameHeight = frameWidth / aspectRatio;
  const fitScale = natural
    ? Math.min(frameWidth / natural.width, frameHeight / natural.height)
    : 1;
  const drawWidth = natural ? natural.width * fitScale * zoom : 0;
  const drawHeight = natural ? natural.height * fitScale * zoom : 0;

  const stageWidth = mode === "fit" ? frameWidth : natural ? natural.width * scale : 0;
  const stageHeight = mode === "fit" ? frameHeight : natural ? natural.height * scale : 0;

  /** 图片小于取景框时保持整体可见，大于时不留缝隙 */
  function clampOffset(x: number, y: number, w: number, h: number) {
    const clampAxis = (value: number, drawSize: number, frameSize: number) =>
      drawSize >= frameSize
        ? clamp(value, frameSize - drawSize, 0)
        : clamp(value, 0, frameSize - drawSize);
    return {
      x: clampAxis(x, w, frameWidth),
      y: clampAxis(y, h, frameHeight),
    };
  }

  function centerOffset(w: number, h: number) {
    return { x: (frameWidth - w) / 2, y: (frameHeight - h) / 2 };
  }

  function handleZoomChange(next: number) {
    if (!natural) return;
    const nextW = natural.width * fitScale * next;
    const nextH = natural.height * fitScale * next;
    // 以取景框中心为锚点缩放
    const cx = (frameWidth / 2 - offset.x) / drawWidth;
    const cy = (frameHeight / 2 - offset.y) / drawHeight;
    setZoom(next);
    setOffset(clampOffset(frameWidth / 2 - cx * nextW, frameHeight / 2 - cy * nextH, nextW, nextH));
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNatural({ width: naturalWidth, height: naturalHeight });
    if (mode === "fit") {
      const s = Math.min(frameWidth / naturalWidth, frameHeight / naturalHeight);
      setZoom(1);
      setOffset(centerOffset(naturalWidth * s, naturalHeight * s));
    } else {
      setCrop(centeredRect(naturalWidth, naturalHeight, aspectRatio));
    }
  }

  function startPan(e: React.PointerEvent) {
    if (!natural || busy) return;
    e.preventDefault();
    const start = offset;
    const startX = e.clientX;
    const startY = e.clientY;
    const onMove = (ev: PointerEvent) => {
      setOffset(
        clampOffset(start.x + (ev.clientX - startX), start.y + (ev.clientY - startY), drawWidth, drawHeight),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
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
    if (!imageRef.current) return;
    setError(null);
    try {
      if (mode === "fit") {
        if (!natural) return;
        const layout: FitLayout = {
          frameWidth,
          frameHeight,
          drawX: offset.x,
          drawY: offset.y,
          drawWidth,
          drawHeight,
        };
        onConfirm(await fitImageToFile(imageRef.current, layout, file.name, file.type));
      } else {
        if (!crop) return;
        onConfirm(await cropImageToFile(imageRef.current, crop, file.name, file.type));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "图片处理失败");
    }
  }

  function handleReset() {
    if (!natural) return;
    if (mode === "fit") {
      setZoom(1);
      setOffset(centerOffset(natural.width * fitScale, natural.height * fitScale));
      return;
    }
    setCrop(centeredRect(natural.width, natural.height, aspectRatio));
  }

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true">
      <div className="cropper-dialog">
        <h2 className="cropper-title">{title}</h2>
        {hint && <p className="cropper-hint">{hint}</p>}

        <div
          className={`cropper-stage${mode === "fit" ? " cropper-stage-fit" : ""}`}
          style={{ width: stageWidth || undefined, height: stageHeight || undefined }}
          onPointerDown={mode === "fit" ? startPan : undefined}
        >
          {src && (
            <img
              ref={imageRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={handleImageLoad}
              className="cropper-image"
              style={
                mode === "fit"
                  ? {
                      width: drawWidth || undefined,
                      height: drawHeight || undefined,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }
                  : { width: stageWidth || undefined, height: stageHeight || undefined }
              }
            />
          )}
          {mode !== "fit" && crop && (
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

        {mode === "fit" && natural && (
          <>
            <div className="cropper-zoom">
              <span>缩放</span>
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                disabled={busy}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
              />
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <p className="cropper-meta">
              原图 {natural.width} × {natural.height} px，已自动缩放至取景框内，可拖动图片调整位置。
            </p>
          </>
        )}
        {mode !== "fit" && crop && (
          <p className="cropper-meta">
            裁剪尺寸：{Math.round(crop.width)} × {Math.round(crop.height)} px
          </p>
        )}
        {error && <p className="form-error">{error}</p>}

        <div className="cropper-actions">
          <button type="button" className="cropper-reset" onClick={handleReset} disabled={busy || !natural}>
            {mode === "fit" ? "重置位置" : "重置选框"}
          </button>
          <div className="cropper-actions-right">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
              取消
            </button>
            <button type="button" className="btn-primary" onClick={handleConfirm} disabled={busy || (mode === "fit" ? !natural : !crop)}>
              {busy ? "上传中…" : "确定并上传"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
