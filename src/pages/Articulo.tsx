import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import { TopBar } from "../components/Header/TopBar";
import { NavBar } from "../components/Header/NavBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import type { Article } from "../types/article";

export const Articulo: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/voces.json")
      .then((res) => res.json())
      .then((data: Article[]) => {
        const found = data.find((item) => item.slug === slug);
        setPost(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <TopBar />
      <NavBar />

      {loading && (
        <p style={{ textAlign: "center" }}>Cargando...</p>
      )}

      {!loading && !post && (
        <p style={{ textAlign: "center" }}>
          Artículo no encontrado
        </p>
      )}

      {!loading && post && (
        <>
          <section className="articulo-header">
            <p className="articulo-categoria">
              <b>VOCES DEL CAPÍTULO</b> / Artículo
            </p>

            <div className="Persona">
              {post.author.photo && (
                <img
                  src={post.author.photo}
                  alt={post.author.name}
                  className="articulo-avatar"
                />
              )}

              <p className="articulo-autor">
                {post.author.name}
              </p>

              <p className="articulo-autor-titulo">
                {post.author.role}
              </p>
            </div>

            <h1 className="articulo-titulo">
              {post.title}
            </h1>

            <p className="articulo-subtitulo">
              {post.subtitle}
            </p>
          </section>

          <div className="ArticuloCompleto">
            <h6 className="FechaArticulo">
              Publicado el{" "}
              {new Date(post.date).toLocaleDateString()}
            </h6>

            <div className="lineaWidth"></div>

            <div className="ArticuloParrafos">
              {post.content}
            </div>
          </div>
        </>
      )}

      <Footer />
      <ScrollTopButton />
    </>
  );
};

export default Articulo;
