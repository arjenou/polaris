"use client";

import { useRef, useState } from "react";
import styles from "./EventVideo.module.css";

const DIRECT_FILE_RE = /\.(mp4|webm|ogg)(\?.*)?$/i;

/** Renders a real embedded video: a native <video> for direct file links,
 * or an <iframe> for embeddable player links (YouTube/Vimeo "embed" URLs).
 * `poster` (CMS-uploaded cover image) replaces the browser's default —
 * often blank — first-frame thumbnail; clicking it starts playback. */
export default function EventVideo({ url, title, poster }: { url: string; title: string; poster?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  if (DIRECT_FILE_RE.test(url)) {
    return (
      <div className={styles.root}>
        <video
          ref={videoRef}
          src={url}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className={styles.media}
          onPlay={() => setStarted(true)}
        />
        {!started && (
          <button
            type="button"
            className={styles.playOverlay}
            aria-label={`播放：${title}`}
            onClick={() => videoRef.current?.play()}
          >
            <span className={styles.playIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <iframe
        src={url}
        title={title}
        className={styles.media}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
