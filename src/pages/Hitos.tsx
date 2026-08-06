import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { Milestone } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./EditorialPages.module.css";

const ALL = "all";

export default function Hitos() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [month, setMonth] = useState(ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<Milestone[]>("/milestones/published")
      .then((data) => active && setItems(data))
      .catch(() => active && setError("No se pudieron cargar los hitos."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const months = useMemo(() => {
    const values = Array.from(new Set(items.map((item) => item.event_date.slice(0, 7))));
    return values.sort();
  }, [items]);

  const filtered = useMemo(() => month === ALL ? items : items.filter((item) => item.event_date.startsWith(month)), [items, month]);
  const featured = filtered.find((item) => item.featured) ?? filtered[0] ?? null;
  const cards = featured ? filtered.filter((item) => item.id !== featured.id) : filtered;

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Memoria del capítulo</p>
            <h1>Hitos</h1>
            <p className={styles.heroLead}>Una galería viva de los encuentros, proyectos y decisiones que están construyendo nuestra historia, mes a mes.</p>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.timeline} aria-label="Línea del tiempo mensual">
            <div className={styles.timelineHeader}><div><h2>Nuestra historia</h2><p>Selecciona un mes para recorrer los momentos del capítulo.</p></div></div>
            <div className={styles.monthTrack}>
              <button className={`${styles.monthButton} ${month === ALL ? styles.monthActive : ""}`} onClick={() => setMonth(ALL)}>Todos</button>
              {months.map((key) => <button key={key} className={`${styles.monthButton} ${month === key ? styles.monthActive : ""}`} onClick={() => setMonth(key)}>{formatMonthKey(key)}</button>)}
            </div>
          </section>

          {loading && <div className={styles.empty}>Cargando momentos…</div>}
          {error && <div className={styles.empty}>{error}</div>}
          {!loading && !error && !featured && <div className={styles.empty}>Pronto publicaremos los primeros hitos del capítulo.</div>}

          {featured && (
            <Link to={`/hitos/${featured.slug}`} className={styles.featured}>
              <div className={styles.featuredImage}><img src={mediaUrl(featured.cover_image)} alt={featured.title} /></div>
              <div className={styles.featuredText}>
                <span className={styles.featuredMeta}>{formatDate(featured.event_date)} · {featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <span className={styles.readLink}>Ver este momento →</span>
              </div>
            </Link>
          )}

          {cards.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>{month === ALL ? "Todos los momentos" : formatMonthKey(month)}</h2>
              <div className={styles.grid}>
                {cards.map((item) => (
                  <Link to={`/hitos/${item.slug}`} className={styles.card} key={item.id}>
                    <div className={styles.cardImage}><img src={mediaUrl(item.cover_image)} alt={item.title} loading="lazy" /></div>
                    <div className={styles.cardBody}>
                      <span className={styles.cardMeta}>{formatDate(item.event_date)} · {item.category}</span>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}

function formatMonthKey(key: string): string { const [year, month] = key.split("-").map(Number); return new Date(year, month - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" }); }
function formatDate(value: string): string { return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }); }
