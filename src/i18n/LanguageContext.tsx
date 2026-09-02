import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  LANGUAGE_LOCALES,
  TRANSLATIONS,
} from "./translations";
import type { Language, TranslationKey } from "./translations";

const LANGUAGE_STORAGE_KEY = "wff-preferred-language";
const COUNTRY_SESSION_KEY = "wff-detected-country";

const SPANISH_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "ES", "GQ",
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "PR", "UY", "VE",
]);
const PORTUGUESE_COUNTRIES = new Set(["AO", "BR", "CV", "GW", "MZ", "PT", "ST", "TL"]);
const ITALIAN_COUNTRIES = new Set(["IT", "SM", "VA"]);

function isLanguage(value: string | null): value is Language {
  return value === "es" || value === "en" || value === "it" || value === "pt";
}

export function languageFromCountry(countryCode: string | null | undefined): Language {
  const country = (countryCode ?? "").trim().toUpperCase();
  if (SPANISH_COUNTRIES.has(country)) return "es";
  if (PORTUGUESE_COUNTRIES.has(country)) return "pt";
  if (ITALIAN_COUNTRIES.has(country)) return "it";
  return "en";
}

async function detectCountry(): Promise<string> {
  try {
    const cached = window.sessionStorage.getItem(COUNTRY_SESSION_KEY);
    if (cached) return cached;
  } catch {
    // Session storage may be disabled; detection can continue.
  }

  // Preferred path on Vercel: no third party receives the visitor IP.
  try {
    const response = await fetch("/api/locale", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (response.ok) {
      const data = (await response.json()) as { country?: string };
      const country = (data.country ?? "").toUpperCase();
      if (country && country !== "XX") {
        try {
          window.sessionStorage.setItem(COUNTRY_SESSION_KEY, country);
        } catch {
          // Ignore storage errors.
        }
        return country;
      }
    }
  } catch {
    // Use the public fallback below when the serverless route is unavailable.
  }

  // Static-host fallback. If this service is unavailable, English is used.
  try {
    const response = await fetch("https://ipwho.is/", {
      headers: { Accept: "application/json" },
    });
    if (response.ok) {
      const data = (await response.json()) as { success?: boolean; country_code?: string };
      const country = (data.country_code ?? "").toUpperCase();
      if (data.success !== false && country) {
        try {
          window.sessionStorage.setItem(COUNTRY_SESSION_KEY, country);
        } catch {
          // Ignore storage errors.
        }
        return country;
      }
    }
  } catch {
    // English is the intentional final fallback.
  }

  return "";
}

type LanguageContextValue = {
  language: Language;
  locale: string;
  country: string;
  automatic: boolean;
  detecting: boolean;
  setLanguage: (language: Language) => void;
  useAutomaticLanguage: () => Promise<void>;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [country, setCountry] = useState("");
  const [automatic, setAutomatic] = useState(true);
  const [detecting, setDetecting] = useState(true);

  const applyAutomaticLanguage = useCallback(async () => {
    setDetecting(true);
    const detectedCountry = await detectCountry();
    setCountry(detectedCountry);
    setLanguageState(languageFromCountry(detectedCountry));
    setAutomatic(true);
    setDetecting(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (isLanguage(saved)) {
          if (!cancelled) {
            setLanguageState(saved);
            setAutomatic(false);
            setDetecting(false);
          }
          return;
        }
      } catch {
        // Continue with automatic detection.
      }

      const detectedCountry = await detectCountry();
      if (cancelled) return;
      setCountry(detectedCountry);
      setLanguageState(languageFromCountry(detectedCountry));
      setAutomatic(true);
      setDetecting(false);
    };

    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    setAutomatic(false);
    setDetecting(false);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // Language still changes for this page view.
    }
  }, []);

  const useAutomaticLanguage = useCallback(async () => {
    try {
      window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
      window.sessionStorage.removeItem(COUNTRY_SESSION_KEY);
    } catch {
      // Detection still runs even if storage is unavailable.
    }
    await applyAutomaticLanguage();
  }, [applyAutomaticLanguage]);

  const t = useCallback(
    (key: TranslationKey, values?: Record<string, string | number>) => {
      let value = TRANSLATIONS[language][key] ?? TRANSLATIONS.en[key] ?? key;
      if (values) {
        Object.entries(values).forEach(([name, replacement]) => {
          value = value.replaceAll(`{${name}}`, String(replacement));
        });
      }
      return value;
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: LANGUAGE_LOCALES[language],
      country,
      automatic,
      detecting,
      setLanguage,
      useAutomaticLanguage,
      t,
    }),
    [language, country, automatic, detecting, setLanguage, useAutomaticLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
