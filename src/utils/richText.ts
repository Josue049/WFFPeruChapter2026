// Las reflexiones antiguas son texto simple; las nuevas pueden traer formato (HTML).
const ANY_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/;

export const isHtml = (value: string) => ANY_TAG.test(value);

/** Convierte a HTML para abrirlo en el editor sin perder los saltos de línea. */
export function toEditorBody(value: string) {
  if (!value || isHtml(value)) return value;
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, "<br>");
}

/** Caracteres visibles, sin contar el formato. */
export function visibleLength(value: string) {
  const spaced = value.replace(/<(br|\/p|\/div)\b[^>]*>/gi, " ");
  const text = isHtml(value) ? new DOMParser().parseFromString(spaced, "text/html").body.textContent ?? "" : value;
  return text.replace(/\s+/g, " ").trim().length;
}
