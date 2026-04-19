export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                      // separa tildes
    .replace(/[\u0300-\u036f]/g, "")       // elimina tildes
    .replace(/[^a-z0-9\s-]/g, "")         // solo letras, números, guiones
    .trim()
    .replace(/\s+/g, "-")                  // espacios → guiones
    .replace(/-+/g, "-");                  // guiones dobles → uno
}