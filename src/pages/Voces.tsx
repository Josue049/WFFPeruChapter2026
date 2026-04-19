import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import { VocesSection } from "../components/VocesSection";
import { TopBar } from "../components/Header/TopBar";
import { NavBar } from "../components/Header/NavBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import type { Article } from "../types/article";

export const Voces: React.FC = () => {
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.wffperuchapter.page/articles/published")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar artículos");
        return res.json();
      })
      .then((data: Article[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando artículos:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <TopBar />
      <NavBar />

      <section>
        <div className="voces-header">
          <img
            src="/img/voces-logo.webp"
            alt="Voces Header"
            style={{ maxWidth: "400px" }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando artículos...</p>
        ) : (
          <VocesSection posts={posts} />
        )}
      </section>

      <Footer />
      <ScrollTopButton />
    </>
  );
};

export default Voces;