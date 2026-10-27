import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { useLanguage } from "../i18n/LanguageContext";
import { apiRequest } from "../services/api";
import type { MuroCard, MuroCategory, MuroPage } from "../types/muro";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./Muro.module.css";

const PAGE_SIZE = 18;

export default function Muro() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<MuroCategory[]>([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<MuroCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    apiRequest<MuroCategory[]>("/muro/categories").then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const fetchPage = useCallback(
    async (offset: number) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (category) params.set("category", category);
      if (debounced) params.set("q", debounced);
      return apiRequest<MuroPage>(`/muro/posts?${params.toString()}`);
    },
    [category, debounced],
  );

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(false);
    fetchPage(0)
      .then((page) => {
        if (id !== requestId.current) return;
        setItems(page.items);
        setTotal(page.total);
      })
      .catch(() => {
        if (id === requestId.current) setError(true);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await fetchPage(items.length);
      setItems((current) => [...current, ...page.items]);
      setTotal(page.total);
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>WFF Perú Chapter</p>
            <h1>{t("muro.title")}</h1>
            <p>{t("muro.subtitle")}</p>
            <div className={styles.heroActions}>
              <Link to="/muro/enviar" className={styles.primary}>{t("muro.share")}</Link>
            </div>
          </div>
        </header>

        <div className={styles.wrap}>
          <section className={styles.toolbar} aria-label="Filtros">
            <label className={styles.search}>
              <span aria-hidden="true">🔍</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("muro.search")}
                aria-label={t("muro.search")}
                maxLength={80}
              />
            </label>
            <div className={styles.chips} role="group" aria-label="Categorías">
              <button type="button" className={styles.chip} aria-pressed={category === ""} onClick={() => setCategory("")}>
                {t("muro.all")}
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.chip}
                  style={{ ["--c" as string]: item.color }}
                  aria-pressed={category === item.slug}
                  onClick={() => setCategory(category === item.slug ? "" : item.slug)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          {error && <div className={styles.error} role="alert">{t("muro.error")}</div>}

          {loading ? (
            <div className={styles.masonry} aria-busy="true" role="status" aria-label={t("muro.loading")} style={{ marginTop: 26 }}>
              {[260, 340, 220, 300, 380, 250].map((height, index) => (
                <div key={index} className={styles.skeleton} style={{ height }} />
              ))}
            </div>
          ) : items.length === 0 && !error ? (
            <p className={styles.status}>{t("muro.empty")}</p>
          ) : (
            <>
              <p className={styles.resultsInfo} aria-live="polite">{total} {total === 1 ? "reflexión" : "reflexiones"}</p>
              <div className={styles.masonry}>
                {items.map((item, index) => {
                  const text = !item.cover && index % 4 === 1;
                  return (
                    <Link key={item.id} to={`/muro/${item.slug}`} className={`${styles.tile} ${text ? styles.quoteTile : ""}`}>
                      {item.cover && (
                        <img
                          src={mediaUrl(item.cover.url)}
                          width={item.cover.width}
                          height={item.cover.height}
                          alt=""
                          loading="lazy"
                        />
                      )}
                      <div className={styles.tileBody}>
                        {item.category && (
                          <span className={styles.tag} style={{ background: item.category.color }}>{item.category.name}</span>
                        )}
                        <h2>{item.title}</h2>
                        <p>{item.excerpt}</p>
                        <span className={styles.byline}>{t("muro.by", { name: item.author_name })}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {items.length < total && (
                <div className={styles.moreWrap}>
                  <button type="button" className={styles.ghost} onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? t("muro.loading") : t("muro.loadMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}
