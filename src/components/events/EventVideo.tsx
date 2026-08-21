import styles from "./EventVideo.module.css";

const DIRECT_FILE_RE = /\.(mp4|webm|ogg)(\?.*)?$/i;

/** Renders a real embedded video: a native <video> for direct file links,
 * or an <iframe> for embeddable player links (YouTube/Vimeo "embed" URLs). */
export default function EventVideo({ url, title }: { url: string; title: string }) {
  if (DIRECT_FILE_RE.test(url)) {
    return <video src={url} controls playsInline preload="metadata" className={styles.media} />;
  }

  return (
    <iframe
      src={url}
      title={title}
      className={styles.media}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
