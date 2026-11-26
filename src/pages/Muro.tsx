import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { MuroShareModal } from "../components/MuroShareModal";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { useLanguage } from "../i18n/LanguageContext";
import { apiRequest } from "../services/api";
import type { MuroCard, MuroMonth, MuroPage } from "../types/muro";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./Muro.module.css";

const PAGE_SIZE = 18;

export default function Muro() {
  const { t, language } = useLanguage();
  const [months, setMonths] = useState<MuroMonth[]>([]);
  const [month, setMonth] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<MuroCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  // Arrastrar con el mouse para desplazar la barra de meses.
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const onTabsPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("input")) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: e.currentTarget.scrollLeft };
  };
  const onTabsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) d.moved = true;
    if (d.moved) e.currentTarget.scrollLeft = d.startLeft - dx;
  };
  const endTabsDrag = () => { drag.current.active = false; };
  const onTabsClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
  };
  // Semilla nueva en cada visita: el orden de las tarjetas cambia al entrar al Muro, pero se mantiene
  // mientras se filtra o se pulsa "Cargar más" (así no se repiten ni se saltan tarjetas).
  const [seed] = useState(() => Math.floor(Math.random() * 2_147_483_645));
  const location = useLocation();
  const navigate = useNavigate();
  // /muro/enviar redirige aquí con { share: true } para abrir el modal.
  const [sharing, setSharing] = useState(Boolean((location.state as { share?: boolean } | null)?.share));

  const closeShare = useCallback(() => {
    setSharing(false);
    // Limpia el estado de navegación para que recargar no vuelva a abrirlo.
    navigate("/muro", { replace: true, state: null });
  }, [navigate]);

  useEffect(() => {
    apiRequest<MuroMonth[]>("/muro/months").then(setMonths).catch(() => setMonths([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  const monthLabel = (value: string) => {
    const [year, number] = value.split("-").map(Number);
    const label = new Intl.DateTimeFormat(language, { month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(Date.UTC(year, number - 1, 15)));
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const fetchPage = useCallback(
    async (offset: number) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset), seed: String(seed) });
      if (month) params.set("month", month);
      if (debounced) params.set("q", debounced);
      return apiRequest<MuroPage>(`/muro/posts?${params.toString()}`);
    },
    [month, debounced, seed],
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
      <main className={`${styles.page} ${styles.pinPage}`}>
        <div className={styles.pinWrap}>
          <section className={styles.pinBar} aria-label={t("muro.months")}>
            <div className={styles.tabs} role="group" aria-label={t("muro.months")} onPointerDown={onTabsPointerDown} onPointerMove={onTabsPointerMove} onPointerUp={endTabsDrag} onPointerLeave={endTabsDrag} onClickCapture={onTabsClickCapture}>
              <label className={styles.pinSearch}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.6-3.6" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("muro.search")}
                  aria-label={t("muro.search")}
                  maxLength={80}
                />
              </label>
              <button type="button" className={styles.tab} aria-pressed={month === ""} onClick={() => setMonth("")}>
                {t("muro.all")}
              </button>
              {months.map((item) => (
                <button
                  key={item.month}
                  type="button"
                  className={styles.tab}
                  aria-pressed={month === item.month}
                  onClick={() => setMonth(item.month)}
                >
                  {monthLabel(item.month)}
                </button>
              ))}
            </div>
          </section>

          {error && <div className={styles.error} role="alert">{t("muro.error")}</div>}

          <div className={styles.pinGrid} aria-busy={loading}>
            <button type="button" className={styles.pinAdd} onClick={() => setSharing(true)} aria-haspopup="dialog" title={t("muro.share")}>
              <span className={styles.pinAddIcon} aria-hidden="true">+</span>
              <span className={styles.pinAddText}>{t("muro.share")}</span>
            </button>

            {loading
              ? [300, 400, 250, 340, 440, 280, 360, 260].map((height, index) => (
                  <div key={index} className={styles.pinSkeleton} style={{ height }} role="status" aria-label={t("muro.loading")} />
                ))
              : items.map((item) => (
                  <Link key={item.id} to={`/muro/${item.slug}`} className={styles.pin}>
                    {item.cover ? (
                      <div className={styles.pinMedia}>
                        <img
                          src={mediaUrl(item.cover.url)}
                          width={item.cover.width}
                          height={item.cover.height}
                          alt=""
                          loading="lazy"
                        />
                        {item.category && (
                          <span className={styles.pinTag} style={{ background: item.category.color }}>{item.category.name}</span>
                        )}
                      </div>
                    ) : (
                      <div
                        className={styles.pinNote}
                        style={{ ["--c" as string]: item.category?.color ?? "#174f3f" }}
                      >
                        {item.category && <span className={styles.pinNoteTag}>{item.category.name}</span>}
                        <p>{item.excerpt}</p>
                      </div>
                    )}
                    <div className={styles.pinInfo}>
                      <h2>{item.title}</h2>
                      <span>{t("muro.by", { name: item.author_name })}</span>
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && items.length === 0 && !error && <p className={styles.status}>{t("muro.empty")}</p>}

          {!loading && items.length < total && (
            <div className={styles.moreWrap}>
              <button type="button" className={styles.ghost} onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? t("muro.loading") : t("muro.loadMore")}
              </button>
            </div>
          )}
        </div>
      </main>
      {sharing && <MuroShareModal onClose={closeShare} />}
      <ScrollTopButton />
    </>
  );
}
