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
    fetch("/data/voces.json")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando voces.json:", err);
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
            src="/img/voces-logo.png"
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
