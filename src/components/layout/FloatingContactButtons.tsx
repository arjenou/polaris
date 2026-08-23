"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./FloatingContactButtons.module.css";

type ContactType = "wechat" | "line";

interface Copy {
  wechatLabel: string;
  lineLabel: string;
  wechatTitle: string;
  lineTitle: string;
  wechatScan: string;
  lineScan: string;
  note: string;
  comingSoon: string;
}

const COPY: Record<"ja" | "zh", Copy> = {
  ja: {
    wechatLabel: "WeChat",
    lineLabel: "LINE",
    wechatTitle: "WeChat相談",
    lineTitle: "LINE相談",
    wechatScan: "微信二維碼をスキャンしてください",
    lineScan: "LINEのQRコードをスキャンしてください",
    note: "サービスのご相談など、\n何でもお気軽にお聞きください",
    comingSoon: "QRコード準備中",
  },
  zh: {
    wechatLabel: "微信",
    lineLabel: "LINE",
    wechatTitle: "微信咨询",
    lineTitle: "LINE咨询",
    wechatScan: "请扫描微信二维码",
    lineScan: "请扫描 LINE 二维码",
    note: "服务咨询等，欢迎随时联系我们",
    comingSoon: "二维码准备中",
  },
};

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function FloatingContactButtons({
  wechatImage,
  lineImage,
}: {
  wechatImage: string | null;
  lineImage: string | null;
}) {
  const pathname = usePathname();
  const locale: "ja" | "zh" = pathname?.startsWith("/zh") ? "zh" : "ja";
  const copy = COPY[locale];
  const [open, setOpen] = useState<ContactType | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const images: Record<ContactType, string | null> = { wechat: wechatImage, line: lineImage };
  const titles: Record<ContactType, string> = { wechat: copy.wechatTitle, line: copy.lineTitle };
  const scans: Record<ContactType, string> = { wechat: copy.wechatScan, line: copy.lineScan };

  return (
    <>
      <div className={styles.wrap}>
        <button
          type="button"
          className={`${styles.button} ${styles.wechat}`}
          onClick={() => setOpen("wechat")}
          aria-label={copy.wechatLabel}
        >
          <span className={styles.iconWrap}>
            <ChatIcon />
          </span>
          <span className={styles.label}>{copy.wechatLabel}</span>
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.line}`}
          onClick={() => setOpen("line")}
          aria-label={copy.lineLabel}
        >
          <span className={styles.iconWrap}>
            <ChatIcon />
          </span>
          <span className={styles.label}>{copy.lineLabel}</span>
        </button>
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(null)}>
          <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.modalHeader} ${styles[open]}`}>
              <span>{titles[open]}</span>
              <button type="button" className={styles.close} onClick={() => setOpen(null)} aria-label="Close">
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.scanText}>{scans[open]}</p>
              {images[open] ? (
                <div className={styles.qrImageWrap}>
                  <Image src={images[open]!} alt="" fill sizes="200px" className={styles.qrImage} />
                </div>
              ) : (
                <div className={styles.qrPlaceholder}>{copy.comingSoon}</div>
              )}
              <p className={styles.note}>{copy.note}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
