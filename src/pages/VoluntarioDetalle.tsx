import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { VolunteerStory } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import styles from "./EditorialPages.module.css";

const edition = (value: number) => String(value).padStart(2, "0");

export default function VoluntarioDetalle() {
  const { slug } = useParams();
  const [item, setItem] = useState<VolunteerStory | null>(null);
  const [allStories, setAllStories] = useState<VolunteerStory[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let active = true;
    void Promise.all([
      apiRequest<VolunteerStory>(`/volunteer-stories/published/${encodeURIComponent(slug)}`),
      apiRequest<VolunteerStory[]>("/volunteer-stories/published"),
    ])
      .then(([story, stories]) => {
        if (active) {
          setItem(story);
          setAllStories(stories);
        }
      })
      .catch(() => active && setError("Esta historia no está disponible."));
    return () => {
      active = false;
    };
  }, [slug]);

  const related = useMemo(
    () => allStories.filter((story) => story.id !== item?.id).slice(0, 3),
    [allStories, item?.id],
  );

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${styles.volunteerArticlePage}`}>
        {error && <div className={styles.empty}>{error}</div>}
        {!item && !error && <div className={styles.empty}>Cargando historia…</div>}
        {item && (
          <div className={styles.volunteerArticleShell}>
            <Link className={styles.backLink} to="/voluntarios-destacados">
              ← Volver a voluntarios destacados
            </Link>

            <header className={styles.volunteerArticleHero}>
              <div className={styles.articleCoverMini}>
                <div className={styles.coverMasthead}>
                  <strong>WFF</strong>
                  <span>PERÚ CHAPTER</span>
                </div>
                <span className={styles.coverEdition}>N.º {edition(item.edition_number)}</span>
                <span className={styles.coverVertical}>VOLUNTARIO DESTACADO</span>
                <div className={styles.coverPortrait}>
                  <img src={mediaUrl(item.portrait_image)} alt={item.name} />
                </div>
                <div className={styles.coverIdentity}>
                  <h2>{item.name}</h2>
                  <p>{item.area || item.role || "World Food Forum Perú"}</p>
                </div>
              </div>

              <div className={styles.articleHeadlineBlock}>
                <span>N.º {edition(item.edition_number)}</span>
                <h1>{item.headline}</h1>
                <div className={styles.articleByline}>
                  <span aria-hidden="true">◉</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.role || item.area}</small>
                  </div>
                </div>
                <p>{item.introduction}</p>
              </div>
            </header>

            <div className={styles.volunteerArticleLayout}>
              <article className={styles.volunteerStoryBody}>
                <div
                  className={styles.richText}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content_html) }}
                />

                {item.quote && (
                  <blockquote className={styles.articleQuote}>
                    <span>“</span>
                    <p>{item.quote}</p>
                  </blockquote>
                )}

                {item.gallery.length > 0 && (
                  <section className={styles.articleGallerySection}>
                    <h2>En acción</h2>
                    <div className={styles.editorialGallery}>
                      {item.gallery.map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={mediaUrl(image)}
                          alt={`${item.name}, imagen ${index + 1}`}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </article>

              <aside className={styles.volunteerArticleAside}>
                <section>
                  <h2>Sobre la historia</h2>
                  <dl>
                    {item.area && <><dt>Área</dt><dd>{item.area}</dd></>}
                    {item.role && <><dt>Rol</dt><dd>{item.role}</dd></>}
                    {item.project && <><dt>Proyecto</dt><dd>{item.project}</dd></>}
                    {item.city && <><dt>Ciudad</dt><dd>{item.city}</dd></>}
                  </dl>
                </section>

                {related.length > 0 && (
                  <section>
                    <h2>Más voces que inspiran</h2>
                    <div className={styles.relatedVolunteerList}>
                      {related.map((story) => (
                        <Link to={`/voluntarios-destacados/${story.slug}`} key={story.id}>
                          <div className={styles.relatedPortrait}>
                            <img src={mediaUrl(story.portrait_image)} alt={story.name} loading="lazy" />
                          </div>
                          <div>
                            <small>N.º {edition(story.edition_number)}</small>
                            <strong>{story.name}</strong>
                            <span>{story.area || story.role}</span>
                          </div>
                          <b>→</b>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <section className={styles.articleSocials}>
                  <h2>Enlaces</h2>
                  {item.linkedin_url && <a href={item.linkedin_url} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                  {item.instagram_url && <a href={item.instagram_url} target="_blank" rel="noreferrer">Instagram ↗</a>}
                  {item.website_url && <a href={item.website_url} target="_blank" rel="noreferrer">Sitio web ↗</a>}
                </section>
              </aside>
            </div>
          </div>
        )}
      </main>
      <ScrollTopButton />
    </>
  );
}
