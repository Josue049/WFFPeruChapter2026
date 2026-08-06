import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    apiRequest<Milestone>(`/milestones/published/${encodeURIComponent(slug)}`).then(setItem).catch(() => setError("Este hito no está disponible."));
  }, [slug]);

  return <><TopBar /><NavBar /><main className={styles.page}>
    {error && <div className={styles.empty}>{error}</div>}
    {!item && !error && <div className={styles.empty}>Cargando hito…</div>}
    {item && <>
      <header className={styles.detailHero}><div className={styles.detailInner}><Link className={styles.backLink} to="/hitos">← Volver a hitos</Link><h1 className={styles.detailTitle}>{item.title}</h1><p className={styles.detailLead}>{item.summary}</p></div></header>
      <img className={styles.detailCover} src={mediaUrl(item.cover_image)} alt={item.title} />
      <div className={`${styles.detailInner} ${styles.articleLayout}`}>
        <article>
          <div className={styles.richText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.body) }} />
          {item.gallery.length > 0 && <section className={styles.detailSection}><h2>Galería</h2><div className={styles.gallery}>{item.gallery.map((image, index) => <img key={`${image}-${index}`} src={mediaUrl(image)} alt={`${item.title}, imagen ${index + 1}`} loading="lazy" />)}</div></section>}
        </article>
        <aside className={styles.asideFacts}><dl><dt>Fecha</dt><dd>{formatDate(item.event_date)}</dd><dt>Categoría</dt><dd>{item.category}</dd>{item.location && <><dt>Lugar</dt><dd>{item.location}</dd></>}</dl></aside>
      </div>
    </>}
  </main><ScrollTopButton /></>;
}
function formatDate(value: string): string { return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }); }
