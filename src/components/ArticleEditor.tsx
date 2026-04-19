import { useState, useEffect } from "react";
import type { Article, TabType } from "../types";
import styles from "./ArticleEditor.module.css";

type FormData = Omit<Article, "id">;

interface Props {
  article: Article | null;
  onSave: (data: FormData) => void;
  onDelete: () => void;
  onCancel: () => void;
  onTogglePreview: () => void;
  previewOpen: boolean;
  isMobile: boolean;
  onPreviewDataChange: (data: Partial<Article>) => void;
  mobileTab: TabType;
}

function emptyForm(): FormData {
  return {
    author_name: "",
    author_lastname: "",
    author_photo: "",
    author_cargo: "",
    title: "",
    subtitle: "",
    date: new Date().toISOString().split("T")[0],
    body: "",
  };
}

export function ArticleEditor({
  article,
  onSave,
  onDelete,
  onCancel,
  onTogglePreview,
  previewOpen,
  isMobile,
  onPreviewDataChange,
  mobileTab,
}: Props) {
  const [form, setForm] = useState<FormData>(
    article ? { ...article } : emptyForm(),
  );

  // Ocultar el wrapper cuando estamos en móvil y la tab activa es "preview"
  const hideWrapper = isMobile && mobileTab === "preview";

  useEffect(() => {
    const initial = article ? { ...article } : emptyForm();
    setForm(initial);
    onPreviewDataChange(initial);
  }, [article]);

  const set = (field: keyof FormData, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    onPreviewDataChange(next);
  };

  const handleSave = () => onSave(form);

  const fullName =
    [form.author_name, form.author_lastname].filter(Boolean).join(" ") ||
    "Nombre del Autor";

  return (
    // ✅ CORREGIDO: eliminado editorPanelRef (pertenece al padre),
    //    y se aplica hideWrapper correctamente con la clase CSS correspondiente
    <div
      className={`${styles.editorPanel} ${hideWrapper ? styles.hidden : ""}`}
    >
      {/* ── HEADER ── */}
      <div className={styles.edHeader}>
        <div>
          <p className={styles.edMode}>
            {article ? "✦ Editando artículo" : "✦ Nuevo artículo"}
          </p>
          <h2 className={styles.edTitle}>
            {article ? "Editar artículo" : "Crear artículo"}
          </h2>
        </div>
        <div className={styles.edActions}>
          {!isMobile && (
            <button
              className={`${styles.btnToggle} ${previewOpen ? styles.on : ""}`}
              onClick={onTogglePreview}
            >
              👁 Vista previa{" "}
              <i className={styles.chevron}>{previewOpen ? "◀" : "▶"}</i>
            </button>
          )}
          {article && (
            <button
              className={`${styles.btn} ${styles.btnDel}`}
              onClick={onDelete}
            >
              🗑 Eliminar
            </button>
          )}
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`${styles.btn} ${styles.btnSave}`}
            onClick={handleSave}
          >
            Guardar →
          </button>
        </div>
      </div>

      {/* ── CARD: AUTOR ── */}
      <div className={styles.card}>
        <div className={`${styles.cardHdr} ${styles.orange}`}>
          <span className={styles.cardHdrTitle}>👤 Información del Autor</span>
          <span className={styles.cardHdrTriangle}>▲</span>
        </div>

        <div className={styles.field}>
          <label>Link de foto del autor</label>
          <input
            type="url"
            placeholder="https://ejemplo.com/foto.webp"
            value={form.author_photo}
            onChange={(e) => set("author_photo", e.target.value)}
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={form.author_name}
              onChange={(e) => set("author_name", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Apellido</label>
            <input
              type="text"
              placeholder="Apellido"
              value={form.author_lastname}
              onChange={(e) => set("author_lastname", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Cargo o entidad</label>
          <input
            type="text"
            placeholder="Ej. Investigador — UNALM"
            value={form.author_cargo}
            onChange={(e) => set("author_cargo", e.target.value)}
          />
        </div>

        {/* Mini author card */}
        <div className={styles.authPrev}>
          {form.author_photo ? (
            <img
              className={styles.authAv}
              src={form.author_photo}
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).style.display = "none")
              }
              alt=""
            />
          ) : (
            <div className={styles.authAvPlaceholder}>👤</div>
          )}
          <div>
            <p className={styles.authName}>{fullName}</p>
            <p className={styles.authCargo}>
              {form.author_cargo || "Cargo o entidad"}
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD: CONTENIDO ── */}
      <div className={styles.card}>
        <div className={`${styles.cardHdr} ${styles.blue}`}>
          <span className={styles.cardHdrTitle}>📝 Contenido del Artículo</span>
          <span className={styles.cardHdrTriangle}>▲</span>
        </div>

        <div className={styles.field}>
          <label>Nombre del artículo</label>
          <input
            type="text"
            placeholder="Título principal del artículo"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Frase subtítulo</label>
          <input
            type="text"
            placeholder="Una frase breve que complementa el título"
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Fecha de publicación</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Artículo completo</label>
          <textarea
            className={styles.textarea}
            placeholder="Escribe aquí el contenido completo del artículo..."
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
          />
          <span className={styles.charCount}>
            {form.body.length.toLocaleString("es")} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
