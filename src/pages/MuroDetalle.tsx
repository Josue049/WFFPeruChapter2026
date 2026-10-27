import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { useLanguage } from "../i18n/LanguageContext";
import { ApiError, apiRequest } from "../services/api";
import type { MuroPostPublic } from "../types/muro";
import { mediaUrl } from "../utils/mediaUrl";
import styles from "./Muro.module.css";

export default function MuroDetalle() {
  const { t, locale } = useLanguage();
  const { slug = "" } = useParams();
  const [post, setPost] = useState<MuroPostPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setMissing(false);
    apiRequest<MuroPostPublic>(`/muro/posts/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (!active) return;
        setPost(data);
        document.title = `${data.title} | Muro WFF Perú`;
      })
      .catch((error: unknown) => {
        if (active) setMissing(error instanceof ApiError ? error.status === 404 : true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const url = typeof window === "undefined" ? "" : window.location.href;
  const encoded = encodeURIComponent(url);
  const shareText = encodeURIComponent(post ? `${post.title} — Muro WFF Perú` : "");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(t("muro.copyLink"), url);
    }
  };

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <div className={styles.article}>
          <Link to="/muro" className={styles.back}>{t("muro.back")}</Link>
          {loading && <p className={styles.status} role="status">{t("muro.loading")}</p>}
          {!loading && (missing || !post) && <p className={styles.status}>{t("muro.notFound")}</p>}
          {post && (
            <article>
              {post.category && (
                <span className={styles.tag} style={{ background: post.category.color }}>{post.category.name}</span>
              )}
              <h1>{post.title}</h1>
              <p className={styles.articleMeta}>
                {t("muro.by", { name: post.author_name })}
                {post.published_at && ` · ${new Date(post.published_at).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}`}
              </p>
              {post.images.length > 0 && (
                <div className={`${styles.gallery} ${post.images.length === 1 ? styles.gallerySingle : ""}`}>
                  {post.images.map((image) => (
                    <img
                      key={image.id}
                      src={mediaUrl(image.url)}
                      width={image.width}
                      height={image.height}
                      alt={post.title}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
              <div className={styles.body}>{post.body}</div>
              <div className={styles.share}>
                <strong>{t("muro.copyLink")}:</strong>
                <button type="button" className={styles.ghost} onClick={copy}>
                  {copied ? t("muro.copied") : t("muro.copyLink")}
                </button>
                <a className={styles.ghost} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${shareText}%20${encoded}`}>WhatsApp</a>
                <a className={styles.ghost} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}>LinkedIn</a>
                <a className={styles.ghost} target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}>Facebook</a>
              </div>
            </article>
          )}
        </div>
      </main>
      <ScrollTopButton />
    </>
  );
}
