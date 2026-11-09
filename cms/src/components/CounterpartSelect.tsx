import { useEffect, useState } from "react";
import { contentLocaleLabel, type ContentLocale } from "../lib/locale";

interface CounterpartOption {
  id: number;
  title: string;
  date: string;
}

/**
 * Picks the same article in the other language. The public site's language
 * switch uses this link to jump from a detail page straight to its
 * translation (without it, it falls back to the other language's list page).
 */
export default function CounterpartSelect({
  locale,
  value,
  load,
  onChange,
}: {
  /** Locale of the item being edited. */
  locale: ContentLocale;
  value: number | null | undefined;
  /** Loads the candidate items of the *other* locale. */
  load: (otherLocale: ContentLocale) => Promise<CounterpartOption[]>;
  onChange: (id: number | null) => void;
}) {
  const otherLocale: ContentLocale = locale === "ja" ? "zh" : "ja";
  const [options, setOptions] = useState<CounterpartOption[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    load(otherLocale)
      .then((items) => {
        if (!cancelled) setOptions(items);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherLocale]);

  const otherLabel = contentLocaleLabel(otherLocale);

  return (
    <label>
      对应的{otherLabel}内容（可选）
      <select
        value={value ?? ""}
        disabled={options === null && !loadError}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">未关联</option>
        {(options ?? []).map((item) => (
          <option key={item.id} value={item.id}>
            {item.date} {item.title}
          </option>
        ))}
      </select>
      <span className="field-hint">
        {loadError
          ? `${otherLabel}内容列表加载失败，请刷新后重试。`
          : `关联后，前台点击语言切换会直接跳转到对应的${otherLabel}页面；未关联时会跳转到${otherLabel}的列表页。`}
      </span>
    </label>
  );
}
