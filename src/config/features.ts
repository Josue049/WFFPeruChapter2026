/**
 * Interruptores de secciones del sitio. Con `false` la sección no aparece en
 * el menú, sus rutas devuelven 404 y desaparece del panel de administración.
 * El código se conserva: basta con poner `true` para reactivarla.
 */
export const FEATURES = {
  muro: false,
  clases: false,
} as const;
