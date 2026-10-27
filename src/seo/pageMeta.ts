import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import data from "./pages.json";

const ORIGIN = data.site.origin;
const DEFAULT_IMAGE = data.site.logo;

type PageEntry = { title: string; description: string };
const PAGES = data.pages as Record<string, PageEntry>;

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: object[];
}

function setMeta(selector: string, attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

/** Aplica los metadatos de la página y devuelve una función que los restaura. */
export function applyPageMeta(meta: PageMeta): () => void {
  const previousTitle = document.title;
  const previousCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const previousDescription = document.head
    .querySelector<HTMLMetaElement>('meta[name="description"]')
    ?.content;

  const url = ORIGIN + (meta.path === "/" ? "/" : meta.path);
  const image = meta.image || DEFAULT_IMAGE;

  document.title = meta.title;
  setMeta('meta[name="description"]', "name", "description", meta.description);
  setCanonical(url);
  setMeta('meta[property="og:title"]', "property", "og:title", meta.title);
  setMeta('meta[property="og:description"]', "property", "og:description", meta.description);
  setMeta('meta[property="og:url"]', "property", "og:url", url);
  setMeta('meta[property="og:image"]', "property", "og:image", image);
  setMeta('meta[property="og:type"]', "property", "og:type", meta.type ?? "website");
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);
  setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);

  const scripts = (meta.jsonLd ?? []).map((block) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(block).replace(/</g, "\\u003c");
    document.head.appendChild(script);
    return script;
  });

  return () => {
    scripts.forEach((script) => script.remove());
    document.title = previousTitle;
    if (previousCanonical) setCanonical(previousCanonical);
    if (previousDescription) {
      setMeta('meta[name="description"]', "name", "description", previousDescription);
    }
  };
}

/** Metadatos de una página dinámica (artículo, etc.). */
export function usePageMeta(meta: PageMeta | null) {
  const key = meta ? JSON.stringify(meta) : "";

  useEffect(() => {
    if (!meta) return;
    return applyPageMeta(meta);
    // key resume el contenido de meta: evita reaplicar si no cambió.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Aplica título y descripción propios a las páginas estáticas conocidas. */
export function RouteMeta() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const page = PAGES[path];

  usePageMeta(page ? { title: page.title, description: page.description, path } : null);
  return null;
}
