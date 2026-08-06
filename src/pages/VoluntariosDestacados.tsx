import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { FeaturedVolunteer, VolunteerStory } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./EditorialPages.module.css";

const edition = (value: number) => String(value).padStart(2, "0");

export default function VoluntariosDestacados() {
  const [stories, setStories] = useState<VolunteerStory[]>([]);
  const [featured, setFeatured] = useState<FeaturedVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      apiRequest<VolunteerStory[]>("/volunteer-stories/published"),
      apiRequest<FeaturedVolunteer>("/volunteer-stories/featured", { cache: "no-store" }),
    ])
      .then(([all, selected]) => {
        if (active) {
          setStories(all);
          setFeatured(selected);
        }
      })
      .catch(() => active && setError("No se pudieron cargar las historias."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const lead = featured?.story ?? null;
  const orderedStories = useMemo(
    () => [...stories].sort((a, b) => a.edition_number - b.edition_number),
    [stories],
  );

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={`${styles.page} ${styles.volunteerLanding}`}>
        <div className={styles.content}>
          {loading && <div className={styles.empty}>Preparando la edición…</div>}
          {error && <div className={styles.empty}>{error}</div>}
          {!loading && !error && !lead && (
            <div className={styles.empty}>Pronto conocerás las primeras historias destacadas.</div>
          )}

          {lead && (
            <Link className={styles.volunteerBanner} to={`/voluntarios-destacados/${lead.slug}`}>
              <div className={styles.volunteerBannerCopy}>
                <span className={styles.bannerEyebrow}>
                  {featured?.selection_mode === "scheduled" ? "Edición especial" : "Voluntario destacado"}
                </span>
                <h1>{lead.name}</h1>
                <p className={styles.bannerRole}>{lead.role || lead.area || lead.headline}</p>
                <p className={styles.bannerHeadline}>{lead.headline}</p>
                <span className={styles.bannerButton}>Leer su historia →</span>
              </div>
              <div className={styles.volunteerBannerVisual}>
                <div className={styles.bannerBackdrop} aria-hidden="true">
                  <span>WFF</span>
                  <small>PERÚ CHAPTER</small>
                </div>
                <img src={mediaUrl(lead.portrait_image)} alt={lead.name} />
              </div>
            </Link>
          )}

          {orderedStories.length > 0 && (
            <section className={styles.magazineSection}>
              <div className={styles.magazineSectionHeader}>
                <div>
                  <span>Ediciones del capítulo</span>
                  <h2>Historias que inspiran</h2>
                </div>
                <p>
                  Cada cubierta abre una historia sobre una idea, una acción o un proyecto que aporta a
                  sistemas agroalimentarios más sostenibles.
                </p>
              </div>

              <div className={styles.magazineCoverGrid}>
                {orderedStories.map((story) => (
                  <Link
                    className={styles.magazineCover}
                    to={`/voluntarios-destacados/${story.slug}`}
                    key={story.id}
                    aria-label={`Leer la historia de ${story.name}`}
                  >
                    <div className={styles.coverMasthead}>
                      <strong>WFF</strong>
                      <span>PERÚ CHAPTER</span>
                    </div>
                    <span className={styles.coverEdition}>N.º {edition(story.edition_number)}</span>
                    <span className={styles.coverVertical}>VOLUNTARIO DESTACADO</span>
                    <div className={styles.coverPortrait}>
                      <img src={mediaUrl(story.portrait_image)} alt={story.name} loading="lazy" />
                    </div>
                    <div className={styles.coverIdentity}>
                      <h3>{story.name}</h3>
                      <p>{story.area || story.role || "World Food Forum Perú"}</p>
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
