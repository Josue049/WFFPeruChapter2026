import data from "../src/seo/pages.json" with { type: "json" };

export const SITE = data.site;
export const PAGES = data.pages;
export const NOINDEX = data.noindex;

export const API_BASE = (
  process.env.VITE_API_URL || "https://api.wffperuchapter.page"
).replace(/\/$/, "");

// Debe mantenerse idéntica a src/utils/slugify.ts
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function jsonLd(object) {
  return JSON.stringify(object).replace(/</g, "\\u003c");
}

export async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`${path} -> ${response.status}`);
  return response.json();
}

export function absoluteMedia(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE}${value}`;
  return `${SITE.origin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function plainText(html, max = 200) {
  const text = String(html ?? "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function firstImage(html) {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(String(html ?? ""));
  return match ? absoluteMedia(match[1]) : "";
}
