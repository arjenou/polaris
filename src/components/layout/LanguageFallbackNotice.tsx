import styles from "./LanguageFallbackNotice.module.css";

const COPY = {
  ja: "このページには日本語版がありません。中国語の原文を表示しています。",
  zh: "此页面暂无中文版本，以下为日文原文。",
} as const;

/** Shown when an article only exists in the other language and its original
 * is displayed as a stand-in, so the language switch can stay on the same page. */
export default function LanguageFallbackNotice({ locale }: { locale: "ja" | "zh" }) {
  return (
    <p role="note" className={styles.notice}>
      {COPY[locale]}
    </p>
  );
}
