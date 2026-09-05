import { IMAGE_UPLOAD_SPECS, type ImageUploadSpecKey } from "../lib/imageUploadSpecs";

export default function UploadSizeHint({ spec }: { spec: ImageUploadSpecKey }) {
  const s = IMAGE_UPLOAD_SPECS[spec];
  return (
    <span className="field-hint">
      推荐尺寸：<strong>{s.pixels}</strong>（比例 {s.ratio}）
      {s.note ? `。${s.note}` : ""}
    </span>
  );
}
