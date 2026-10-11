import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { getContrastTextColor } from "../../utils/color";
import styles from "./AdminForms.module.css";

interface ArticleTag {
  id: number;
  name: string;
  color: string;
}

export function TagsManager({ token }: { token: string }) {
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E75733");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const data = await apiRequest<ArticleTag[]>("/article-tags");
    setTags(data);
  };

  useEffect(() => {
    void load().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "No se pudieron cargar las etiquetas"));
  }, []);

  const reset = () => {
    setEditingId(null);
    setName("");
    setColor("#E75733");
  };

  const submit = async () => {
    if (!name.trim()) return;
    try {
      const payload = { name: name.trim(), color };
      if (editingId) {
        await apiRequest(`/article-tags/${editingId}`, { method: "PUT", body: JSON.stringify(payload) }, { token, redirectOnUnauthorized: true });
        setMessage("Etiqueta actualizada correctamente.");
      } else {
        await apiRequest(`/article-tags`, { method: "POST", body: JSON.stringify(payload) }, { token, redirectOnUnauthorized: true });
        setMessage("Etiqueta creada correctamente.");
      }
      reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la etiqueta");
    }
  };

  const edit = (tag: ArticleTag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color || "#E75733");
    setMessage("");
  };

  const remove = async (tag: ArticleTag) => {
    if (!window.confirm(`¿Eliminar la etiqueta “${tag.name}”? Los artículos quedarán sin etiqueta.`)) return;
    try {
      await apiRequest(`/article-tags/${tag.id}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
      setMessage("Etiqueta eliminada.");
      if (editingId === tag.id) reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar la etiqueta");
    }
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Etiquetas</h2>
          <p>Administra nombre y color de cada tipo de artículo.</p>
        </div>
        <div className={styles.itemList}>
          {tags.map((tag) => (
            <div key={tag.id} className={styles.listItem} style={{ alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <strong>{tag.name}</strong>
                <span style={{ background: tag.color, color: getContrastTextColor(tag.color), borderRadius: 999, padding: "7px 12px", fontWeight: 700, fontSize: 12 }}>{tag.name}</span>
              </div>
              <small>{tag.color}</small>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className={styles.secondaryButton} type="button" onClick={() => edit(tag)}>Editar</button>
                <button className={styles.dangerButton} type="button" onClick={() => void remove(tag)}>Eliminar</button>
              </div>
            </div>
          ))}
          {!tags.length && <div className={styles.empty}>Todavía no hay etiquetas creadas.</div>}
        </div>
      </aside>
      <section className={styles.editor}>
        <div className={styles.editorHeader}>
          <div>
            <h2>{editingId ? "Editar etiqueta" : "Nueva etiqueta"}</h2>
            <p>Estas etiquetas se usan como chips de color en Voces y también en el filtro público.</p>
          </div>
          <div className={styles.actions}>
            {editingId && <button className={styles.secondaryButton} type="button" onClick={reset}>Cancelar</button>}
            <button className={styles.primaryButton} type="button" onClick={() => void submit()}>{editingId ? "Guardar cambios" : "Crear etiqueta"}</button>
          </div>
        </div>
        <div className={styles.formGrid}>
          {message && <div className={styles.status}>{message}</div>}
          <div className={styles.field}>
            <label>Nombre</label>
            <input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Ej. Informativo" />
          </div>
          <div className={styles.field}>
            <label>Color</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input type="color" value={color} onChange={(event) => setColor(event.target.value)} style={{ width: 64, height: 44, padding: 4 }} />
              <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="#E75733" maxLength={7} style={{ maxWidth: 180 }} />
              <span style={{ background: color, color: getContrastTextColor(color), borderRadius: 999, padding: "10px 16px", fontWeight: 700 }}>{name.trim() || "Vista previa"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
