export type ContentLocale = "ja" | "zh";

export function isContentLocale(value: string | undefined): value is ContentLocale {
  return value === "ja" || value === "zh";
}

export function contentLocaleLabel(locale: ContentLocale): string {
  return locale === "zh" ? "中文" : "日语";
}
