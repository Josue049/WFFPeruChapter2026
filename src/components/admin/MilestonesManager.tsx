import { useCallback, useEffect, useMemo, useState } from "react";
import type { Milestone } from "../../types";
import { apiRequest } from "../../services/api";
import { GalleryField, ImageField } from "./ImageField";
import { HtmlPreview } from "./HtmlPreview";
import styles from "./AdminForms.module.css";

type MilestoneForm = Omit<Milestone, "id" | "created_at" | "updated_at">;

const emptyMilestone = (): MilestoneForm => ({
  title: "",
  slug: "",
  summary: "",
  body: "",
  event_date: new Date().toISOString().slice(0, 10),
  category: "Evento",
  location: "",
  cover_image: "",
  gallery: [],
  featured: false,
  published: true,
});

export function MilestonesManager({ token }: { token: string }) {
  const [items, setItems] = useState<Milestone[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<MilestoneForm>(emptyMilestone());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setItems(await apiRequest<Milestone[]>("/milestones", {}, { token, redirectOnUnauthorized: true }));
  }, [token]);
  useEffect(() => {
    let cancelled = false;

    void apiRequest<Milestone[]>("/milestones", {}, { token, redirectOnUnauthorized: true })
      .then((data) => {
        if (!cancelled) setItems(data);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.category} ${item.location ?? ""}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const select = (item: Milestone) => {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      event_date: item.event_date.slice(0, 10),
      category: item.category,
      location: item.location ?? "",
      cover_image: item.cover_image,
      gallery: item.gallery ?? [],
      featured: item.featured,
      published: item.published,
    });
    setMessage("");
  };

  const save = async () => {
    try {
      const payload = { ...form, slug: form.slug || null, location: form.location || null };
      const result = await apiRequest<Milestone>(
        selectedId ? `/milestones/${selectedId}` : "/milestones",
        { method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload) },
        { token, redirectOnUnauthorized: true },
      );
      select(result);
      await load();
      setMessage("Hito guardado. La línea de tiempo se actualizará según su fecha.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar");
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar este hito y su publicación?")) return;
    await apiRequest(`/milestones/${selectedId}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
    setSelectedId(null); setForm(emptyMilestone()); await load();
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Hitos</h2><p>Archivo visual organizado automáticamente por meses.</p>
          <button className={styles.newButton} onClick={() => { setSelectedId(null); setForm(emptyMilestone()); }}>+ Nuevo hito</button>
        </div>
        <input className={styles.search} placeholder="Buscar por título, categoría…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.itemList}>
          {filtered.map((item) => (
            <button key={item.id} className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`} onClick={() => select(item)}>
              <strong>{item.title}</strong><span>{item.category}{item.location ? ` · ${item.location}` : ""}</span><small>{formatMonth(item.event_date)} · {item.published ? "Publicado" : "Borrador"}</small>
            </button>
          ))}
          {!filtered.length && <div className={styles.empty}>Crea el primer momento de la historia del capítulo.</div>}
        </div>
      </aside>

      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <div><h2>{selectedId ? "Editar hito" : "Nuevo hito"}</h2><p>La fecha determina el mes y el orden en la página pública.</p></div>
          <div className={styles.actions}>{selectedId && <button className={styles.dangerButton} onClick={remove}>Eliminar</button>}<button className={styles.primaryButton} onClick={save}>Guardar</button></div>
        </div>
        <div className={styles.formGrid}>
          {message && <div className={styles.status}>{message}</div>}
          <ImageField label="Imagen principal" value={form.cover_image} token={token} onChange={(cover_image) => setForm({ ...form, cover_image })} help="Recomendado: formato horizontal y alta resolución. Se conserva mucha más calidad y nunca se recorta en la vista pública." required />
          <div className={styles.twoColumns}>
            <Field label="Título" value={form.title} onChange={(title) => setForm({ ...form, title })} />
            <Field label="Slug opcional" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} placeholder="Se genera automáticamente" />
          </div>
          <TextArea label="Resumen para la tarjeta" value={form.summary} onChange={(summary) => setForm({ ...form, summary })} rows={3} preview={false} />
          <div className={styles.threeColumns}>
            <Field label="Fecha del hito" type="date" value={form.event_date} onChange={(event_date) => setForm({ ...form, event_date })} />
            <Field label="Categoría" value={form.category} onChange={(category) => setForm({ ...form, category })} placeholder="Evento, alianza, reconocimiento…" />
            <Field label="Lugar" value={form.location ?? ""} onChange={(location) => setForm({ ...form, location })} />
          </div>
          <TextArea label="Historia completa" value={form.body} onChange={(body) => setForm({ ...form, body })} rows={12} />
          <GalleryField value={form.gallery} token={token} onChange={(gallery) => setForm({ ...form, gallery })} />
          <div className={styles.checkboxRow}>
            <Check label="Publicado" checked={form.published} onChange={(published) => setForm({ ...form, published })} />
            <Check label="Hito destacado" checked={form.featured} onChange={(featured) => setForm({ ...form, featured })} />
          </div>
        </div>
      </section>
    </div>
  );
}

function formatMonth(value: string) { return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("es-PE", { month: "long", year: "numeric" }); }
function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <div className={styles.field}><label>{label}</label><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>; }
function TextArea({ label, value, onChange, rows, preview = true }: { label: string; value: string; onChange: (value: string) => void; rows: number; preview?: boolean }) { return <div className={styles.field}><label>{label}</label><textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />{preview && <HtmlPreview value={value} compact={rows <= 4} />}</div>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className={styles.checkboxField}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><label>{label}</label></div>; }
