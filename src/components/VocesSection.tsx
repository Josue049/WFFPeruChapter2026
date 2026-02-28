import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../types/article";

interface Props {
  posts: Article[];
}

const getDriveImage = (url: string) => {
  if (!url) return "";

  if (url.includes("drive.google.com")) {
    const match = url.match(/id=([^&]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  return url;
};

export const VocesSection: React.FC<Props> = ({ posts }) => {
  return (
    <div className="voces-grid">
      {posts
        .slice()
        .reverse()
        .map((post) => (
          <Link
            key={post.id}
            to={`/voces/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="blog-card" key={post.id}>
              <p style={{ fontSize: "13px", opacity: 0.6 }}>
                {new Date(post.date).toLocaleDateString()}
              </p>
              <h3>{post.title}</h3>

              <p style={{ fontStyle: "italic" }}>{post.subtitle}</p>

              <p style={{ fontSize: "13px", opacity: 0.6 }}>Escrito por:</p>

              <div className="perfil-grid">
                
                {post.author.photo && (
                  <img
                    src={getDriveImage(post.author.photo)}
                    alt={post.author.name}
                    className="author-photo"
                    style={{ width: "40px", filter: "grayscale(100%)" }}
                  />
                )}

                <p className="perfilDatos-grid">
                  <strong>{post.author.name}</strong>
                  <p style={{ fontSize: "14px", opacity: 0.7 }}>
                    {post.author.role}
                  </p>
                </p>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
};
