// Las reflexiones antiguas son texto simple; las nuevas pueden traer formato (HTML).
const ANY_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/;

export const isHtml = (value: string) => ANY_TAG.test(value);

/** Convierte a HTML para abrirlo en el editor sin perder los saltos de línea. */
export function toEditorBody(value: string) {
  if (!value || isHtml(value)) return value;
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, "<br>");
}

const MURO_TAGS = new Set(["P", "BR", "DIV", "STRONG", "B", "EM", "I", "SPAN"]);
const MURO_SIZES = new Set(["small", "normal", "large", "xlarge"]);

/** Deja solo el formato que el servidor guarda en una reflexión (ver sanitize_muro_body). */
export function cleanMuroHtml(value: string) {
  if (!isHtml(value)) return value;
  const body = new DOMParser().parseFromString(value, "text/html").body;
  for (const element of Array.from(body.querySelectorAll("*"))) {
    if (!MURO_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }
    const size = element.tagName === "SPAN" ? element.getAttribute("data-size") : null;
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name);
    if (size && MURO_SIZES.has(size)) element.setAttribute("data-size", size);
  }
  return body.innerHTML;
}

/** Caracteres visibles, sin contar el formato. */
export function visibleLength(value: string) {
  const spaced = value.replace(/<(br|\/p|\/div)\b[^>]*>/gi, " ");
  const text = isHtml(value) ? new DOMParser().parseFromString(spaced, "text/html").body.textContent ?? "" : value;
  return text.replace(/\s+/g, " ").trim().length;
}
