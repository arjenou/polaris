import { IMAGE_UPLOAD_SPECS, type ImageUploadSpecKey } from "../lib/imageUploadSpecs";

/** Compact size label shown next to upload controls. */
export default function UploadSizeHint({ spec }: { spec: ImageUploadSpecKey }) {
  const s = IMAGE_UPLOAD_SPECS[spec];
  return (
    <span className="upload-size-hint">
      推荐 {s.pixels}（{s.ratio}）
    </span>
  );
}
