"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function isZhPath(pathname: string | null): boolean {
  return pathname === "/zh" || (pathname?.startsWith("/zh/") ?? false);
}

export default function LocaleHtmlAttributes() {
  const pathname = usePathname();
  const isZh = isZhPath(pathname);

  useEffect(() => {
    document.documentElement.lang = isZh ? "zh-CN" : "ja";
    document.body.classList.toggle("locale-zh", isZh);
  }, [isZh]);

  return null;
}
