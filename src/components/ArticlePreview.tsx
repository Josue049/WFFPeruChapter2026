import type { Article } from "../types";
import styles from "./ArticlePreview.module.css";

interface Props {
  data: Partial<Article> | null;
  onClose: () => void;
  closeLabel?: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface Props {
  data: Partial<Article> | null;
  onClose: () => void;
  closeLabel?: string;
  isMobile: boolean; // 👈 agregar
}

export function ArticlePreview({
  data,
  onClose,
  closeLabel = "✕",
  isMobile,
}: Props) {
  const fullName = [data?.author_name, data?.author_lastname]
    .filter(Boolean)
    .join(" ");
  const isEmpty = !data?.title && !fullName && !data?.body;

  return (
    <div className={styles.panel}>
      {/* Panel header bar */}
      <div className={styles.barHdr}>
        <div className={styles.barLeft}>
          <span className={styles.dot} />
          <span className={styles.label}>Vista previa en tiempo real</span>
        </div>
        {!isMobile && (
          <button className={styles.btnClose} onClick={onClose} title="Cerrar">
            {closeLabel}
          </button>
        )}
      </div>

      {/* Scrollable preview content */}
      <div className={styles.scroll}>
        {isEmpty ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👁️</span>
            <p className={styles.emptyTitle}>Vista previa</p>
            <p className={styles.emptySub}>
              Empieza a escribir para ver cómo lucirá el artículo
            </p>
          </div>
        ) : (
          <div className={styles.page}>
            {/* Article body */}
            <div className={styles.body}>
              <p className={styles.crumb}>
                Voces del Capítulo <span>/ Artículo</span>
              </p>
              {data?.author_photo ? (
                <img
                  className={styles.photo}
                  src={data.author_photo}
                  onError={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.display =
                      "none")
                  }
                  alt={fullName}
                />
              ) : (
                <div className={`${styles.photo} ${styles.photoPlaceholder}`}>
                  👤
                </div>
              )}
              {fullName && <p className={styles.authorName}>{fullName}</p>}
              {data?.author_cargo ? (
                <p className={styles.authorCargo}>{data.author_cargo}</p>
              ) : (
                <div style={{ marginBottom: 32 }} />
              )}
              {data?.title && <h1 className={styles.artTitle}>{data.title}</h1>}
              {data?.subtitle && (
                <p className={styles.subtitle}>{data.subtitle}</p>
              )}
              {data?.date && (
                <p className={styles.date}>
                  Publicado el {formatDate(data.date)}
                </p>
              )}
              <div className={styles.divider} />
              {data?.body && (
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: data.body }}
                />
              )}{" "}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
