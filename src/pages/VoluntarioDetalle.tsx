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
import { useLanguage } from "../i18n/LanguageContext";
import { usePageMeta } from "../seo/pageMeta";

const edition = (value: number) => String(value).padStart(2, "0");

/** Titular con la última palabra destacada en rojo (estilo editorial). */
function Headline({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <>{text}</>;
  const last = words.pop();
  return <>{words.join(" ")} <em>{last}</em></>;
}

export default function VoluntarioDetalle() {
  const { t } = useLanguage();
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
      .catch(() => active && setError(t("volunteer.unavailable")));
    return () => {
      active = false;
    };
  }, [slug, t]);

  const related = useMemo(
    () => allStories.filter((story) => story.id !== item?.id && !story.cover_only).slice(0, 3),
    [allStories, item?.id],
  );

  usePageMeta(
    item && slug
      ? {
          title: `${item.name} | Voluntarios Destacados WFF Perú`,
          description: (item.headline || item.name).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200),
          path: `/voluntarios-destacados/${slug}`,
          type: "article",
          image: mediaUrl(item.cover_image || item.portrait_image) || undefined,
        }
      : null,
  );

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${styles.volunteerArticlePage}`}>
        {error && <div className={styles.empty}>{error}</div>}
        {!item && !error && <div className={styles.empty}>{t("volunteer.loading")}</div>}
        {item && (
          <div className={styles.volunteerArticleShell}>
            <Link className={styles.backLink} to="/voluntarios-destacados">
              {t("volunteer.back")}
            </Link>

            <header className={styles.volunteerArticleHero}>
              <span className={styles.heroCircle} aria-hidden="true" />
              <svg className={styles.heroFlower} viewBox="0 0 160 220" aria-hidden="true" focusable="false">
                <path d="M160 0V96Q96 96 96 48 96 0 160 0Z" fill="#ee4f27" />
                <path d="M96 96H160V140Q96 140 96 96Z" fill="#ff6b7f" />
                <path d="M40 150Q40 110 80 110V150Z" fill="#ffb400" />
                <path d="M80 110Q120 110 120 150H80Z" fill="#4a90d9" />
                <path d="M80 150H120Q120 190 80 190Z" fill="#4a90d9" />
                <path d="M40 150H80V190Q40 190 40 150Z" fill="#ff6b7f" />
                <path d="M0 150Q0 128 22 128H40V150Z" fill="#ffd166" />
              </svg>
              <img className={styles.articleCoverImage} src={mediaUrl(item.cover_image || item.portrait_image)} alt={item.name} />

              <div className={styles.articleHeadlineBlock}>
                <div className={styles.heroPills}>
                  <span className={styles.pillIssue}>N.º {edition(item.edition_number)}</span>
                  {item.area && <span className={styles.pillArea}>{item.area}</span>}
                </div>
                <h1><Headline text={item.headline || item.name} /></h1>
                <div className={styles.articleByline}>
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
                    <span className={styles.quoteClose} aria-hidden="true">”</span>
                  </blockquote>
                )}
              </article>

              <aside className={styles.volunteerArticleAside}>
                <section className={styles.storyCard}>
                  <div className={styles.storyCardHead}>
                    <span className={styles.storyCardIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" focusable="false"><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5ZM12 6.5V19.5" /></svg>
                    </span>
                    <h2>{t("volunteer.aboutStory")}</h2>
                  </div>
                  <dl>
                    {item.role && <><dt>{t("volunteer.role")}</dt><dd>{item.role}</dd></>}
                    {item.project && <><dt>{t("volunteer.project")}</dt><dd>{item.project}</dd></>}
                    {item.city && <><dt>{t("volunteer.city")}</dt><dd>{item.city}</dd></>}
                  </dl>
                  {(item.linkedin_url || item.instagram_url || item.website_url) && (
                    <div className={styles.storyLinks}>
                      <span className={styles.storyLinksTitle}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                        {t("volunteer.links")}
                      </span>
                      {item.linkedin_url && <a href={item.linkedin_url} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                      {item.instagram_url && <a href={item.instagram_url} target="_blank" rel="noreferrer">Instagram ↗</a>}
                      {item.website_url && <a href={item.website_url} target="_blank" rel="noreferrer">{t("volunteer.website")}</a>}
                    </div>
                  )}
                </section>

                {related.length > 0 && (
                  <section>
                    <h2>{t("volunteer.moreVoices")}</h2>
                    <div className={styles.relatedVolunteerList}>
                      {related.map((story) => (
                        <Link to={`/voluntarios-destacados/${story.slug}`} key={story.id}>
                          <div className={styles.relatedPortrait}>
                            <img src={mediaUrl(story.cover_image || story.portrait_image)} alt={story.name} loading="lazy" />
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
              </aside>
            </div>
          </div>
        )}
      </main>
      <ScrollTopButton />
    </>
  );
}
