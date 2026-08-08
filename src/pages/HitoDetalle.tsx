import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { Milestone } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import styles from "./EditorialPages.module.css";

export default function HitoDetalle() {
  const { slug } = useParams();
  const [item, setItem] = useState<Milestone | null>(null);
  const [allItems, setAllItems] = useState<Milestone[]>([]);
  const [slide, setSlide] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let active = true;
    void Promise.all([
      apiRequest<Milestone>(`/milestones/published/${encodeURIComponent(slug)}`),
      apiRequest<Milestone[]>("/milestones/published"),
    ])
      .then(([selected, all]) => {
        if (!active) return;
        setItem(selected);
        setAllItems(all);
        setSlide(0);
      })
      .catch(() => active && setError("Este hito no está disponible."));
    return () => { active = false; };
  }, [slug]);

  const slides = useMemo(() => {
    if (!item) return [];
    return Array.from(new Set([item.cover_image, ...(item.gallery ?? [])].filter(Boolean)));
  }, [item]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const related = useMemo(
    () => allItems.filter((candidate) => candidate.id !== item?.id).slice(0, 3),
    [allItems, item?.id],
  );

  const moveSlide = (direction: number) => {
    if (!slides.length) return;
    setSlide((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${styles.hitoDetailPage}`}>
        {error && <div className={styles.empty}>{error}</div>}
        {!item && !error && <div className={styles.empty}>Cargando hito…</div>}
        {item && (
          <>
            <div className={styles.hitoDetailTop}>
              <div className={styles.hitoDetailIntro}>
                <Link className={styles.hitoBack} to="/hitos">← Volver a Hitos</Link>
                <span className={styles.hitoBadge}>Hito</span>
                <h1>{item.title}</h1>
                <span className={styles.hitoTitleAccent} />
                <div className={styles.hitoMetaRow}>
                  <span className={styles.hitoMetaItem}>
                    <CalendarIcon />
                    <span>{formatDate(item.event_date)}</span>
                  </span>
                  {item.location && (
                    <span className={styles.hitoMetaItem}>
                      <LocationIcon />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>
                <p>{item.summary}</p>
              </div>

              <div className={styles.hitoSlider}>
                {slides.map((image, index) => (
                  <img className={index === slide ? styles.hitoSlideActive : ""} key={image} src={mediaUrl(image)} alt={`${item.title}, imagen ${index + 1}`} />
                ))}
                {slides.length > 1 && (
                  <>
                    <button type="button" className={`${styles.sliderArrow} ${styles.sliderPrev}`} onClick={() => moveSlide(-1)} aria-label="Imagen anterior">‹</button>
                    <button type="button" className={`${styles.sliderArrow} ${styles.sliderNext}`} onClick={() => moveSlide(1)} aria-label="Imagen siguiente">›</button>
                    <div className={styles.sliderDots}>{slides.map((image, index) => <button type="button" key={image} className={index === slide ? styles.sliderDotActive : ""} onClick={() => setSlide(index)} aria-label={`Ver imagen ${index + 1}`} />)}</div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.hitoDetailBody}>
              <article className={styles.hitoStory}>
                <div className={styles.hitoSectionHeading}><span>◉</span><h2>El hito</h2></div>
                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
              </article>

              <aside className={styles.relatedHitos}>
                <h2>Hitos relacionados</h2>
                {related.length === 0 && <p>Pronto habrá más momentos para explorar.</p>}
                {related.map((candidate) => (
                  <Link key={candidate.id} to={`/hitos/${candidate.slug}`}>
                    <img src={mediaUrl(candidate.cover_image)} alt="" loading="lazy" />
                    <span><strong>{candidate.title}</strong><small>{formatDate(candidate.event_date)}</small></span>
                  </Link>
                ))}
                <Link className={styles.relatedAllLink} to="/hitos">Ver todos los hitos →</Link>
              </aside>
            </div>
          </>
        )}
      </main>
      <ScrollTopButton />
    </>
  );
}

function formatDate(value: string): string {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}


function CalendarIcon() {
  return (
    <svg className={styles.hitoMetaIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="7" y="13" width="3" height="3" rx=".6" fill="currentColor" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className={styles.hitoMetaIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}
