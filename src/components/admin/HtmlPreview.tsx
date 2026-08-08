import { sanitizeHtml } from "../../utils/sanitizeHtml";
import styles from "./AdminForms.module.css";

function previewHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  const normalized = hasHtml
    ? trimmed
    : trimmed
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
        .join("");
  return sanitizeHtml(normalized);
}

export function HtmlPreview({ value, compact = false }: { value: string; compact?: boolean }) {
  const html = previewHtml(value);
  return (
    <div className={`${styles.htmlPreview} ${compact ? styles.htmlPreviewCompact : ""}`}>
      <div className={styles.htmlPreviewLabel}>
        <span>Vista previa</span>
        <small>Así se verá el contenido HTML publicado</small>
      </div>
      {html ? (
        <div className={styles.htmlPreviewContent} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className={styles.htmlPreviewEmpty}>Escribe contenido para ver la vista previa.</div>
      )}
    </div>
  );
}
