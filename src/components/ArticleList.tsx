import { useState } from "react";
import type { Article } from '../types';
import styles from './ArticleList.module.css';

interface Props {
  articles: Article[];
  currentId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 9;

export function ArticleList({ articles, currentId, onSelect, onNew }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const sorted = [...articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = sorted.filter((art) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${art.author_name} ${art.author_lastname}`.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      fullName.includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // resetear a página 1 al buscar
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.head}>
        <p className={styles.sidebarTitle}>Artículos publicados</p>
        <button className={styles.btnNew} onClick={onNew}>
          + Nuevo Artículo
        </button>
      </div>

      <div className={styles.searchWrap}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por título o autor..."
          value={search}
          onChange={handleSearch}
        />
        {search && (
          <button
            className={styles.searchClear}
            onClick={() => { setSearch(""); setPage(1); }}
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 && (
          <p className={styles.empty}>
            {search ? "Sin resultados." : "No hay artículos aún."}
          </p>
        )}
        {paginated.map((art) => (
          <div
            key={art.id}
            className={`${styles.item} ${art.id === currentId ? styles.active : ""}`}
            onClick={() => onSelect(art.id)}
          >
            <p className={styles.date}>{formatDate(art.date)}</p>
            <p className={styles.title}>{art.title}</p>
            <p className={styles.author}>{art.author_name} {art.author_lastname}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            ←
          </button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            →
          </button>
        </div>
      )}
    </aside>
  );
}


