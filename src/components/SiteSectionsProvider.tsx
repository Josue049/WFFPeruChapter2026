import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "../services/api";
import { DEFAULT_SECTIONS, SECTION_KEYS, SiteSectionsContext } from "../config/siteSections";
import type { SiteSections } from "../config/siteSections";

const CACHE_KEY = "wff.siteSections.v1";
const THEME_CACHE_KEY = "wff.christmas.v1";

function normalize(raw: unknown): SiteSections {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const result = { ...DEFAULT_SECTIONS };
  for (const key of SECTION_KEYS) {
    if (typeof source[key] === "boolean") result[key] = source[key];
  }
  return result;
}

function readCache(): SiteSections | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function readChristmasCache(): boolean {
  try {
    return window.localStorage.getItem(THEME_CACHE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Carga qué secciones públicas están activas (se administra desde el panel). */
export function SiteSectionsProvider({ children }: { children: ReactNode }) {
  const [cached] = useState(readCache);
  const [sections, setSections] = useState<SiteSections>(cached ?? DEFAULT_SECTIONS);
  const [loaded, setLoaded] = useState(cached !== null);
  const [christmas, setChristmas] = useState(readChristmasCache);

  useEffect(() => {
    let active = true;
    apiRequest<{ christmas: boolean }>("/site-theme")
      .then((result) => {
        if (!active) return;
        setChristmas(result.christmas === true);
        try {
          window.localStorage.setItem(THEME_CACHE_KEY, result.christmas ? "1" : "0");
        } catch {
          // Sin almacenamiento disponible: solo se pierde la caché.
        }
      })
      .catch(() => undefined); // si falla, se mantiene lo último conocido
    return () => {
      active = false;
    };
  }, []);

  // Los estilos navideños cuelgan de esta clase (styles/christmas.css).
  useEffect(() => {
    document.documentElement.classList.toggle("theme-navidad", christmas);
  }, [christmas]);

  useEffect(() => {
    let active = true;
    apiRequest<SiteSections>("/site-sections")
      .then((result) => {
        if (!active) return;
        const next = normalize(result);
        setSections(next);
        try {
          window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          // Sin almacenamiento disponible: solo se pierde la caché.
        }
      })
      .catch(() => {
        // Si la API no responde, el sitio se muestra completo en vez de quedar vacío.
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ sections, loaded, christmas }), [sections, loaded, christmas]);
  return <SiteSectionsContext.Provider value={value}>{children}</SiteSectionsContext.Provider>;
}
