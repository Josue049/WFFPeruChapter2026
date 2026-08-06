import { useCallback, useEffect, useMemo, useState } from "react";
import type { Article } from "../../types";
import { apiRequest } from "../../services/api";
import { ImageField } from "./ImageField";
import styles from "./AdminForms.module.css";

type ArticleForm = Omit<Article, "id">;

const emptyArticle = (): ArticleForm => ({
  author_name: "",
  author_lastname: "",
  author_photo: "",
  author_cargo: "",
  title: "",
  subtitle: "",
  date: new Date().toISOString().slice(0, 10),
  body: "",
});

export function ArticlesManager({ token }: { token: string }) {
  const [items, setItems] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyArticle());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setItems(await apiRequest<Article[]>("/articles", {}, { token, redirectOnUnauthorized: true }));
  }, [token]);
  useEffect(() => {
    let cancelled = false;

    void apiRequest<Article[]>("/articles", {}, { token, redirectOnUnauthorized: true })
      .then((data) => {
        if (!cancelled) setItems(data);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => items.filter((item) => `${item.title} ${item.author_name} ${item.author_lastname}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const select = (item: Article) => {
    setSelectedId(item.id);
    setForm({ ...item, date: item.date.slice(0, 10) });
    setMessage("");
  };

  const save = async () => {
    try {
      const result = await apiRequest<Article>(
        selectedId ? `/articles/${selectedId}` : "/articles",
        { method: selectedId ? "PUT" : "POST", body: JSON.stringify(form) },
        { token, redirectOnUnauthorized: true },
      );
      setSelectedId(result.id);
      setForm({ ...result, date: result.date.slice(0, 10) });
      await load();
      setMessage("Artículo guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar");
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar este artículo?")) return;
    await apiRequest(`/articles/${selectedId}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
    setSelectedId(null);
    setForm(emptyArticle());
    await load();
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Voces</h2><p>Artículos y columnas del capítulo.</p>
          <button className={styles.newButton} onClick={() => { setSelectedId(null); setForm(emptyArticle()); }}>+ Nuevo artículo</button>
        </div>
        <input className={styles.search} placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.itemList}>
          {filtered.map((item) => (
            <button key={item.id} className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`} onClick={() => select(item)}>
              <strong>{item.title}</strong><span>{item.author_name} {item.author_lastname}</span><small>{item.date}</small>
            </button>
          ))}
          {!filtered.length && <div className={styles.empty}>No hay artículos.</div>}
        </div>
      </aside>
      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <div><h2>{selectedId ? "Editar artículo" : "Nuevo artículo"}</h2><p>El contenido admite HTML editorial seguro.</p></div>
          <div className={styles.actions}>
            {selectedId && <button className={styles.dangerButton} onClick={remove}>Eliminar</button>}
            <button className={styles.primaryButton} onClick={save}>Guardar</button>
          </div>
        </div>
        <div className={styles.formGrid}>
          {message && <div className={styles.status}>{message}</div>}
          <ImageField label="Foto del autor" value={form.author_photo} token={token} onChange={(value) => setForm({ ...form, author_photo: value })} required />
          <div className={styles.twoColumns}>
            <Field label="Nombre" value={form.author_name} onChange={(value) => setForm({ ...form, author_name: value })} />
            <Field label="Apellido" value={form.author_lastname} onChange={(value) => setForm({ ...form, author_lastname: value })} />
          </div>
          <Field label="Cargo o entidad" value={form.author_cargo} onChange={(value) => setForm({ ...form, author_cargo: value })} />
          <Field label="Título" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Field label="Subtítulo" value={form.subtitle} onChange={(value) => setForm({ ...form, subtitle: value })} />
          <Field label="Fecha de publicación" type="date" value={form.date} onChange={(value) => setForm({ ...form, date: value })} />
          <TextArea label="Artículo" value={form.body} onChange={(value) => setForm({ ...form, body: value })} rows={14} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className={styles.field}><label>{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
function TextArea({ label, value, onChange, rows = 6 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <div className={styles.field}><label>{label}</label><textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
