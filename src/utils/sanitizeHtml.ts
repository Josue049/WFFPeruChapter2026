import { mediaUrl } from "./mediaUrl";

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "a",
  "img",
  "figure",
  "figcaption",
  "span",
  "div",
]);

const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "svg",
  "math",
  "template",
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "data-pending-image-id"]),
  span: new Set(["data-size"]),
};

function isSafeUrl(value: string, attribute: "href" | "src"): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith("/") || normalized.startsWith("#")) return true;

  const allowedProtocols =
    attribute === "href"
      ? ["https:", "http:", "mailto:", "tel:"]
      : ["https:", "http:", "blob:"];

  try {
    const parsed = new URL(value, window.location.origin);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeHtml(html: string): string {
  if (!html || typeof DOMParser === "undefined") return "";

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(
    `<div id="sanitizer-root">${html}</div>`,
    "text/html",
  );
  const root = documentFragment.getElementById("sanitizer-root");
  if (!root) return "";

  for (const element of Array.from(root.querySelectorAll("*"))) {
    const tagName = element.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tagName)) {
      element.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }

    const allowedForTag = ALLOWED_ATTRIBUTES[tagName] ?? new Set<string>();
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const isEventHandler = name.startsWith("on");

      if (isEventHandler || !allowedForTag.has(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if ((name === "href" || name === "src") && !isSafeUrl(attribute.value, name)) {
        element.removeAttribute(attribute.name);
      }
    }

    if (tagName === "img") {
      const src = element.getAttribute("src");
      if (src) element.setAttribute("src", mediaUrl(src));
      element.setAttribute("loading", "lazy");
    }
  }

  return root.innerHTML;
}
