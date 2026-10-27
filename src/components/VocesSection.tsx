import { useMemo, useState } from "react";
import type { ChangeEvent, FC } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/article";
import { slugify } from "../utils/slugify";
import { mediaUrl } from "../utils/mediaUrl";
import { useLanguage } from "../i18n/LanguageContext";
import { getContrastTextColor } from "../utils/color";
import { EXTRA } from "../i18n/extra";

interface Props {
  posts: Article[];
  views?: Map<number, number>;
}

const getDriveImage = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(/id=([^&]+)/);
    if (match?.[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return mediaUrl(url);
};

const PAGE_SIZE = 9;
const MAX_DESCRIPTION_WORDS = 13;

const shortenDescription = (description: string): string => {
  const words = description.trim().split(/\s+/).filter(Boolean);
  return words.length > MAX_DESCRIPTION_WORDS
    ? `${words.slice(0, MAX_DESCRIPTION_WORDS).join(" ")}...`
    : description.trim();
};

export const VocesSection: FC<Props> = ({ posts, views }) => {
  const { t, locale, language } = useLanguage();
  const extra = EXTRA[language];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale);
  };

  const availableTags = useMemo(
    () => Array.from(new Map(posts.filter((post) => post.tag_name).map((post) => [post.tag_name!, { name: post.tag_name!, color: post.tag_color ?? "#E75733" }])).values()),
    [posts],
  );

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const filtered = sorted.filter((post) => {
    const q = search.toLowerCase().trim();
    const fullName = `${post.author_name} ${post.author_lastname}`.toLowerCase();
    const matchesSearch = !q
      || post.title.toLowerCase().includes(q)
      || fullName.includes(q)
      || (post.tag_name ?? "").toLowerCase().includes(q);
    const matchesTag = selectedTag === "all" || post.tag_name === selectedTag;
    return matchesSearch && matchesTag;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="voces-filters-wrap">
        <div className="voces-search-box">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder={t("voices.search")}
            className="voces-search-input"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setSearch(""); setPage(1); }}
              className="voces-search-clear"
            >
              ×
            </button>
          )}
        </div>

        <div className="voces-tag-filter">
          <label htmlFor="voces-filter-tag">Filtrar por tipo</label>
          <select
            id="voces-filter-tag"
            value={selectedTag}
            onChange={(event) => {
              setSelectedTag(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Todos</option>
            {availableTags.map((tag) => (
              <option key={tag.name} value={tag.name}>{tag.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.5, margin: "40px 0" }}>
          {t("voices.noResults", { search: search || selectedTag === "all" ? search : selectedTag })}
        </p>
      ) : (
        <div className="voces-grid">
          {paginated.map((post) => {
            const pillBg = post.tag_color ?? "#E75733";
            const pillText = getContrastTextColor(pillBg);
            return (
              <Link
                key={post.id}
                to={`/voces/${slugify(post.title)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="blog-card">
                  {post.tag_name && (
                    <span
                      className="tag-pill tag-pill-card"
                      style={{ background: pillBg, color: pillText }}
                    >
                      {post.tag_name}
                    </span>
                  )}
                  <p className="blog-date">{formatDate(post.date)}</p>
                  {views?.has(post.id) && (
                    <p className="blog-views" title={`${views.get(post.id)} ${extra.readMany}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {(views.get(post.id) ?? 0).toLocaleString(locale)}{" "}
                      {views.get(post.id) === 1 ? extra.readOne : extra.readMany}
                    </p>
                  )}
                  <h3>{post.title}</h3>
                  <p style={{ fontStyle: "italic" }}>{shortenDescription(post.subtitle ?? "")}</p>
                  <p className="blog-written-by" style={{ fontSize: "13px", opacity: 0.6 }}>{t("voices.writtenBy")}</p>

                  <div className="perfil-grid">
                    {post.author_photo && (
                      <img
                        src={getDriveImage(post.author_photo)}
                        alt={`${post.author_name} ${post.author_lastname}`}
                        className="author-photo"
                        style={{ width: "40px" }}
                      />
                    )}
                    <div className="perfilDatos-grid">
                      <strong>{post.author_name} {post.author_lastname}</strong>
                      <p style={{ fontSize: "14px", opacity: 0.7 }}>{post.author_cargo}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          margin: "32px 0",
        }}>
          <button
            type="button"
            onClick={() => {
              setPage((p) => p - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === 1}
            style={{
              background: "none",
              border: "1px solid currentColor",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.3 : 1,
              fontSize: "18px",
            }}
          >←</button>
          <span style={{ fontSize: "14px", opacity: 0.7 }}>{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => {
              setPage((p) => p + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === totalPages}
            style={{
              background: "none",
              border: "1px solid currentColor",
              borderRadius: "4px",
              padding: "8px 16px",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.3 : 1,
              fontSize: "18px",
            }}
          >→</button>
        </div>
      )}
    </div>
  );
};
