import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import translations, { type Lang, type TranslationKeys } from "@/i18n/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem("lang") as Lang) || "ar";
  });

  const isRTL = lang === "ar";

  const setLang = (l: Lang) => {
    localStorage.setItem("lang", l);
    setLangState(l);
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const t = translations[lang] as TranslationKeys;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
