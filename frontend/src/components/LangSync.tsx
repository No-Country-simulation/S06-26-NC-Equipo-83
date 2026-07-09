import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function LangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return null;
}
