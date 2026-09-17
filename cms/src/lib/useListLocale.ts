import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isContentLocale, type ContentLocale } from "./locale";

/** Reads the locale segment from the list URL and keeps tab switches in the address bar. */
export function useListLocale(basePath: string) {
  const navigate = useNavigate();
  const { locale: localeParam } = useParams<{ locale: string }>();

  useEffect(() => {
    if (!isContentLocale(localeParam)) {
      navigate(`${basePath}/ja`, { replace: true });
    }
  }, [basePath, localeParam, navigate]);

  const locale: ContentLocale = isContentLocale(localeParam) ? localeParam : "ja";

  function switchLocale(next: ContentLocale) {
    navigate(`${basePath}/${next}`);
  }

  return { locale, switchLocale };
}
