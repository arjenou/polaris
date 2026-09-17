import { useEffect, useState } from "react";
import { subscribeMediaUpload } from "../lib/mediaUpload";

export default function UploadProgressOverlay() {
  const [active, setActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return subscribeMediaUpload({
      onStart: (name) => {
        setFileName(name);
        setProgress(0);
        setActive(true);
      },
      onProgress: (percent) => setProgress(percent),
      onEnd: () => {
        setActive(false);
        setFileName("");
        setProgress(0);
      },
    });
  }, []);

  if (!active) return null;

  return (
    <div className="upload-progress-overlay" role="status" aria-live="polite">
      <div className="upload-progress-card">
        <div className="upload-progress-title">正在上传</div>
        <div className="upload-progress-file">{fileName}</div>
        <div className="upload-progress-track">
          <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="upload-progress-percent">{progress}%</div>
      </div>
    </div>
  );
}
