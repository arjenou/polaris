import { useEffect, useState } from "react";
import BannerFocalPicker from "./BannerFocalPicker";
import { DEFAULT_OBJECT_POSITION, type ObjectPosition } from "../lib/objectPosition";

export default function BannerUploadDialog({
  file,
  aspectRatio,
  imageWidth,
  imageHeight,
  busy = false,
  title = "调整 Banner 显示区域",
  onCancel,
  onConfirm,
}: {
  file: File;
  aspectRatio: number;
  imageWidth: number | null;
  imageHeight: number | null;
  busy?: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: (position: ObjectPosition) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [position, setPosition] = useState<ObjectPosition>(DEFAULT_OBJECT_POSITION);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setPosition(DEFAULT_OBJECT_POSITION);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true">
      <div className="cropper-dialog">
        <h2 className="cropper-title">{title}</h2>
        {src && (
          <BannerFocalPicker
            imageUrl={src}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            aspectRatio={aspectRatio}
            position={position}
            onChange={setPosition}
          />
        )}
        <div className="cropper-actions">
          <button
            type="button"
            className="cropper-reset"
            onClick={() => setPosition(DEFAULT_OBJECT_POSITION)}
            disabled={busy}
          >
            重置位置
          </button>
          <div className="cropper-actions-right">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
              取消
            </button>
            <button type="button" className="btn-primary" onClick={() => onConfirm(position)} disabled={busy || !src}>
              {busy ? "上传中…" : "确定并上传"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
