import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { VocesSection } from "../components/VocesSection";
import { apiRequest } from "../services/api";
import type { Article } from "../types/article";
import { useLanguage } from "../i18n/LanguageContext";

export default function Voces() {
  const { t } = useLanguage();
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
        if (active) setError(t("voices.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

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
              {t("voices.send")}
            </Link>
          </div>{" "}
        </div>

        {loading && <p className="page-status">{t("voices.loading")}</p>}
        {error && <p className="page-status page-status-error">{error}</p>}
        {!loading && !error && <VocesSection posts={posts} />}
      </section>

      <ScrollTopButton />
    </>
  );
}
