import { useState, useEffect } from 'react';
import type { Article } from '../types';
import styles from './ArticleEditor.module.css';

type FormData = Omit<Article, 'id'>;

interface Props {
  article: Article | null;
  onSave: (data: FormData) => void;
  onDelete: () => void;
  onCancel: () => void;
  onTogglePreview: () => void;
  previewOpen: boolean;
  isMobile: boolean;
  onPreviewDataChange: (data: Partial<Article>) => void;
}

function emptyForm(): FormData {
  return {
    authorName: '',
    authorLastname: '',
    authorPhoto: '',
    authorCargo: '',
    title: '',
    subtitle: '',
    date: new Date().toISOString().split('T')[0],
    body: '',
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
}: Props) {
  const [form, setForm] = useState<FormData>(article ? { ...article } : emptyForm());

  // Sync form when selected article changes
  useEffect(() => {
    const initial = article ? { ...article } : emptyForm();
    setForm(initial);
    onPreviewDataChange(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article]);

  const set = (field: keyof FormData, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    onPreviewDataChange(next);
  };

  const handleSave = () => onSave(form);

  const fullName =
    [form.authorName, form.authorLastname].filter(Boolean).join(' ') || 'Nombre del Autor';

  return (
    <div className={styles.wrapper}>
      {/* ── HEADER ── */}
      <div className={styles.edHeader}>
        <div>
          <p className={styles.edMode}>
            {article ? '✦ Editando artículo' : '✦ Nuevo artículo'}
          </p>
          <h2 className={styles.edTitle}>
            {article ? 'Editar artículo' : 'Crear artículo'}
          </h2>
        </div>
        <div className={styles.edActions}>
          {!isMobile && (
            <button
              className={`${styles.btnToggle} ${previewOpen ? styles.on : ''}`}
              onClick={onTogglePreview}
            >
              👁 Vista previa{' '}
              <i className={styles.chevron}>{previewOpen ? '◀' : '▶'}</i>
            </button>
          )}
          {article && (
            <button className={`${styles.btn} ${styles.btnDel}`} onClick={onDelete}>
              🗑 Eliminar
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>
            Cancelar
          </button>
          <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave}>
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
            placeholder="https://ejemplo.com/foto.jpg"
            value={form.authorPhoto}
            onChange={(e) => set('authorPhoto', e.target.value)}
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={form.authorName}
              onChange={(e) => set('authorName', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Apellido</label>
            <input
              type="text"
              placeholder="Apellido"
              value={form.authorLastname}
              onChange={(e) => set('authorLastname', e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Cargo o entidad</label>
          <input
            type="text"
            placeholder="Ej. Investigador — UNALM"
            value={form.authorCargo}
            onChange={(e) => set('authorCargo', e.target.value)}
          />
        </div>

        {/* Mini author card */}
        <div className={styles.authPrev}>
          {form.authorPhoto ? (
            <img
              className={styles.authAv}
              src={form.authorPhoto}
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).style.display = 'none')
              }
              alt=""
            />
          ) : (
            <div className={styles.authAvPlaceholder}>👤</div>
          )}
          <div>
            <p className={styles.authName}>{fullName}</p>
            <p className={styles.authCargo}>
              {form.authorCargo || 'Cargo o entidad'}
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
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Frase subtítulo</label>
          <input
            type="text"
            placeholder="Una frase breve que complementa el título"
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Fecha de publicación</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Artículo completo</label>
          <textarea
            className={styles.textarea}
            placeholder="Escribe aquí el contenido completo del artículo..."
            value={form.body}
            onChange={(e) => set('body', e.target.value)}
          />
          <span className={styles.charCount}>
            {form.body.length.toLocaleString('es')} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
