import { createContext } from "react";

// Empoderamiento Femenino no se incluye: es un área fija que no se puede ocultar.
export type SectionKey = "voces" | "muro" | "hitos" | "clases" | "voluntarios";

export type SiteSections = Record<SectionKey, boolean>;

export const SECTION_KEYS: SectionKey[] = ["voces", "muro", "hitos", "clases", "voluntarios"];

export const DEFAULT_SECTIONS: SiteSections = {
  voces: true,
  muro: true,
  hitos: true,
  clases: true,
  voluntarios: true,
};

/**
 * Secciones ocultas desde el código, sin importar lo que diga el panel de administración.
 * No se borra nada: para volver a mostrar una sección, quítala de esta lista.
 */
export const FORCE_HIDDEN_SECTIONS: SectionKey[] = ["muro", "clases", "voluntarios"];

export const SECTION_INFO: Record<SectionKey, { label: string; path: string; description: string }> = {
  voces: { label: "Voces", path: "/voces", description: "Artículos y columnas del capítulo, y el formulario para enviar artículos." },
  muro: { label: "Muro", path: "/muro", description: "Reflexiones enviadas por la comunidad." },
  hitos: { label: "Hitos", path: "/hitos", description: "Línea de tiempo con la memoria visual del capítulo." },
  clases: { label: "Clases", path: "/clases", description: "Campus virtual con cursos, evaluaciones y notas." },
  voluntarios: { label: "Voluntarios destacados", path: "/voluntarios-destacados", description: "Portadas y historias de voluntarios." },
};

export interface SiteSectionsValue {
  sections: SiteSections;
  /** `false` mientras no se sabe el estado real (sin caché y sin respuesta aún). */
  loaded: boolean;
}

export const SiteSectionsContext = createContext<SiteSectionsValue>({ sections: DEFAULT_SECTIONS, loaded: true });
