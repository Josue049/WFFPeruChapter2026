import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { VocesSection } from "../components/VocesSection";
import { apiRequest } from "../services/api";
import type { Article } from "../types/article";
import { useLanguage } from "../i18n/LanguageContext";
import { VocesCountdown } from "../components/VocesCountdown";
import type { VoicesSettings } from "../components/VocesCountdown";
import { useArticleViews } from "../utils/articleViews";
import "../styles/pages/voces-extras.css";

export default function Voces() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [settings, setSettings] = useState<VoicesSettings | null>(null);
  const views = useArticleViews();

  useEffect(() => {
    let active = true;

    Promise.all([
      apiRequest<Article[]>("/articles/published"),
      apiRequest<VoicesSettings>("/voices/settings").catch(() => ({ is_submission_open: false })),
    ])
      .then(([data, settings]) => {
        if (!active) return;
        setPosts(data);
        setSubmissionsOpen(Boolean(settings.is_submission_open));
        setSettings(settings);
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
          {submissionsOpen && (
            <div className="voces-submit-wrapper">
              <Link to="/voces/enviar" className="voces-submit-button">
                {t("voices.send")}
              </Link>
            </div>
          )}
        </div>

        <VocesCountdown settings={settings} />

        {loading && <p className="page-status">{t("voices.loading")}</p>}
        {error && <p className="page-status page-status-error">{error}</p>}
        {!loading && !error && <VocesSection posts={posts} views={views} />}
      </section>

      <ScrollTopButton />
    </>
  );
}
