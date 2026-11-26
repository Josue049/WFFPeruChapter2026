import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { FeaturedVolunteer, VolunteerStory } from "../types";
import { FeaturedBlock, MagazineCover } from "../components/volunteers/FeaturedBlock";
import { edition } from "../utils/volunteerEditions";
import { useLanguage } from "../i18n/LanguageContext";
import styles from "./VoluntariosEditorial.module.css";
import legacy from "./EditorialPages.module.css";

const ITEMS_PER_PAGE = 12;

function pageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 6) return Array.from({ length: total }, (_, index) => index + 1);
  const selected = [...new Set([1, total, current - 1, current, current + 1, 2])]
    .filter((number) => number >= 1 && number <= total)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  selected.forEach((number, index) => {
    if (index > 0 && number - selected[index - 1] > 1) result.push("ellipsis");
    result.push(number);
  });
  return result;
}

export default function VoluntariosDestacados() {
  const { t } = useLanguage();
  const [stories, setStories] = useState<VolunteerStory[]>([]);
  const [featured, setFeatured] = useState<FeaturedVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    void Promise.all([
      apiRequest<VolunteerStory[]>("/volunteer-stories/published"),
      // Si no existe una selección editorial, se utilizará la edición más reciente.
      apiRequest<FeaturedVolunteer>("/volunteer-stories/featured").catch(() => null),
    ])
      .then(([all, highlighted]) => {
        if (!active) return;
        setStories(all);
        setFeatured(highlighted);
        setPage(1);
      })
      .catch(() => {
        if (active) setError(t("volunteers.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [t]);

  const orderedStories = useMemo(
    () => [...stories].sort((a, b) => b.edition_number - a.edition_number),
    [stories],
  );
  const lead = featured?.story ?? orderedStories.find((story) => !story.cover_only) ?? null;
  const totalPages = Math.max(1, Math.ceil(orderedStories.length / ITEMS_PER_PAGE));
  const visibleStories = useMemo(
    () => orderedStories.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
    [orderedStories, page],
  );
  const pagination = useMemo(() => pageItems(page, totalPages), [page, totalPages]);

  const changePage = (target: number) => {
    if (target === page || target < 1 || target > totalPages) return;
    setPage(target);
    document.getElementById("volunteer-editions")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${legacy.volunteerLanding}`}>
        <header className={styles.masthead}>
          <span className={styles.mastheadKicker}>{t("volunteers.kickerTop")}</span>
          <h1>{t("volunteers.pageTitle")}</h1>
        </header>

        <div className={styles.content}>
          {loading && <p className={styles.status} role="status">{t("volunteers.loading")}</p>}
          {error && <p className={`${styles.status} ${styles.error}`} role="alert">{error}</p>}
          {!loading && !error && orderedStories.length === 0 && (
            <p className={styles.status}>{t("volunteers.empty")}</p>
          )}

          {!loading && !error && orderedStories.length > 0 && (
            <>
              {lead && <FeaturedBlock lead={lead} scheduled={featured?.selection_mode === "scheduled"} />}

              <section className={styles.issuesSection} id="volunteer-editions">
                <div className={styles.issuesHeader}>
                  <span>{t("volunteers.kickerIssues")}</span>
                  <h2>{t("volunteers.latestIssues")}</h2>
                </div>

                <div className={styles.issueGrid}>
                  {visibleStories.map((story) => (
                    <article className={styles.issueCard} key={story.id}>
                      {story.cover_only ? (
                        <>
                          <MagazineCover story={story} />
                          <div className={styles.issueCaption}>
                            <h3>{story.name}</h3>
                            <p>{story.area || story.role || "WFF Perú"}</p>
                          </div>
                        </>
                      ) : (
                        <Link
                          to={`/voluntarios-destacados/${story.slug}`}
                          className={styles.issueLink}
                          aria-label={`${t("volunteers.readStory")}: ${story.name}`}
                        >
                          <MagazineCover story={story} />
                          <div className={styles.issueCaption}>
                            <h3>{story.name}</h3>
                            <p>{t("volunteers.issuePrefix")} {edition(story.edition_number)} <span aria-hidden="true">|</span> {story.area || story.role || "WFF Perú"}</p>
                          </div>
                        </Link>
                      )}
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className={styles.pagination} aria-label={t("volunteers.pagesLabel")}>
                    <button
                      type="button"
                      className={styles.pageArrow}
                      onClick={() => changePage(page - 1)}
                      disabled={page === 1}
                      aria-label={t("volunteers.previousPage")}
                    >←</button>
                    {pagination.map((item, index) => item === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className={styles.pageEllipsis} aria-hidden="true">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`${styles.pageNumber} ${page === item ? styles.pageActive : ""}`}
                        aria-label={`${t("volunteers.pageLabel")} ${item}`}
                        aria-current={page === item ? "page" : undefined}
                        onClick={() => changePage(item)}
                      >{item}</button>
                    ))}
                    <button
                      type="button"
                      className={styles.pageArrow}
                      onClick={() => changePage(page + 1)}
                      disabled={page === totalPages}
                      aria-label={t("volunteers.nextPage")}
                    >→</button>
                  </nav>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}
