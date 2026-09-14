"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultLanguage,
  dictionaries,
  languageStorageKey,
  languages,
  type Language,
  type TranslationKey,
} from "./translations";

type TranslationValues = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isLanguage = (value: string | null): value is Language =>
  languages.includes(value as Language);

const interpolate = (text: string, values?: TranslationValues) => {
  if (!values) {
    return text;
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    text,
  );
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);

    if (isLanguage(storedLanguage)) {
      window.setTimeout(() => setLanguageState(storedLanguage), 0);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(languageStorageKey, nextLanguage);
      document.documentElement.lang = nextLanguage;
    };

    const t = (key: TranslationKey, values?: TranslationValues) =>
      interpolate(dictionaries[language][key], values);

    return { language, setLanguage, t };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider.");
  }

  return context;
};

export function T({
  k,
  values,
}: {
  k: TranslationKey;
  values?: TranslationValues;
}) {
  const { t } = useTranslation();

  return <>{t(k, values)}</>;
}

export function MessageText({ value }: { value: string }) {
  const { t } = useTranslation();

  return <>{value in dictionaries.vi ? t(value as TranslationKey) : value}</>;
}

export function EnumLabel({
  group,
  value,
}: {
  group:
    | "projectStatus"
    | "workItemType"
    | "workItemStatus"
    | "priority"
    | "riskLevel"
    | "riskSeverity"
    | "riskStatus"
    | "issueStatus"
    | "reportStatus"
    | "reportTrend";
  value: string;
}) {
  return <T k={`enum.${group}.${value}` as TranslationKey} />;
}

export function LocalizedDate({ value }: { value: string | null }) {
  const { language } = useTranslation();

  if (!value) {
    return <T k="common.none" />;
  }

  return (
    <>
      {new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
        new Date(`${value}T00:00:00`),
      )}
    </>
  );
}

export function LocalizedDateTime({ value }: { value: Date }) {
  const { language } = useTranslation();

  return (
    <>
      {new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(value)}
    </>
  );
}
