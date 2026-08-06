import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { VolunteerStory } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import styles from "./EditorialPages.module.css";

export default function VoluntarioDetalle() {
  const { slug } = useParams();
  const [item, setItem] = useState<VolunteerStory | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (slug) apiRequest<VolunteerStory>(`/volunteer-stories/published/${encodeURIComponent(slug)}`).then(setItem).catch(() => setError("Esta historia no está disponible.")); }, [slug]);

  return <><TopBar /><NavBar /><main className={styles.page}>
    {error && <div className={styles.empty}>{error}</div>}
    {!item && !error && <div className={styles.empty}>Cargando historia…</div>}
    {item && <>
      <header className={styles.detailHero}><div className={styles.detailInner}><Link className={styles.backLink} to="/voluntarios-destacados">← Volver a voluntarios destacados</Link><p className={styles.eyebrow}>Perfil destacado</p><h1 className={styles.detailTitle}>{item.name}</h1><p className={styles.detailLead}>{item.headline}</p></div></header>
      <img className={styles.detailCover} src={mediaUrl(item.portrait_image)} alt={item.name} />
      <div className={`${styles.detailInner} ${styles.articleLayout}`}>
        <article>
          <p className={styles.detailLead}>{item.introduction}</p>
          {item.quote && <blockquote className={styles.profileQuote}>“{item.quote}”</blockquote>}
          <section className={styles.detailSection}><h2>La historia</h2><div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.story) }} /></section>
          <section className={styles.detailSection}><h2>El logro</h2><div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.achievement) }} /></section>
          <section className={styles.detailSection}><h2>Su impacto</h2><div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.impact) }} /></section>
          {item.gallery.length > 0 && <section className={styles.detailSection}><h2>Galería</h2><div className={styles.gallery}>{item.gallery.map((image, index) => <img key={`${image}-${index}`} src={mediaUrl(image)} alt={`${item.name}, imagen ${index + 1}`} loading="lazy" />)}</div></section>}
          <div className={styles.socials}>{item.linkedin_url && <a href={item.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}{item.instagram_url && <a href={item.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}{item.website_url && <a href={item.website_url} target="_blank" rel="noreferrer">Sitio web</a>}</div>
        </article>
        <aside className={styles.asideFacts}><dl>{item.role && <><dt>Rol</dt><dd>{item.role}</dd></>}{item.project && <><dt>Proyecto</dt><dd>{item.project}</dd></>}{item.city && <><dt>Ciudad</dt><dd>{item.city}</dd></>}</dl></aside>
      </div>
    </>}
  </main><ScrollTopButton /></>;
}
