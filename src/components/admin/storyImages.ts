// Imágenes dentro de la historia editorial: se previsualizan en local y se suben al guardar.
import { useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import { apiRequest } from "../../services/api";
import { optimizeEditorialImageFile } from "../../utils/imageOptimizer";
import type { PendingEditorImage } from "../editor/RichTextEditor";

const STORED = 'src="/uploads/';
const shown = () => `src="${API_BASE_URL}/uploads/`;

/** El editor necesita la dirección completa para mostrar las imágenes ya subidas. */
export const toEditorHtml = (html: string) => html.split(STORED).join(shown());
/** En la base se guarda la ruta relativa /uploads/... */
export const toStoredHtml = (html: string) => html.split(shown()).join(STORED);

/** Sube las imágenes nuevas que siguen en el texto y reemplaza sus direcciones temporales. */
async function uploadStoryImages(html: string, pending: Map<string, PendingEditorImage>, token: string) {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const images = Array.from(parsed.querySelectorAll("img[data-pending-image-id]"));
  if (!images.length) return html;

  for (const image of images) {
    const item = pending.get(image.getAttribute("data-pending-image-id") ?? "");
    if (!item) throw new Error("Una imagen de la historia ya no está disponible. Quítala y vuelve a insertarla.");
    const body = new FormData();
    body.append("file", await optimizeEditorialImageFile(item.file));
    const result = await apiRequest<{ url: string }>("/media/images", { method: "POST", body }, { token, redirectOnUnauthorized: true });
    image.setAttribute("src", result.url);
    image.removeAttribute("data-pending-image-id");
  }
  return parsed.body.innerHTML;
}

/** Guarda las imágenes insertadas en el editor hasta que se pulse Guardar. */
export function useStoryImages(token: string) {
  const pending = useRef(new Map<string, PendingEditorImage>());
  return {
    register: (file: File) => {
      const image = { id: `story-${crypto.randomUUID()}`, file, previewUrl: URL.createObjectURL(file) };
      pending.current.set(image.id, image);
      return image;
    },
    upload: (html: string) => uploadStoryImages(html, pending.current, token),
  };
}
