import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { Article } from "../types/article";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { mediaUrl } from "../utils/mediaUrl";
import { slugify } from "../utils/slugify";

export default function Articulo() {
  const { slug } = useParams();
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    apiRequest<Article[]>("/articles/published")
      .then((data) => {
        if (!active) return;
        setPost(data.find((article) => slugify(article.title) === slug) ?? null);
      })
      .catch(() => {
        if (active) setPost(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const safeBody = useMemo(() => sanitizeHtml(post?.body ?? ""), [post?.body]);

  if (!loading && !post) {
    return <Navigate to="/404" replace />;
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <TopBar />
      <NavBar />

      {loading && <p className="page-status">Cargando artículo…</p>}

      {!loading && post && (
        <>
          <section className="articulo-header">
            <p className="articulo-categoria">
              <Link className="voz1" to="/voces">
                VOCES DEL CAPÍTULO
              </Link>
              <span className="voz2"> / ARTÍCULO</span>
            </p>

            <div className="Persona">
              {post.author_photo && (
                <img
                  src={mediaUrl(post.author_photo)}
                  alt={`${post.author_name} ${post.author_lastname}`}
                  className="articulo-avatar"
                />
              )}

              <p className="articulo-autor">
                {post.author_name} {post.author_lastname}
              </p>
              <p className="voz1">{post.author_cargo}</p>
            </div>

            <h1 className="articulo-titulo">{post.title}</h1>
            <p className="articulo-subtitulo">
              <i>“{post.subtitle}”</i>
            </p>
          </section>

          <div className="space-white">
            <div className="ArticuloCompleto">
              <div className="bgDesktopWhite">
                <h6 className="FechaArticulo">
                  Publicado el {formatDate(post.date)}
                </h6>
                <div className="lineaWidth" />
                <div
                  className="ArticuloParrafos"
                  dangerouslySetInnerHTML={{ __html: safeBody }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <ScrollTopButton />
    </>
  );
}
