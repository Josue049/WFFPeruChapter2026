import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/article";
import { slugify } from "../utils/slugify";

interface Props {
  posts: Article[];
}

const getDriveImage = (url: string) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    const match = url.match(/id=([^&]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }
  return url;
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
};

const PAGE_SIZE = 9;

export const VocesSection: React.FC<Props> = ({ posts }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = sorted.filter((post) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${post.author_name} ${post.author_lastname}`.toLowerCase();
    return post.title.toLowerCase().includes(q) || fullName.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div>
      {/* Barra de búsqueda */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        margin: "24px auto",
        maxWidth: "480px",
        padding: "0 16px",
        position: "relative",
      }}>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por título o autor..."
          style={{
            width: "100%",
            padding: "10px 36px 10px 14px",
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "8px",
            fontSize: "14px",
            background: "rgba(255, 255, 255, 0.73)",
            color: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              opacity: 0.4,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.5, margin: "40px 0" }}>
          No se encontraron artículos para "{search}".
        </p>
      ) : (
        <div className="voces-grid">
          {paginated.map((post) => (
            <Link
              key={post.id}
              to={`/voces/${slugify(post.title)}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="blog-card">
                <p style={{ fontSize: "13px", opacity: 0.6 }}>
                  {formatDate(post.date)}
                </p>
                <h3>{post.title}</h3>

                <p style={{ fontStyle: "italic" }}>{post.subtitle}</p>

                <p style={{ fontSize: "13px", opacity: 0.6 }}>Escrito por:</p>

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
                    <strong>
                      {post.author_name} {post.author_lastname}
                    </strong>
                    <p style={{ fontSize: "14px", opacity: 0.7 }}>
                      {post.author_cargo}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          margin: "32px 0",
        }}>
          <button
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
          >
            ←
          </button>

          <span style={{ fontSize: "14px", opacity: 0.7 }}>
            {page} / {totalPages}
          </span>

          <button
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
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};