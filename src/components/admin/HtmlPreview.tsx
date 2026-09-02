import { sanitizeHtml } from "../../utils/sanitizeHtml";
import editorialStyles from "../../pages/EditorialPages.module.css";
import styles from "./AdminForms.module.css";

type PreviewVariant = "article" | "volunteer" | "milestone";

function previewHtml(value: string, variant: PreviewVariant) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Voluntarios e Hitos deben previsualizar EXACTAMENTE el mismo HTML que
  // renderiza la página pública. No agregamos <p> ni <br /> artificiales.
  if (variant === "volunteer" || variant === "milestone") {
    return sanitizeHtml(trimmed);
  }

  // Voces conserva la normalización anterior para texto plano.
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  const normalized = hasHtml
    ? trimmed
    : trimmed
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
        .join("");

  return sanitizeHtml(normalized);
}

export function HtmlPreview({
  value,
  compact = false,
  variant = "article",
}: {
  value: string;
  compact?: boolean;
  variant?: PreviewVariant;
}) {
  const html = previewHtml(value, variant);

  const content = () => {
    if (variant === "volunteer") {
      return (
        <div className={styles.volunteerPublicPreview}>
          <article className={editorialStyles.volunteerStoryBody}>
            <div
              className={editorialStyles.richText}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>
        </div>
      );
    }

    if (variant === "milestone") {
      return (
        <div className={styles.milestonePublicPreview}>
          <div className={editorialStyles.hitoStory}>
            <div
              className={editorialStyles.richText}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.articlePublicPreview}>
        <div className="article-page">
          <article className="ArticuloCompleto">
            <div className="bgDesktopWhite">
              <div
                className="ArticuloParrafos"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </article>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.htmlPreview} ${compact ? styles.htmlPreviewCompact : ""}`}>
      <div className={styles.htmlPreviewLabel}>
        <span>Vista previa</span>
        <small>Así se verá el contenido HTML publicado</small>
      </div>

      {html ? content() : (
        <div className={styles.htmlPreviewEmpty}>
          Escribe contenido para ver la vista previa.
        </div>
      )}
    </div>
  );
}
