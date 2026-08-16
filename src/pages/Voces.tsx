import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { VocesSection } from "../components/VocesSection";
import { apiRequest } from "../services/api";
import type { Article } from "../types/article";

export default function Voces() {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    apiRequest<Article[]>("/articles/published")
      .then((data) => {
        if (active) setPosts(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar los artículos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <TopBar />
      <NavBar />

      <section>
        <div className="voces-header">
          <img
            src="/img/voces-logo.webp"
            alt="Voces del Capítulo"
            className="voces-logo"
          />
          <div className="voces-submit-wrapper">
            <Link to="/voces/enviar" className="voces-submit-button">
              Envíanos tu artículo
            </Link>
          </div>{" "}
        </div>

        {loading && <p className="page-status">Cargando artículos…</p>}
        {error && <p className="page-status page-status-error">{error}</p>}
        {!loading && !error && <VocesSection posts={posts} />}
      </section>

      <ScrollTopButton />
    </>
  );
}
