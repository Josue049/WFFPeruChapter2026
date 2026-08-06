import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { FeaturedVolunteer, VolunteerStory } from "../types";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./EditorialPages.module.css";

export default function VoluntariosDestacados() {
  const [stories, setStories] = useState<VolunteerStory[]>([]);
  const [featured, setFeatured] = useState<FeaturedVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<VolunteerStory[]>("/volunteer-stories/published"),
      apiRequest<FeaturedVolunteer>("/volunteer-stories/featured", { cache: "no-store" }),
    ]).then(([all, selected]) => { if (active) { setStories(all); setFeatured(selected); } }).catch(() => active && setError("No se pudieron cargar las historias.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const lead = featured?.story ?? null;
  const remaining = lead ? stories.filter((story) => story.id !== lead.id) : stories;

  return <><TopBar /><NavBar /><main className={styles.page}><div className={styles.content}>
    <header className={styles.magazineHero}><p className={styles.magazineKicker}>Personas que transforman</p><h1 className={styles.magazineTitle}>Voluntarios destacados</h1><p className={styles.magazineIntro}>Historias de jóvenes que convierten ideas en resultados, representan al capítulo y abren caminos para otros.</p></header>
    {loading && <div className={styles.empty}>Preparando la edición…</div>}
    {error && <div className={styles.empty}>{error}</div>}
    {!loading && !error && !lead && <div className={styles.empty}>Pronto conocerás las primeras historias destacadas.</div>}
    {lead && <Link className={styles.profileHero} to={`/voluntarios-destacados/${lead.slug}`}>
      <div className={styles.profilePortrait}><img src={mediaUrl(lead.portrait_image)} alt={lead.name} /></div>
      <div className={styles.profileCopy}><span className={styles.coverLabel}>{featured?.selection_mode === "scheduled" ? "Edición especial" : "Historia de portada"}</span><h2>{lead.name}</h2><p className={styles.profileHeadline}>{lead.headline}</p>{lead.quote && <blockquote className={styles.profileQuote}>“{lead.quote}”</blockquote>}<span className={styles.readLink}>Leer su historia →</span></div>
    </Link>}
    {remaining.length > 0 && <section><h2 className={styles.sectionTitle}>Más historias</h2><div className={styles.storyGrid}>{remaining.map((story, index) => <Link className={styles.storyCard} to={`/voluntarios-destacados/${story.slug}`} key={story.id}><div className={styles.storyImage}><img src={mediaUrl(story.portrait_image)} alt={story.name} loading="lazy" /></div><span className={styles.storyNumber}>HISTORIA {String(index + 1).padStart(2, "0")}</span><h3>{story.name}</h3><p>{story.headline}</p></Link>)}</div></section>}
  </div></main><ScrollTopButton /></>;
}
