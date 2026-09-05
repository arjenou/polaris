import { useEffect, useRef, useState } from "react";
import {
  applyCoverDrag,
  DEFAULT_OBJECT_POSITION,
  getCoverOverflow,
  type ObjectPosition,
} from "../lib/objectPosition";

const FRAME_MAX_WIDTH = 560;

export default function BannerFocalPicker({
  imageUrl,
  imageWidth,
  imageHeight,
  aspectRatio,
  position = DEFAULT_OBJECT_POSITION,
  onChange,
}: {
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  aspectRatio: number;
  position?: ObjectPosition;
  onChange: (position: ObjectPosition) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function sync() {
      if (!frame) return;
      setFrameSize({ width: frame.clientWidth, height: frame.clientHeight });
    }

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const naturalWidth = imageWidth ?? 1920;
  const naturalHeight = imageHeight ?? 1080;
  const overflow = getCoverOverflow(naturalWidth, naturalHeight, frameSize.width, frameSize.height);

  function startDrag(e: React.PointerEvent) {
    if (!frameSize.width || !frameSize.height) return;
    e.preventDefault();
    const start = position;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      onChange(
        applyCoverDrag(start, ev.clientX - startX, ev.clientY - startY, overflow.overflowX, overflow.overflowY),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="banner-focal-picker">
      <p className="banner-focal-hint">虚线框内为前台实际展示区域，拖动图片调整显示位置。</p>
      <div
        ref={frameRef}
        className="banner-focal-frame"
        style={{ aspectRatio, maxWidth: FRAME_MAX_WIDTH }}
        onPointerDown={startDrag}
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="banner-focal-image"
          style={{ objectPosition: `${position.x}% ${position.y}%` }}
        />
      </div>
      <p className="banner-focal-meta">
        焦点位置：{Math.round(position.x)}% × {Math.round(position.y)}%
      </p>
    </div>
  );
}
