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
    if (!article) return { notFound: true, path };

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
    return {
      title: `${milestone.title} | Hitos WFF Perú`,
      description: plainText(milestone.summary || milestone.body, 200),
      image: absoluteMedia(milestone.cover_image) || DEFAULT_IMAGE,
      type: "article",
      path,
      jsonLd: [],
    };
  }

  match = /^\/voluntarios-destacados\/([^/]+)$/.exec(path);
  if (match) {
    const stories = await getJson("/volunteer-stories/published").catch(() => []);
    const story = stories.find((item) => item.slug === match[1]);
    if (!story) return { notFound: true, path };
    return {
      title: `${story.name} | Voluntarios Destacados WFF Perú`,
      description: plainText(story.headline || story.introduction, 200),
      image: absoluteMedia(story.portrait_image) || DEFAULT_IMAGE,
      type: "article",
      path,
      jsonLd: [],
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
  return `<div id="root"><main><h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p><nav aria-label="Principal"><ul>${links}</ul></nav></main></div>`;
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

    let meta;
    let status = 200;
    let robots = noindex ? "noindex, nofollow" : "";

    if (resolved && !resolved.notFound) {
      meta = resolved;
    } else if (resolved?.notFound) {
      status = 404;
      robots = "noindex";
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
