import { SITE, PAGES, esc, getJson, slugify } from "./_site.js";

function entry(path, { lastmod, priority, changefreq } = {}) {
  return [
    "  <url>",
    `    <loc>${esc(SITE.origin + path)}</loc>`,
    lastmod ? `    <lastmod>${esc(lastmod)}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

const day = (value) => (value ? String(value).split("T")[0] : undefined);

export default async function handler(request, response) {
  const urls = Object.entries(PAGES).map(([path, page]) =>
    entry(path, { priority: page.priority, changefreq: path === "/voces" ? "daily" : "weekly" }),
  );

  const [articles, milestones, volunteers] = await Promise.all([
    getJson("/articles/published").catch(() => []),
    getJson("/milestones/published").catch(() => []),
    getJson("/volunteer-stories/published").catch(() => []),
  ]);

  for (const article of articles) {
    urls.push(
      entry(`/voces/${slugify(article.title)}`, {
        lastmod: day(article.date),
        priority: "0.7",
        changefreq: "monthly",
      }),
    );
  }
  for (const milestone of milestones) {
    if (!milestone.slug) continue;
    urls.push(
      entry(`/hitos/${milestone.slug}`, {
        lastmod: day(milestone.updated_at || milestone.event_date),
        priority: "0.6",
      }),
    );
  }
  for (const story of volunteers) {
    if (!story.slug) continue;
    urls.push(
      entry(`/voluntarios-destacados/${story.slug}`, {
        lastmod: day(story.updated_at),
        priority: "0.6",
      }),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(xml);
}
