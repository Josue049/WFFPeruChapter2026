// Piezas de /voluntarios-destacados compartidas con la vista previa del panel.
import { useId } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import type { VolunteerStory } from "../../types";
import { mediaUrl } from "../../utils/mediaUrl";
import styles from "../../pages/VoluntariosEditorial.module.css";

/** La portada es una sola imagen; sin diseño propio se muestra la foto tal cual. */
export function MagazineCover({ story, priority = false }: { story: VolunteerStory; priority?: boolean }) {
  const image = story.cover_image || story.portrait_image;
  if (!image) return <div className={styles.featuredCoverEmpty}>Sin imagen de portada</div>;
  return (
    <span className={styles.coverCurl}>
      <img
        className={styles.featuredCoverImage}
        src={mediaUrl(image)}
        alt={story.name}
        loading={priority ? "eager" : "lazy"}
      />
      <PageCurl />
    </span>
  );
}

/** Esquina inferior derecha que se levanta como una página al pasar el cursor. */
function PageCurl() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={styles.pageCurl} viewBox="0 0 100 260" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-under`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5a5b5f" />
          <stop offset="1" stopColor="#2c2b2e" />
        </linearGradient>
        <linearGradient id={`${id}-page`} x1="0.05" y1="0.7" x2="0.75" y2="0.9">
          <stop offset="0" stopColor="#d4d4d6" />
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bdbdc1" />
        </linearGradient>
      </defs>
      {/* Lo que queda al descubierto bajo la página. */}
      <path d="M100 0V260H41C52 205 70 108 100 0Z" fill={`url(#${id}-under)`} />
      {/* La hoja doblada. */}
      <path className={styles.pageCurlFlap} d="M100 0C83 82 55 154 4 196C24 208 37 232 41 260C52 205 70 108 100 0Z" fill={`url(#${id}-page)`} />
    </svg>
  );
}

/** Bloque principal: texto del destacado y su portada. */
export function FeaturedBlock({
  lead,
  scheduled,
}: {
  lead: VolunteerStory;
  scheduled: boolean;
}) {
  const { t } = useLanguage();
  const href = `/voluntarios-destacados/${lead.slug}`;
  return (
    <div className={styles.featuredWrap}>
      <svg className={styles.decoTop} viewBox="0 0 160 190" aria-hidden="true" focusable="false">
        <path d="M0 78V34Q0 0 34 0H66V78Z" fill="#ee4f27" />
        <path d="M66 0H126Q160 0 160 34V78H66Z" fill="#ff6b7f" />
        <path d="M113 14 120 36 142 43 120 50 113 72 106 50 84 43 106 36Z" fill="#ffb400" />
        <rect x="96" y="80" width="64" height="40" fill="#ff6b7f" />
        <path d="M96 122H160V156Q160 190 126 190H96Z" fill="#ffb400" />
      </svg>
      <svg className={styles.decoBottom} viewBox="0 0 230 140" aria-hidden="true" focusable="false">
        <path d="M10 0H42V62H10Z" fill="#ffb400" />
        <path d="M0 64H68V110Q68 140 38 140H0Z" fill="#ff6b7f" />
        <rect x="68" y="88" width="90" height="52" fill="#4a90d9" />
        <path d="M113 88 140 140H86Z" fill="#ffb400" />
        <path d="M158 112H196Q230 112 230 140H158Z" fill="#ff6b7f" />
      </svg>
      <section
        className={styles.featuredSection}
        aria-label={t("volunteers.bannerEyebrow")}>
        <div className={styles.featuredText}>
          <span className={styles.fineLabel}>
            {scheduled ? t("volunteers.bannerSpecial") : t("volunteers.featureTitle")}
          </span>
          <Link to={href} className={styles.featuredStoryLink}>
            <h2>{lead.headline || lead.name}</h2>
          </Link>
          <span className={styles.topicTag}>{lead.area || lead.role || "WFF Perú"}</span>
          <p className={styles.featuredDescription}>{lead.introduction || lead.headline}</p>
          <Link className={styles.readMore} to={href}>
            {t("volunteers.readStory")}
          </Link>
        </div>

        <Link className={styles.featuredCoverLink} to={href} aria-label={`${t("volunteers.readStory")}: ${lead.name}`}>
          <MagazineCover story={lead} priority />
        </Link>
      </section>
    </div>
  );
}
