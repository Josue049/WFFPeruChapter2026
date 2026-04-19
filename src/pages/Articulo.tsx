import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import { TopBar } from "../components/Header/TopBar";
import { NavBar } from "../components/Header/NavBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { slugify } from "../utils/slugify";
import type { Article } from "../types/article";

export const Articulo: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  const API = "https://api.wffperuchapter.page";

  useEffect(() => {
    fetch(`${API}/articles/published`)
      .then((r) => r.json())
      .then((data: Article[]) => {
        const found = data.find((a) => slugify(a.title) === slug);
        setPost(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

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

      {loading && <p style={{ textAlign: "center" }}>Cargando...</p>}

      {!loading && post && (
        <>
          <section className="articulo-header">
            <p className="articulo-categoria">
              <a className="voz1" href="/voces-del-capitulo">
                VOCES DEL CAPÍTULO
              </a>
              <a className="voz2" href="/articulo">
                {" "}
                / ARTÍCULO
              </a>
            </p>

            <div className="Persona">
              {post.author_photo && (
                <img
                  src={post.author_photo}
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
              <i>"{post.subtitle}"</i>
            </p>
          </section>

          <div className="space-white">
            <div className="ArticuloCompleto">
              <div className="bgDesktopWhite">
                <h6 className="FechaArticulo">
                  Publicado el {post.date && formatDate(post.date)}
                </h6>

                <div className="lineaWidth"></div>

                <div
                  className="ArticuloParrafos"
                  dangerouslySetInnerHTML={{ __html: post.body }}
                ></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* <Footer /> */}
      <ScrollTopButton />
    </>
  );
};

export default Articulo;