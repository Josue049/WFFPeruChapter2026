import type { Article } from '../types';
import styles from './ArticleList.module.css';

interface Props {
  articles: Article[];
  currentId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ArticleList({ articles, currentId, onSelect, onNew }: Props) {
  const sorted = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <aside className={styles.sidebar}>
      <div className={styles.head}>
        <p className={styles.sidebarTitle}>Artículos publicados</p>
        <button className={styles.btnNew} onClick={onNew}>
          + Nuevo Artículo
        </button>
      </div>
      <div className={styles.list}>
        {sorted.length === 0 && (
          <p className={styles.empty}>No hay artículos aún.</p>
        )}
        {sorted.map((art) => (
          <div
            key={art.id}
            className={`${styles.item} ${art.id === currentId ? styles.active : ''}`}
            onClick={() => onSelect(art.id)}
          >
            <p className={styles.date}>{formatDate(art.date)}</p>
            <p className={styles.title}>{art.title}</p>
            <p className={styles.author}>{art.authorName} {art.authorLastname}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
