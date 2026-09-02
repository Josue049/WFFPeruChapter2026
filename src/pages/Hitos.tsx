import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { Milestone } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./EditorialPages.module.css";
import { useLanguage } from "../i18n/LanguageContext";

const INITIAL_VISIBLE = 5;

export default function Hitos() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    let active = true;
    void apiRequest<Milestone[]>("/milestones/published")
      .then((data) => active && setItems(data))
      .catch(() => active && setError(t("milestones.error")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  const ordered = useMemo(
    () => [...items].sort((a, b) => b.event_date.localeCompare(a.event_date) || b.id - a.id),
    [items],
  );
  const shown = ordered.slice(0, visible);

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${styles.hitosPage}`}>
        {/* <header className={styles.hitosHero}>
          <div className={styles.hitosHeroCopy}>
            <span className={styles.hitosKicker}>Hitos</span>
            <h1>Cada paso<br />que nos mueve<br />hacia un <em>futuro</em><br />sostenible</h1>
            <span className={styles.hitosAccent} aria-hidden="true" />
            <p>Momentos que marcan nuestro camino como Capítulo Nacional de Juventud del World Food Forum en Perú.</p>
          </div>
          <div className={styles.hitosHeroVisual}>
            {heroItem ? <img src={mediaUrl(heroItem.cover_image)} alt="Historia del WFF Perú Chapter" /> : <div className={styles.hitosHeroPlaceholder} />}
            <div className={styles.hitosHeroBrand} aria-hidden="true"><strong>WORLD<br />FOOD<br />FORUM</strong><small>PERÚ CHAPTER</small></div>
          </div>
        </header> */}

        <div className={styles.hitosContent}>
          {loading && <div className={styles.empty}>{t("milestones.loading")}</div>}
          {error && <div className={styles.empty}>{error}</div>}
          {!loading && !error && ordered.length === 0 && <div className={styles.empty}>{t("milestones.empty")}</div>}

          {shown.length > 0 && (
            <section className={styles.hitosTimeline} aria-label={t("milestones.aria")}>
              {shown.map((item) => {
                const date = splitDate(item.event_date, locale);
                return (
                  <article className={styles.hitoTimelineRow} key={item.id}>
                    <div className={styles.hitoDate}>
                      <strong>{date.day}</strong><span>{date.month}</span><small>{date.year}</small>
                    </div>
                    <span className={styles.hitoDot} aria-hidden="true" />
                    <Link className={styles.hitoImageLink} to={`/hitos/${item.slug}`}>
                      <img src={mediaUrl(item.cover_image)} alt={item.title} loading="lazy" />
                    </Link>
                    <div className={styles.hitoTimelineCopy}>
                      <div className={styles.hitoMobileMeta}>
                        <span className={styles.hitoMobileDate}>
                          <CalendarSmallIcon />
                          {formatLongDate(item.event_date, locale)}
                        </span>
                        <span className={styles.hitoCategory}>{item.category}</span>
                      </div>
                      <h2>{item.title}</h2>
                      <p>{item.summary}</p>
                      <Link to={`/hitos/${item.slug}`}>{t("milestones.story")} <b>→</b></Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {visible < ordered.length && (
            <button className={styles.moreHitosButton} type="button" onClick={() => setVisible((value) => value + INITIAL_VISIBLE)}>
              {t("milestones.more")} <span>↓</span>
            </button>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}

function CalendarSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 3.5v4M16.5 3.5v4M3.5 9.5h17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function splitDate(value: string, locale: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString(locale, { month: "short" }).replace(".", "").toUpperCase(),
    year: date.getFullYear(),
  };
}

function formatLongDate(value: string, locale: string): string {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
