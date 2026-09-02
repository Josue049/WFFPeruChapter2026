import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";

import { apiRequest } from "../services/api";

import type { VolunteerStory } from "../types";

import { mediaUrl } from "../utils/mediaUrl";

import styles from "./EditorialPages.module.css";
import { useLanguage } from "../i18n/LanguageContext";


const ITEMS_PER_PAGE = 8;

const edition = (value: number) =>
  String(value).padStart(2, "0");


export default function VoluntariosDestacados() {
  const { t } = useLanguage();
  const [stories, setStories] =
    useState<VolunteerStory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);


  useEffect(() => {
  let active = true;

  void apiRequest<VolunteerStory[]>(
    "/volunteer-stories/published"
  )
    .then((all) => {
      if (!active) return;

      setStories(all);
    })
    .catch(() => {
      if (active) {
        setError(t("volunteers.error"));
      }
    })
    .finally(() => {
      if (active) {
        setLoading(false);
      }
    });

  return () => {
    active = false;
  };
}, [t]);

  /*
   * Orden:
   * más reciente primero.
   *
   * 20, 19, 18...
   */
  const orderedStories =
    useMemo(
      () =>
        [...stories].sort(
          (a, b) =>
            b.edition_number -
            a.edition_number
        ),
      [stories]
    );


  /*
   * 8 portadas por página.
   */
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        orderedStories.length /
          ITEMS_PER_PAGE
      )
    );


  const visibleStories =
    useMemo(() => {
      const start =
        (page - 1) *
        ITEMS_PER_PAGE;

      return orderedStories.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [
      orderedStories,
      page,
    ]);


  /*
   * Si desaparecen registros y la página
   * actual deja de existir, volvemos
   * automáticamente a la última.
   */
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);


  const goToPreviousPage = () => {
    setPage((current) =>
      Math.max(
        1,
        current - 1
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const goToNextPage = () => {
    setPage((current) =>
      Math.min(
        totalPages,
        current + 1
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  return (
    <>
      {/* =========================
          HEADER
         ========================= */}

      <TopBar />

      <NavBar />


      {/* =========================
          CONTENIDO
         ========================= */}

      <main
        className={`${styles.page} ${styles.volunteerLanding}`}
      >
        {/*
        HERO DE VOLUNTARIO DESTACADO
        Actualmente desactivado.

        {lead && (
          <Link
            className={styles.volunteerBanner}
            to={`/voluntarios-destacados/${lead.slug}`}
          >
            <div className={styles.volunteerBannerInner}>
              <div className={styles.volunteerBannerCopy}>
                <span className={styles.bannerEyebrow}>
                  {featured?.selection_mode === "scheduled"
                    ? "Edición especial"
                    : "Voluntario destacado"}
                </span>

                <h1>{lead.name}</h1>

                <p className={styles.bannerRole}>
                  {lead.role ||
                    lead.area ||
                    lead.headline}
                </p>

                <p className={styles.bannerHeadline}>
                  {lead.headline}
                </p>

                <span className={styles.bannerButton}>
                  Leer su historia →
                </span>
              </div>

              <div className={styles.volunteerBannerVisual}>
                <div
                  className={styles.bannerBackdrop}
                  aria-hidden="true"
                >
                  <span>WFF</span>
                  <small>
                    PERÚ CHAPTER
                  </small>
                </div>

                <img
                  src={mediaUrl(
                    lead.portrait_image
                  )}
                  alt={lead.name}
                />
              </div>
            </div>
          </Link>
        )}
        */}


        <div className={styles.content}>
          {loading && (
            <div className={styles.empty}>
              {t("volunteers.loading")}
            </div>
          )}


          {error && (
            <div className={styles.empty}>
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            orderedStories.length ===
              0 && (
              <div
                className={styles.empty}
              >
                {t("volunteers.empty")}
              </div>
            )}


          {!loading &&
            !error &&
            orderedStories.length >
              0 && (
              <section
                className={
                  styles.magazineSection
                }
              >
                <div
                  className={
                    styles.magazineSectionHeader
                  }
                >
                  <div>
                    <span>
                      {t("volunteers.editions")}
                    </span>

                    <h2>
                      {t("volunteers.inspiring")}
                    </h2>
                  </div>

                  <p>
                    {t("volunteers.description")}
                  </p>
                </div>


                {/* =========================
                    PORTADAS
                   ========================= */}

                <div
                  className={
                    styles.magazineCoverGrid
                  }
                >
                  {visibleStories.map(
                    (story) => (
                      <Link
                        className={
                          styles.magazineCover
                        }
                        to={`/voluntarios-destacados/${story.slug}`}
                        key={story.id}
                        aria-label={`Leer la historia de ${story.name}`}
                      >
                        <div
                          className={
                            styles.coverMasthead
                          }
                        >
                          <strong>
                            WFF
                          </strong>

                          <span>
                            PERÚ CHAPTER
                          </span>
                        </div>


                        <span
                          className={
                            styles.coverEdition
                          }
                        >
                          N.º{" "}
                          {edition(
                            story.edition_number
                          )}
                        </span>


                        <span
                          className={
                            styles.coverVertical
                          }
                        >
                          {t("volunteer.chapterPride")}
                        </span>


                        <div
                          className={
                            styles.coverPortrait
                          }
                        >
                          <img
                            src={mediaUrl(
                              story.portrait_image
                            )}
                            alt={
                              story.name
                            }
                            loading="lazy"
                          />
                        </div>


                        <div
                          className={
                            styles.coverIdentity
                          }
                        >
                          <h3>
                            {story.name}
                          </h3>

                          <p>
                            {story.area ||
                              story.role ||
                              "World Food Forum Perú"}
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>


                {/* =========================
                    PAGINACIÓN
                   ========================= */}

                {totalPages > 1 && (
                  <nav
                    className={
                      styles.magazinePagination
                    }
                    aria-label="Páginas de voluntarios destacados"
                  >
                    <button
                      type="button"
                      onClick={
                        goToPreviousPage
                      }
                      disabled={
                        page === 1
                      }
                      aria-label="Página anterior"
                    >
                      ←
                    </button>


                    <span>
                      {page} /{" "}
                      {totalPages}
                    </span>


                    <button
                      type="button"
                      onClick={
                        goToNextPage
                      }
                      disabled={
                        page ===
                        totalPages
                      }
                      aria-label="Página siguiente"
                    >
                      →
                    </button>
                  </nav>
                )}
              </section>
            )}
        </div>
      </main>


      <ScrollTopButton />
    </>
  );
}