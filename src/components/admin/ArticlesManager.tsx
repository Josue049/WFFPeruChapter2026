import { useCallback, useEffect, useMemo, useState } from "react";
import type { Article } from "../../types";
import { apiRequest } from "../../services/api";
import { HtmlPreview } from "./HtmlPreview";
import { ImageField } from "./ImageField";
import { ArticleSubmissionsManager } from "./ArticleSubmissionsManager";
import { TagsManager } from "./TagsManager";
import { VoicesSettingsManager } from "./VoicesSettingsManager";
import styles from "./AdminForms.module.css";

type ArticleForm = Omit<Article, "id" | "tag_name" | "tag_color">;
type ArticleTag = { id: number; name: string; color: string };

interface ArticleViewsResponse {
  article_id: number;
  views: number;
  counted: boolean;
}

const emptyArticle = (): ArticleForm => ({
  author_name: "",
  author_lastname: "",
  author_photo: "",
  author_cargo: "",
  title: "",
  subtitle: "",
  date: new Date().toISOString().slice(0, 10),
  body: "",
  tag_id: null,
});

export function ArticlesManager({ token, currentUsername }: { token: string; currentUsername: string }) {
  const [view, setView] = useState<"published" | "submissions" | "tags" | "settings">("published");

  return (
    <div>
      <div className={styles.managerTabs}>
        <button className={view === "published" ? styles.managerTabActive : ""} onClick={() => setView("published")}>Artículos</button>
        <button className={view === "submissions" ? styles.managerTabActive : ""} onClick={() => setView("submissions")}>Postulaciones</button>
        <button className={view === "tags" ? styles.managerTabActive : ""} onClick={() => setView("tags")}>Etiquetas</button>
        <button className={view === "settings" ? styles.managerTabActive : ""} onClick={() => setView("settings")}>Configuración</button>
      </div>
      {view === "published" && <PublishedArticlesManager token={token} />}
      {view === "submissions" && <ArticleSubmissionsManager token={token} currentUsername={currentUsername} onPublished={() => setView("published")} />}
      {view === "tags" && <TagsManager token={token} />}
      {view === "settings" && <VoicesSettingsManager token={token} />}
    </div>
  );
}

function PublishedArticlesManager({ token }: { token: string }) {
  const [items, setItems] = useState<Article[]>([]);
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyArticle());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [viewsByArticle, setViewsByArticle] = useState<Record<number, number | null>>({});

  const load = useCallback(async () => {
    const articles = await apiRequest<Article[]>(
      "/articles",
      {},
      { token, redirectOnUnauthorized: true },
    );

    setItems(articles);
    setTags(await apiRequest<ArticleTag[]>("/article-tags"));
    setViewsByArticle({});

    const viewEntries = await Promise.all(
      articles.map(async (article) => {
        try {
          const data = await apiRequest<ArticleViewsResponse>(`/articles/${article.id}/views`);
          return [article.id, data.views] as const;
        } catch {
          // El GET público de vistas devuelve 404 si el artículo todavía
          // tiene fecha de publicación futura.
          return [article.id, null] as const;
        }
      }),
    );

    setViewsByArticle(Object.fromEntries(viewEntries));
  }, [token]);

  useEffect(() => {
    void load().catch((error) => {
      setMessage(error instanceof Error ? error.message : "No se pudieron cargar los artículos");
    });
  }, [load]);

  const filtered = useMemo(
    () => items.filter((item) => `${item.title} ${item.author_name} ${item.author_lastname}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const select = (item: Article) => {
    setSelectedId(item.id);
    // No copiamos `id` ni otros campos de respuesta al formulario.
    // El backend valida los PUT con extra=forbid y rechazaba esos campos.
    setForm({
      author_name: item.author_name ?? "",
      author_lastname: item.author_lastname ?? "",
      author_photo: item.author_photo ?? "",
      author_cargo: item.author_cargo ?? "",
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      date: item.date.slice(0, 10),
      body: item.body ?? "",
      tag_id: item.tag_id ?? null,
    });
    setMessage("");
  };

  const save = async () => {
    try {
      // Construimos explícitamente el payload para evitar enviar propiedades
      // de solo lectura que puedan venir en la respuesta de la API.
      const payload: ArticleForm = {
        author_name: form.author_name,
        author_lastname: form.author_lastname,
        author_photo: form.author_photo,
        author_cargo: form.author_cargo,
        title: form.title,
        subtitle: form.subtitle,
        date: form.date,
        body: form.body,
        tag_id: form.tag_id,
      };
      const result = await apiRequest<Article>(
          selectedId ? `/articles/${selectedId}` : "/articles",
          { method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload) },
          { token, redirectOnUnauthorized: true },
        );
      select(result);
      await load();
      setMessage("Artículo guardado correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar");
    }
  };

  const addTag = async () => {
    const name = newTag.trim().replace(/\s+/g, " ");
    if (!name || creatingTag) return;
    setCreatingTag(true);
    try {
      const created = await apiRequest<ArticleTag>("/article-tags", { method: "POST", body: JSON.stringify({ name }) }, { token, redirectOnUnauthorized: true });
      setTags(await apiRequest<ArticleTag[]>("/article-tags"));
      setForm((current) => ({ ...current, tag_id: created.id }));
      setNewTag("");
      setMessage(`Etiqueta «${created.name}» seleccionada.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear la etiqueta");
    } finally {
      setCreatingTag(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar este artículo?")) return;
    await apiRequest(`/articles/${selectedId}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
    setSelectedId(null);
    setForm(emptyArticle());
    await load();
  };

  const formatViews = (articleId: number) => {
    const views = viewsByArticle[articleId];

    if (views === undefined) return "Cargando lecturas…";
    if (views === null) return "Aún no publicado";

    return `${views.toLocaleString("es-PE")} ${views === 1 ? "lectura" : "lecturas"}`;
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
              <strong>{item.title}</strong>
              <span>{item.author_name} {item.author_lastname}{item.tag_name ? ` · ${item.tag_name}` : ""}</span>
              <small>{item.date} · {formatViews(item.id)}</small>
            </button>
          ))}
          {!filtered.length && <div className={styles.empty}>No hay artículos.</div>}
        </div>
      </aside>
      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <div>
            <h2>{selectedId ? "Editar artículo" : "Nuevo artículo"}</h2>
            <p>
              {selectedId
                ? `El contenido admite HTML editorial seguro. · ${formatViews(selectedId)}`
                : "El contenido admite HTML editorial seguro."}
            </p>
          </div>
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
          <Field label="Breve descripción" value={form.subtitle} onChange={(value) => setForm({ ...form, subtitle: value })} />
          <div className={styles.field}>
            <label>Etiqueta del artículo</label>
            <select value={form.tag_id ?? ""} onChange={(e) => setForm({ ...form, tag_id: e.target.value ? Number(e.target.value) : null })}>
              <option value="">Sin etiqueta (artículos anteriores)</option>
              {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input aria-label="Nueva etiqueta" value={newTag} placeholder="Nueva etiqueta" maxLength={80} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addTag(); } }} />
              <button type="button" disabled={!newTag.trim() || creatingTag} onClick={() => void addTag()}>+ Agregar</button>
            </div>
          </div>
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
  return <div className={styles.field}><label>{label}</label><textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /><HtmlPreview value={value} /></div>;
}
