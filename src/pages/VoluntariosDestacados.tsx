import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type {
  FeaturedVolunteer,
  VolunteerStory,
} from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./EditorialPages.module.css";

const ITEMS_PER_PAGE = 8;

const edition = (value: number) =>
  String(value).padStart(2, "0");

export default function VoluntariosDestacados() {
  const [stories, setStories] =
    useState<VolunteerStory[]>([]);

  const [featured, setFeatured] =
    useState<FeaturedVolunteer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  useEffect(() => {
    let active = true;

    void Promise.all([
      apiRequest<VolunteerStory[]>(
        "/volunteer-stories/published"
      ),

      apiRequest<FeaturedVolunteer>(
        "/volunteer-stories/featured",
        {
          cache: "no-store",
        }
      ),
    ])
      .then(([all, selected]) => {
        if (!active) {
          return;
        }

        setStories(all);
        setFeatured(selected);
      })
      .catch(() => {
        if (active) {
          setError(
            "No se pudieron cargar las historias."
          );
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
  }, []);

  const lead =
    featured?.story ?? null;

  /*
   * Orden:
   *
   * edición más nueva -> edición más antigua
   *
   * 20, 19, 18, 17...
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
   * Número total de páginas.
   *
   * 8 historias -> 1
   * 9 historias -> 2
   * 20 historias -> 3
   */
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        orderedStories.length /
          ITEMS_PER_PAGE
      )
    );

  /*
   * Historias visibles en la página actual.
   */
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
   * Si por algún motivo se eliminan historias
   * mientras estamos en una página que ya no existe,
   * regresamos automáticamente a la última válida.
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
  };

  const goToNextPage = () => {
    setPage((current) =>
      Math.min(
        totalPages,
        current + 1
      )
    );
  };

  return (
    <>
      <main
        className={`${styles.page} ${styles.volunteerLanding}`}
      >
        {/*
        {lead && (
          <Link
            className={styles.volunteerBanner}
            to={`/voluntarios-destacados/${lead.slug}`}
          >
            ...
          </Link>
        )}
        */}

        <div className={styles.content}>
          {loading && (
            <div
              className={styles.empty}
            >
              Preparando la edición…
            </div>
          )}

          {error && (
            <div
              className={styles.empty}
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            !lead && (
              <div
                className={styles.empty}
              >
                Pronto conocerás las
                primeras historias
                destacadas.
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
                      Ediciones del
                      capítulo
                    </span>

                    <h2>
                      Historias que
                      inspiran
                    </h2>
                  </div>

                  <p>
                    Cada cubierta abre
                    una historia sobre
                    una idea, una acción
                    o un proyecto que
                    aporta a sistemas
                    agroalimentarios más
                    sostenibles.
                  </p>
                </div>

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
                          VOLUNTARIO
                          DESTACADO
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