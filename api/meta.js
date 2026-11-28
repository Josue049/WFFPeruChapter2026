import {
  SITE,
  PAGES,
  NOINDEX,
  esc,
  jsonLd,
  getJson,
  slugify,
  absoluteMedia,
  plainText,
  firstImage,
} from "./_site.js";

/*
 * Devuelve el index.html de la SPA con título, descripción, Open Graph y
 * datos estructurados propios de cada URL. Vercel solo enruta aquí las
 * peticiones de rastreadores (Google, WhatsApp, LinkedIn…) —ver vercel.json—;
 * las personas reciben la SPA normal.
 */

const DEFAULT_IMAGE = SITE.logo;

const normalizePath = (value) => {
  const clean = String(value || "/").split("?")[0].replace(/\/+$/, "");
  return clean || "/";
};

// Rutas reales de la SPA que no tienen ficha en pages.json (secciones
// opcionales o privadas). Siguen respondiendo 200; las privadas llevan noindex.
const KNOWN_SPA_PREFIXES = ["/muro", "/admin", "/loginadmin", "/voces/enviar", "/certificados/validar"];
const isKnownSpaPath = (path) => {
  const lower = path.toLowerCase(); // /Admin y /LoginAdmin son rutas válidas de la SPA
  return KNOWN_SPA_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}/`));
};

// Texto plano del cuerpo para que el HTML inicial tenga contenido sin JS.
const bodyParagraphs = (html, max = 6000) =>
  plainText(html, max)
    .split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¿¡"])/)
    .reduce((chunks, sentence) => {
      const last = chunks[chunks.length - 1];
      if (last && last.length < 400) chunks[chunks.length - 1] = `${last} ${sentence}`;
      else chunks.push(sentence);
      return chunks;
    }, [])
    .map((chunk) => `<p>${esc(chunk)}</p>`)
    .join("");

const isNoindex = (path) =>
  NOINDEX.some((blocked) => path === blocked || path.startsWith(`${blocked}/`));

async function resolveMeta(path) {
  if (PAGES[path]) {
    const page = PAGES[path];
    return {
      title: page.title,
      description: page.description,
      image: DEFAULT_IMAGE,
      type: "website",
      path,
      jsonLd: [
        path === "/"
          ? {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: page.title,
              url: SITE.origin + "/",
            }
          : {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.origin + "/" },
                { "@type": "ListItem", position: 2, name: page.nav, item: SITE.origin + path },
              ],
            },
      ],
    };
  }

  let match = /^\/voces\/([^/]+)$/.exec(path);
  if (match && match[1] !== "enviar") {
    const articles = await getJson("/articles/published").catch(() => []);
    const article = articles.find((item) => slugify(item.title) === match[1]);
    if (!article) {
      // URL truncada o con un slug antiguo: si el inicio identifica a un único
      // artículo, se redirige de forma permanente a su dirección completa.
      if (match[1].length >= 20) {
        const candidates = articles.filter((item) => slugify(item.title).startsWith(match[1]));
        if (candidates.length === 1) {
          return { redirect: `/voces/${slugify(candidates[0].title)}` };
        }
      }
      return { notFound: true, path };
    }

    const author = `${article.author_name} ${article.author_lastname}`.trim();
    const image = firstImage(article.body) || absoluteMedia(article.author_photo) || DEFAULT_IMAGE;
    const description = plainText(article.subtitle || article.body, 200);
    const url = SITE.origin + path;

    return {
      title: `${article.title} | Voces WFF Perú`,
      description,
      image,
      type: "article",
      path,
      content: `<h2>${esc(article.subtitle || "")}</h2>${bodyParagraphs(article.body)}`,
      heading: article.title,
      article: { published: article.date, author, tag: article.tag_name },
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description,
          image: [image],
          datePublished: article.date,
          author: { "@type": "Person", name: author, jobTitle: article.author_cargo || undefined },
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            logo: { "@type": "ImageObject", url: SITE.logo },
          },
          mainEntityOfPage: url,
          articleSection: article.tag_name || undefined,
          inLanguage: "es",
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.origin + "/" },
            { "@type": "ListItem", position: 2, name: "Voces", item: SITE.origin + "/voces" },
            { "@type": "ListItem", position: 3, name: article.title, item: url },
          ],
        },
      ],
    };
  }

  match = /^\/hitos\/([^/]+)$/.exec(path);
  if (match) {
    const milestone = await getJson(`/milestones/published/${encodeURIComponent(match[1])}`).catch(() => null);
    if (!milestone) return { notFound: true, path };
    const url = SITE.origin + path;
    const description = plainText(milestone.summary || milestone.body, 200);
    const image = absoluteMedia(milestone.cover_image) || DEFAULT_IMAGE;
    return {
      title: `${milestone.title} | Hitos WFF Perú`,
      description,
      image,
      type: "article",
      path,
      heading: milestone.title,
      content: bodyParagraphs(milestone.body),
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: milestone.title,
          description,
          image: [image],
          datePublished: milestone.event_date || undefined,
          dateModified: milestone.updated_at || undefined,
          publisher: {
            "@type": "Organization",
            name: SITE.name,
            logo: { "@type": "ImageObject", url: SITE.logo },
          },
          mainEntityOfPage: url,
          inLanguage: "es",
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.origin + "/" },
            { "@type": "ListItem", position: 2, name: "Hitos", item: SITE.origin + "/hitos" },
            { "@type": "ListItem", position: 3, name: milestone.title, item: url },
          ],
        },
      ],
    };
  }

  match = /^\/voluntarios-destacados\/([^/]+)$/.exec(path);
  if (match) {
    const stories = await getJson("/volunteer-stories/published").catch(() => []);
    const story = stories.find((item) => item.slug === match[1] && !item.cover_only);
    if (!story) return { notFound: true, path };
    return {
      title: `${story.name} | Voluntarios Destacados WFF Perú`,
      description: plainText(story.headline || story.introduction, 200),
      image: absoluteMedia(story.portrait_image) || DEFAULT_IMAGE,
      type: "article",
      path,
      heading: story.name,
      content: bodyParagraphs(story.introduction),
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE.origin + "/" },
            { "@type": "ListItem", position: 2, name: "Voluntarios Destacados", item: SITE.origin + "/voluntarios-destacados" },
            { "@type": "ListItem", position: 3, name: story.name, item: SITE.origin + path },
          ],
        },
      ],
    };
  }

  return null;
}

function headBlock(meta, robots) {
  const url = SITE.origin + (meta.path === "/" ? "/" : meta.path);
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    robots ? `<meta name="robots" content="${robots}" />` : "",
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:locale" content="${SITE.locale}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`,
  ];
  if (meta.article) {
    tags.push(`<meta property="article:published_time" content="${esc(meta.article.published)}" />`);
    tags.push(`<meta property="article:author" content="${esc(meta.article.author)}" />`);
    if (meta.article.tag) tags.push(`<meta property="article:section" content="${esc(meta.article.tag)}" />`);
  }
  for (const block of meta.jsonLd ?? []) {
    tags.push(`<script type="application/ld+json">${jsonLd(block)}</script>`);
  }
  return tags.filter(Boolean).join("\n    ");
}

function bodyFallback(meta) {
  const links = Object.entries(PAGES)
    .map(([path, page]) => `<li><a href="${esc(SITE.origin + path)}">${esc(page.nav)}</a></li>`)
    .join("");
  return `<div id="root"><main><h1>${esc(meta.heading || meta.title)}</h1><p>${esc(meta.description)}</p>${meta.content || ""}<nav aria-label="Principal"><ul>${links}</ul></nav></main></div>`;
}

function render(html, meta, robots) {
  const stripped = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["'](?:description|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

  return stripped
    .replace("</head>", `    ${headBlock(meta, robots)}\n  </head>`)
    .replace('<div id="root"></div>', bodyFallback(meta));
}

export default async function handler(request, response) {
  const path = normalizePath(request.query?.path);
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  const proto = request.headers["x-forwarded-proto"] || "https";

  try {
    const shellResponse = await fetch(`${proto}://${host}/index.html`, {
      headers: { "User-Agent": "wff-meta-shell" },
    });
    const shell = await shellResponse.text();

    const resolved = await resolveMeta(path);
    const noindex = isNoindex(path);

    if (resolved?.redirect) {
      response.setHeader("Cache-Control", "public, s-maxage=3600");
      response.redirect(301, resolved.redirect);
      return;
    }

    let meta;
    let status = 200;
    let robots = noindex ? "noindex, nofollow" : "";

    if (resolved && !resolved.notFound) {
      meta = resolved;
    } else if (resolved?.notFound || (!resolved && !isKnownSpaPath(path))) {
      status = 404;
      robots = "noindex";
      response.setHeader("X-Robots-Tag", "noindex");
      meta = {
        title: "Página no encontrada | WFF Perú Chapter",
        description: "La página que buscas no existe o ya no está disponible.",
        image: DEFAULT_IMAGE,
        type: "website",
        path,
        jsonLd: [],
      };
    } else {
      meta = {
        ...PAGES["/"],
        image: DEFAULT_IMAGE,
        type: "website",
        path,
        jsonLd: [],
      };
      if (!noindex) robots = "noindex";
    }

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader("Vary", "User-Agent");
    response.setHeader(
      "Cache-Control",
      status === 200 ? "public, s-maxage=600, stale-while-revalidate=3600" : "public, s-maxage=60",
    );
    response.status(status).send(render(shell, meta, robots));
  } catch {
    response.status(502).send("No se pudo generar la página.");
  }
}
