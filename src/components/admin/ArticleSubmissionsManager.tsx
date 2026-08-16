import { useCallback, useEffect, useMemo, useState } from "react";
import type { Article, ArticleSubmission } from "../../types";
import { apiRequest } from "../../services/api";
import { HtmlPreview } from "./HtmlPreview";
import { ImageField } from "./ImageField";
import styles from "./AdminForms.module.css";

type EditableSubmission = Pick<ArticleSubmission,
  "author_name" | "author_lastname" | "author_photo" | "author_cargo" | "author_email" | "is_chapter_member" | "title" | "subtitle" | "body"
> & { reviewer_notes: string; status: "pending" | "in_review" | "rejected" };

export function ArticleSubmissionsManager({ token, onPublished }: { token: string; onPublished?: (article: Article) => void }) {
  const [items, setItems] = useState<ArticleSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<EditableSubmission | null>(null);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setItems(await apiRequest<ArticleSubmission[]>("/article-submissions", {}, { token, redirectOnUnauthorized: true }));
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => items.filter((item) => {
    const matchesSearch = `${item.title} ${item.author_name} ${item.author_lastname} ${item.author_email}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === "all" || (filter === "active" ? item.status !== "published" && item.status !== "rejected" : item.status === filter);
    return matchesSearch && matchesStatus;
  }), [items, search, filter]);

  const select = (item: ArticleSubmission) => {
    setSelectedId(item.id);
    setForm({
      author_name: item.author_name,
      author_lastname: item.author_lastname,
      author_photo: item.author_photo,
      author_cargo: item.author_cargo,
      author_email: item.author_email,
      is_chapter_member: item.is_chapter_member,
      title: item.title,
      subtitle: item.subtitle,
      body: item.body,
      reviewer_notes: item.reviewer_notes ?? "",
      status: item.status === "rejected" ? "rejected" : item.status === "in_review" ? "in_review" : "pending",
    });
    setMessage("");
  };

  const saveReview = async () => {
    if (!selectedId || !form) return;
    setBusy(true);
    setMessage("");
    try {
      const updated = await apiRequest<ArticleSubmission>(`/article-submissions/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, reviewer_notes: form.reviewer_notes.trim() || null }),
      }, { token, redirectOnUnauthorized: true });
      await load();
      select(updated);
      setMessage("Postulación actualizada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la revisión.");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!selectedId || !form) return;
    if (!window.confirm("¿Publicar esta postulación como artículo de Voces?")) return;
    setBusy(true);
    setMessage("");
    try {
      await apiRequest(`/article-submissions/${selectedId}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, status: "in_review", reviewer_notes: form.reviewer_notes.trim() || null }),
      }, { token, redirectOnUnauthorized: true });
      const article = await apiRequest<Article>(`/article-submissions/${selectedId}/publish`, { method: "POST" }, { token, redirectOnUnauthorized: true });
      await load();
      setSelectedId(null);
      setForm(null);
      setMessage(`Publicado correctamente como artículo #${article.id}.`);
      onPublished?.(article);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo publicar la postulación.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Postulaciones</h2>
          <p>Artículos enviados desde el formulario público.</p>
        </div>
        <input className={styles.search} placeholder="Buscar postulación…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className={styles.submissionFilters}>
          {[
            ["active", "Pendientes"], ["in_review", "En revisión"], ["rejected", "Rechazados"], ["published", "Publicados"], ["all", "Todos"],
          ].map(([value, label]) => <button key={value} className={filter === value ? styles.filterActive : ""} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <div className={styles.itemList}>
          {visible.map((item) => (
            <button key={item.id} className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`} onClick={() => select(item)}>
              <strong>{item.title}</strong>
              <span>{item.author_name} {item.author_lastname}</span>
              <small>{item.is_chapter_member ? "Miembro del capítulo" : "No miembro"} · {statusLabel(item.status)} · {formatDate(item.submitted_at)}</small>
            </button>
          ))}
          {!visible.length && <div className={styles.empty}>No hay postulaciones en este filtro.</div>}
        </div>
      </aside>

      <section className={styles.editor}>
        {!form ? (
          <div className={styles.emptyEditor}><strong>Selecciona una postulación</strong><p>Podrás corregirla, dejar notas, rechazarla o publicarla.</p></div>
        ) : (
          <>
            <div className={styles.editorHeader}>
              <div><h2>Revisar postulación</h2><p>Enviada el {formatDate(items.find((item) => item.id === selectedId)?.submitted_at ?? "")}</p></div>
              <div className={styles.actions}>
                <button className={styles.secondaryButton} disabled={busy} onClick={saveReview}>Guardar revisión</button>
                <button className={styles.primaryButton} disabled={busy || form.status === "rejected"} onClick={publish}>{busy ? "Procesando…" : "Aprobar y publicar"}</button>
              </div>
            </div>
            <div className={styles.formGrid}>
              {message && <div className={styles.status}>{message}</div>}
              <ImageField label="Foto del autor" value={form.author_photo} token={token} onChange={(author_photo) => setForm({ ...form, author_photo })} required />
              <div className={styles.twoColumns}>
                <Field label="Nombre" value={form.author_name} onChange={(author_name) => setForm({ ...form, author_name })} />
                <Field label="Apellido" value={form.author_lastname} onChange={(author_lastname) => setForm({ ...form, author_lastname })} />
              </div>
              <div className={styles.twoColumns}>
                <Field label="Cargo o entidad" value={form.author_cargo} onChange={(author_cargo) => setForm({ ...form, author_cargo })} />
                <Field label="Correo del postulante" type="email" value={form.author_email} onChange={(author_email) => setForm({ ...form, author_email })} />
              </div>
              <div className={styles.memberReviewCard}>
                <div>
                  <strong>Membresía declarada</strong>
                  <span className={form.is_chapter_member ? styles.memberBadgeYes : styles.memberBadgeNo}>
                    {form.is_chapter_member ? "Miembro registrado del capítulo" : "No es miembro del capítulo"}
                  </span>
                </div>
                <label>
                  <span>Corregir dato</span>
                  <select value={form.is_chapter_member ? "yes" : "no"} onChange={(event) => setForm({ ...form, is_chapter_member: event.target.value === "yes" })}>
                    <option value="yes">Sí, miembro</option>
                    <option value="no">No miembro</option>
                  </select>
                </label>
              </div>
              <Field label="Título" value={form.title} onChange={(title) => setForm({ ...form, title })} />
              <Field label="Breve descripción" value={form.subtitle} onChange={(subtitle) => setForm({ ...form, subtitle })} />
              <div className={styles.field}><label>Artículo</label><textarea rows={16} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /><HtmlPreview value={form.body} /></div>
              <div className={styles.twoColumns}>
                <div className={styles.field}><label>Estado</label><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EditableSubmission["status"] })}><option value="pending">Pendiente</option><option value="in_review">En revisión</option><option value="rejected">Rechazado</option></select></div>
                <div className={styles.field}><label>Notas internas del revisor</label><textarea rows={5} value={form.reviewer_notes ?? ""} onChange={(event) => setForm({ ...form, reviewer_notes: event.target.value })} /></div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className={styles.field}><label>{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function statusLabel(status: string) {
  return ({ pending: "Pendiente", in_review: "En revisión", rejected: "Rechazado", published: "Publicado" } as Record<string, string>)[status] ?? status;
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
