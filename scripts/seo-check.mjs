/*
 * Verificaciones SEO.
 *   node scripts/seo-check.mjs          -> pruebas locales (handlers con API simulada)
 *   node scripts/seo-check.mjs --live   -> además consulta producción (red)
 */
import { existsSync, readFileSync } from "node:fs";

const live = process.argv.includes("--live");
const ORIGIN = "https://www.wffperuchapter.page";
let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "OK  " : "FAIL"} ${msg}`);
  if (!cond) failures++;
};

// ---------- Datos simulados de la API ----------
const articles = [
  { title: "Saberes fermentados, un diálogo intercultural entre el tocosh andino y el kimchi coreano", subtitle: "Sub", body: "<p>Primer párrafo. Segundo párrafo.</p>", date: "2026-10-14", author_name: "A", author_lastname: "B", tag_name: "Ciencia" },
  { title: "Crisis alimentaria: Guardar pan para mayo", subtitle: "", body: "<p>Texto.</p>", date: "2026-10-14", author_name: "C", author_lastname: "D" },
];
const milestone = { title: "Hito de prueba", slug: "hito-de-prueba", summary: "Resumen", body: "<p>Cuerpo del hito.</p>", event_date: "2026-03-09", updated_at: "2026-08-20T00:00:00Z" };

const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  const u = String(url);
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  if (u.endsWith("/index.html")) return new Response('<html><head><title>x</title></head><body><div id="root"></div></body></html>');
  if (u.includes("/articles/published")) return json(articles);
  if (u.includes("/milestones/published/hito-de-prueba")) return json(milestone);
  if (u.includes("/milestones/published/")) return json({}, 404);
  if (u.includes("/milestones/published")) return json([milestone]);
  if (u.includes("/volunteer-stories/published")) return json([]);
  return json({}, 404);
};

const meta = (await import("../api/meta.js")).default;
const sitemap = (await import("../api/sitemap.js")).default;

function run(handler, query, headers = { host: "www.wffperuchapter.page" }) {
  return new Promise((resolve) => {
    const res = { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, send(b) { resolve({ ...this, body: b }); }, redirect(c, l) { resolve({ ...this, statusCode: c, location: l, body: "" }); } };
    handler({ query, headers }, res);
  });
}

// ---------- Rutas de pages.json ----------
const pages = JSON.parse(readFileSync("src/seo/pages.json", "utf8"));
const titles = new Set(), descriptions = new Set();
for (const [path, p] of Object.entries(pages.pages)) {
  const r = await run(meta, { path });
  ok(r.statusCode === 200, `${path} -> 200`);
  ok(r.body.includes(`<link rel="canonical" href="${ORIGIN}${path === "/" ? "/" : path}" />`), `${path} canonical autorreferencial`);
  ok(!/name="robots"/.test(r.body), `${path} sin noindex`);
  ok((r.body.match(/rel="canonical"/g) || []).length === 1, `${path} una sola canonical`);
  ok(!titles.has(p.title) && !descriptions.has(p.description), `${path} título/descripción únicos`);
  titles.add(p.title); descriptions.add(p.description);
}

// ---------- Dinámicas ----------
let r = await run(meta, { path: "/voces/crisis-alimentaria-guardar-pan-para-mayo" });
ok(r.statusCode === 200 && r.body.includes('"@type":"Article"') && r.body.includes("<p>Texto.</p>"), "voces/:slug -> 200 con Article y contenido en HTML inicial");
r = await run(meta, { path: "/voces/saberes-fermentados-un-dialogo-intercultural-entre-el-tocosh-andino-y-el-ki" });
ok(r.statusCode === 301 && r.location.endsWith("el-kimchi-coreano"), "slug truncado -> 301 al artículo completo");
r = await run(meta, { path: "/voces/que-es-esta-seccion" });
ok(r.statusCode === 404 && /noindex/.test(r.body), "voces/inexistente -> 404 noindex");
r = await run(meta, { path: "/hitos/hito-de-prueba" });
ok(r.statusCode === 200 && r.body.includes('"@type":"Article"') && r.body.includes("Cuerpo del hito"), "hitos/:slug -> 200 con JSON-LD y contenido");
r = await run(meta, { path: "/hitos/no-existe" });
ok(r.statusCode === 404, "hitos/inexistente -> 404");
r = await run(meta, { path: "/comunicaciones.html" });
ok(r.statusCode === 404, "ruta desconocida -> 404 (no portada con 200)");
r = await run(meta, { path: "/Admin" });
ok(r.statusCode === 200, "/Admin (ruta válida de la SPA) no da 404");
r = await run(meta, { path: "/admin" });
ok(r.statusCode === 200 && /noindex/.test(r.body), "/admin -> noindex");

// ---------- Sitemap ----------
r = await run(sitemap, {});
const locs = [...r.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
ok(r.statusCode === 200 && locs.length === new Set(locs).size, `sitemap sin duplicados (${locs.length} URLs)`);
ok(locs.every((l) => l.startsWith(`${ORIGIN}/`)), "sitemap: todo absoluto https + dominio canónico");
ok(!locs.some((l) => pages.noindex.some((n) => l.endsWith(n))), "sitemap sin rutas noindex");
ok(!locs.some((l) => l.endsWith(".html")), "sitemap sin .html");

// ---------- vercel.json / robots ----------
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
for (const rd of vercel.redirects) ok(rd.permanent === true && rd.source !== rd.destination, `redirect permanente ${rd.source}`);
const sources = new Set(vercel.redirects.map((x) => x.source));
const app = readFileSync("src/App.tsx", "utf8");
for (const rd of vercel.redirects.filter((x) => x.source.endsWith(".html"))) {
  ok(pages.pages[rd.destination] && app.includes(`path="${rd.destination}"`), `redirect ${rd.source} -> ruta pública existente ${rd.destination}`);
  ok(!sources.has(rd.destination), `redirect ${rd.source} sin cadena ni bucle`);
}
const hostRule = vercel.redirects.find((x) => x.has);
ok(new RegExp(hostRule.has[0].value).test("wffperuchapter.page") && !new RegExp(hostRule.has[0].value).test("www.wffperuchapter.page"), "regla de apex no casa con www (sin bucle)");

// ---------- Identidad de marca y enlazado (sitelinks) ----------
const indexHtml = readFileSync("index.html", "utf8");
const home = pages.pages["/"];
const attr = (re) => (re.exec(indexHtml) || [])[1];
ok(attr(/<title>(.*?)<\/title>/) === home.title, "index.html: <title> coincide con pages.json (HTML inicial = meta de rastreadores)");
ok(attr(/property="og:title"\s+content="(.*?)"/) === home.title && attr(/name="twitter:title"\s+content="(.*?)"/) === home.title, "index.html: og:title y twitter:title coinciden con el título");
ok(indexHtml.includes(`content="${home.description}"`) && (indexHtml.match(new RegExp(home.description.slice(0, 40), "g")) || []).length >= 3, "index.html: description, og y twitter coinciden");
ok(home.title.startsWith("WFF Perú Chapter") && home.title.length <= 60 && home.description.length <= 160, "portada: marca primero, título ≤60 y descripción ≤160");
for (const [path, p] of Object.entries(pages.pages)) ok(p.title.length <= 65 && p.description.length <= 170, `${path}: longitudes de título/descripción razonables`);
ok(attr(/<meta property="og:site_name" content="(.*?)"/) === pages.site.name, "og:site_name coherente con WFF Perú Chapter");
const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(indexHtml)[1])["@graph"];
const byType = (t) => ld.filter((n) => n["@type"] === t);
ok(byType("Organization").length === 1 && byType("WebSite").length === 1, "JSON-LD: un único Organization y un único WebSite");
const org = byType("Organization")[0], site = byType("WebSite")[0];
ok(org.url === `${ORIGIN}/` && site.url === `${ORIGIN}/` && site.name === pages.site.name && org.name === pages.site.name, "JSON-LD: nombre y URL de la marca coherentes");
ok(JSON.stringify(org.sameAs) === JSON.stringify(pages.site.sameAs), "JSON-LD: sameAs idéntico a los perfiles documentados en pages.json");
ok(site.publisher?.["@id"] === org["@id"], "JSON-LD: WebSite referencia a la Organization");
for (const f of ["public/img/iconCapitulo.webp", "public/img/logoWFFPeru.webp"]) ok(existsSync(f), `recurso de marca existe: ${f}`);
ok(/rel="icon"/.test(indexHtml) && /rel="apple-touch-icon"/.test(indexHtml), "favicon y apple-touch-icon declarados");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const footerLinks = [...footer.matchAll(/to: "(\/[^"]*)"/g)].map((m) => m[1]);
const expectedFooter = ["/nosotros", "/hitos", "/voces", "/educacionycultura", "/politicasygobernanza", "/relacionamiento", "/cienciaeinnovacion", "/comunicaciones", "/empoderamiento-femenino"];
for (const path of expectedFooter) ok(footerLinks.includes(path), `footer enlaza ${path} con <Link> (genera <a href>)`);
ok(footerLinks.length === expectedFooter.length && new Set(footerLinks).size === footerLinks.length, "footer: exactamente las 3 secciones y 6 áreas, sin duplicados");
ok(/background:\s*#ffffff/i.test(readFileSync("src/styles/footer.css", "utf8")), "footer: fondo blanco puro");
const header = readFileSync("src/components/Header.tsx", "utf8");
ok(/<h1 className="display-4[^"]*"/.test(header) && !/<h3 className="display-4/.test(header), "cabecera de sección: el título de la página es el H1");
ok(footerLinks.every((l) => pages.pages[l]), "footer: todos los destinos existen en pages.json");
const navbar = readFileSync("src/components/Header/NavBar.tsx", "utf8") + readFileSync("src/components/Header/SubNav.tsx", "utf8");
for (const path of Object.keys(pages.pages).filter((x) => x !== "/")) ok(navbar.includes(`"${path}"`), `menú principal enlaza ${path}`);

const robots = readFileSync("public/robots.txt", "utf8");
ok(robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), "robots.txt declara el sitemap");
ok(!/^Disallow:\s*\/\s*$/m.test(robots), "robots.txt no bloquea todo el sitio");
ok(!/Disallow:\s*\/(assets|img)/.test(robots), "robots.txt no bloquea recursos de renderizado");
ok(/<html lang="es-PE">/.test(readFileSync("index.html", "utf8")), "index.html lang es-PE");

// ---------- Producción (opcional) ----------
if (live) {
  globalThis.fetch = realFetch;
  const UA = { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" };
  const hop = async (url) => { const x = await fetch(url, { redirect: "manual", headers: UA }); return x; };
  const sm = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  for (const u of urls) { const x = await hop(u); ok(x.status === 200, `[live] sitemap ${u} -> ${x.status}`); }
  for (const u of ["http://wffperuchapter.page/", "https://wffperuchapter.page/", "http://www.wffperuchapter.page/", `${ORIGIN}/comunicaciones.html`, `${ORIGIN}/politicasygobernanza.html`, `${ORIGIN}/relacionamiento.html`]) {
    const x = await hop(u); console.log(`INFO [live] ${u} -> ${x.status} ${x.headers.get("location") ?? ""}`);
  }
}

console.log(failures ? `\n${failures} verificación(es) fallaron` : "\nTodas las verificaciones pasaron");
process.exit(failures ? 1 : 0);
