import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ScrollTopButton } from "../components/ScrollTopButton";
import { apiRequest } from "../services/api";
import type { Article } from "../types/article";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { mediaUrl } from "../utils/mediaUrl";
import { slugify } from "../utils/slugify";
import { useLanguage } from "../i18n/LanguageContext";

interface ArticleViewsResponse {
  article_id: number;
  views: number;
  counted: boolean;
}

const VISITOR_STORAGE_KEY = "wff_article_visitor_id";

function getVisitorKey() {
  try {
    const saved = window.localStorage.getItem(VISITOR_STORAGE_KEY);

    if (saved) {
      return saved;
    }

    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(VISITOR_STORAGE_KEY, created);

    return created;
  } catch {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
}

const formatDate = (dateStr: string, locale: string) => {
  const normalized = dateStr.split("T")[0];
  const [year, month, day] = normalized.split("-").map(Number);

  if (!year || !month || !day) {
    return dateStr;
  }

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function Articulo() {
  const { t, locale } = useLanguage();
  const { slug } = useParams();

  const [post, setPost] = useState<Article | null>(null);
  const [posts, setPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState<{
    articleId: number;
    views: number;
  } | null>(null);

  const [viewLoading, setViewLoading] = useState(false);

  /*
   * Marcador colocado al final del artículo.
   * Cuando entra en pantalla consideramos que el usuario
   * llegó al final del contenido.
   */
  const articleEndRef = useRef<HTMLDivElement | null>(null);

  /*
   * Impide llamar varias veces al endpoint mientras el
   * IntersectionObserver sigue detectando el elemento.
   */
  const readingCountedRef = useRef(false);

  /*
   * Obtener artículos publicados y localizar el artículo
   * correspondiente al slug actual.
   */
  useEffect(() => {
    let active = true;

    setLoading(true);

    apiRequest<Article[]>("/articles/published")
      .then((data) => {
        if (!active) return;

        setPosts(data);

        setPost(
          data.find((article) => slugify(article.title) === slug) ?? null,
        );
      })
      .catch(() => {
        if (!active) return;

        setPosts([]);
        setPost(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  /*
   * Cada vez que cambiamos de artículo reiniciamos
   * el estado local del contador.
   */
  useEffect(() => {
    readingCountedRef.current = false;
    setViewState(null);
    setViewLoading(false);
  }, [post?.id]);

  /*
   * CONTADOR DE LECTURAS
   *
   * NO contamos al entrar en la página.
   *
   * Solamente llamamos a:
   *
   * POST /articles/{id}/view
   *
   * cuando el usuario llega al final del contenido.
   */
  useEffect(() => {
    if (!post?.id) return;

    const target = articleEndRef.current;

    if (!target) return;

    let active = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (readingCountedRef.current) {
          return;
        }

        /*
         * Lo marcamos antes de realizar la petición para evitar
         * que IntersectionObserver dispare varias peticiones
         * consecutivas.
         */
        readingCountedRef.current = true;

        const visitorKey = getVisitorKey();

        setViewLoading(true);

        apiRequest<ArticleViewsResponse>(
          `/articles/${post.id}/view?visitor_key=${encodeURIComponent(
            visitorKey,
          )}`,
          {
            method: "POST",
          },
        )
          .then((data) => {
            if (!active) return;

            setViewState({
              articleId: data.article_id,
              views: data.views,
            });
          })
          .catch(() => {
            if (!active) return;

            /*
             * Si la petición falla permitimos que se vuelva
             * a intentar si el usuario vuelve a alcanzar el final.
             */
            readingCountedRef.current = false;
          })
          .finally(() => {
            if (active) {
              setViewLoading(false);
            }
          });

        /*
         * Ya detectamos que llegó al final.
         * No necesitamos seguir observando.
         */
        observer.disconnect();
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(target);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [post?.id]);

  const safeBody = useMemo(
    () => sanitizeHtml(post?.body ?? ""),
    [post?.body],
  );

  const recommendedPosts = useMemo(() => {
    if (!post) return [];

    return posts
      .filter((article) => article.id !== post.id)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 3);
  }, [post, posts]);

  if (!loading && !post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <TopBar />
      <NavBar />

      {loading && (
        <p className="page-status">
          {t("article.loading")}
        </p>
      )}

      {!loading && post && (
        <main className="article-page">
          <header className="articulo-header">
            <p className="articulo-categoria">
              <Link className="voz1" to="/voces">
                {t("article.category")}
              </Link>

              <span className="voz2">
                {" "}
                / {t("article.article")}
              </span>
            </p>

            <div className="Persona articulo-author-block">
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

              {post.author_cargo && (
                <p className="articulo-cargo voz1">
                  {post.author_cargo}
                </p>
              )}
            </div>

            <h1 className="articulo-titulo">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="articulo-subtitulo">
                <i>“{post.subtitle}”</i>
              </p>
            )}
          </header>

          <div className="article-layout">
            <article className="ArticuloCompleto">
              <div className="bgDesktopWhite">
                <div className="article-meta-row">
                  <span className="article-meta-label">
                    {t("article.meta")}
                  </span>

                  <div className="article-meta-right">
                    <time
                      className="FechaArticulo"
                      dateTime={post.date}
                    >
                      {t("article.published", {
                        date: formatDate(post.date, locale),
                      })}
                    </time>

                    {(viewLoading ||
                      viewState?.articleId === post.id) && (
                      <span
                        className={`article-views ${
                          viewState?.articleId === post.id
                            ? ""
                            : "article-views-loading"
                        }`}
                        aria-live="polite"
                        aria-label={
                          viewState?.articleId === post.id
                            ? `${viewState.views} ${
                                viewState.views === 1
                                  ? t("article.reading")
                                  : t("article.readings")
                              }`
                            : t(
                                "article.loadingReadingsAria",
                              )
                        }
                      >
                        {viewState?.articleId === post.id
                          ? `${viewState.views.toLocaleString(
                              locale,
                            )} ${
                              viewState.views === 1
                                ? t("article.reading")
                                : t("article.readings")
                            }`
                          : t("article.loadingReadings")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lineaWidth" />

                <div
                  className="ArticuloParrafos"
                  dangerouslySetInnerHTML={{
                    __html: safeBody,
                  }}
                />

                {/*
                  Este elemento marca el final REAL del artículo.

                  Cuando el usuario llega hasta aquí se registra
                  la lectura.
                */}
                <div
                  ref={articleEndRef}
                  aria-hidden="true"
                  style={{
                    height: "1px",
                    width: "100%",
                  }}
                />
              </div>
            </article>

            <aside
              className="article-sidebar"
              aria-label={t(
                "article.recommendedAria",
              )}
            >
              <div className="article-sidebar-inner">
                <div className="article-sidebar-heading">
                  <span>
                    {t("article.alsoRead")}
                  </span>

                  <h2>
                    {t("article.recommended")}
                  </h2>
                </div>

                {recommendedPosts.length > 0 ? (
                  <div className="recommended-list">
                    {recommendedPosts.map(
                      (article) => (
                        <Link
                          key={article.id}
                          to={`/voces/${slugify(
                            article.title,
                          )}`}
                          className="recommended-card"
                        >
                          <time
                            dateTime={article.date}
                          >
                            {formatDate(
                              article.date,
                              locale,
                            )}
                          </time>

                          <h3>
                            {article.title}
                          </h3>

                          {article.subtitle && (
                            <p>
                              {article.subtitle}
                            </p>
                          )}

                          <span className="recommended-author">
                            {article.author_name}{" "}
                            {
                              article.author_lastname
                            }
                          </span>
                        </Link>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="recommended-empty">
                    {t(
                      "article.recommendedEmpty",
                    )}
                  </p>
                )}

                <Link
                  to="/voces"
                  className="article-back-link"
                >
                  {t("article.viewAll")}
                </Link>
              </div>
            </aside>
          </div>
        </main>
      )}

      <ScrollTopButton />
    </>
  );
}