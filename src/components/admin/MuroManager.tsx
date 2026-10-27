import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest } from "../../services/api";
import type { MuroAdminPage, MuroCategory, MuroPostAdmin, MuroStatus } from "../../types/muro";
import { mediaUrl } from "../../utils/mediaUrl";
import styles from "./AdminForms.module.css";

const STATUS_LABEL: Record<MuroStatus, string> = {
  pending: "Pendientes",
  observed: "Observadas",
  approved: "Aprobadas",
  rejected: "Rechazadas",
  withdrawn: "Retiradas",
};
const FILTERS: MuroStatus[] = ["pending", "observed", "approved", "rejected", "withdrawn"];

type ReviewAction = "approve" | "observe" | "reject" | "withdraw" | "reopen";

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function MuroManager({ token, currentUsername }: { token: string; currentUsername: string }) {
  const auth = { token, redirectOnUnauthorized: true };
  const [status, setStatus] = useState<MuroStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState<MuroAdminPage | null>(null);
  const [categories, setCategories] = useState<MuroCategory[]>([]);
  const [selected, setSelected] = useState<MuroPostAdmin | null>(null);
  const [draft, setDraft] = useState({ title: "", author_name: "", body: "", category_id: 0 });
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"inbox" | "categories">("inbox");

  const fail = (error: unknown, fallback: string) => {
    setIsError(true);
    setMessage(error instanceof ApiError ? error.message : fallback);
  };

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (status !== "all") params.set("status", status);
    if (search.trim()) params.set("q", search.trim());
    if (categoryFilter) params.set("category_id", categoryFilter);
    try {
      setPage(await apiRequest<MuroAdminPage>(`/admin/muro/posts?${params.toString()}`, {}, { token, redirectOnUnauthorized: true }));
    } catch (error) {
      fail(error, "No se pudo cargar la bandeja");
    }
  }, [status, search, categoryFilter, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const loadCategories = useCallback(async () => {
    setCategories(await apiRequest<MuroCategory[]>("/muro/categories"));
  }, []);
  useEffect(() => { void loadCategories(); }, [loadCategories]);

  const select = (post: MuroPostAdmin) => {
    setSelected(post);
    setDraft({ title: post.title, author_name: post.author_name, body: post.body, category_id: post.category?.id ?? 0 });
    setNotes(post.reviewer_notes ?? "");
    setMessage("");
    setIsError(false);
  };

  const saveEdits = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const updated = await apiRequest<MuroPostAdmin>(
        `/admin/muro/posts/${selected.id}`,
        { method: "PUT", body: JSON.stringify({ ...draft, category_id: draft.category_id || undefined }) },
        auth,
      );
      select(updated);
      setIsError(false);
      setMessage("Cambios guardados.");
      void load();
    } catch (error) {
      fail(error, "No se pudieron guardar los cambios");
    } finally {
      setBusy(false);
    }
  };

  const review = async (action: ReviewAction) => {
    if (!selected) return;
    if ((action === "observe" || action === "reject") && notes.trim().length < 5) {
      setIsError(true);
      setMessage("Escribe un comentario de revisión para el autor (mínimo 5 caracteres).");
      return;
    }
    if (action === "reject" && !window.confirm("¿Rechazar esta reflexión?")) return;
    setBusy(true);
    try {
      const updated = await apiRequest<MuroPostAdmin>(
        `/admin/muro/posts/${selected.id}/review`,
        { method: "POST", body: JSON.stringify({ action, notes: notes.trim() || null, send_email: sendEmail }) },
        auth,
      );
      select(updated);
      setIsError(false);
      setMessage(
        { approve: "Reflexión aprobada y publicada.", observe: "Marcada como observada.", reject: "Reflexión rechazada.", withdraw: "Reflexión retirada del Muro.", reopen: "Devuelta a pendientes." }[action],
      );
      void load();
    } catch (error) {
      fail(error, "No se pudo completar la acción");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selected || !window.confirm("¿Eliminar definitivamente esta reflexión y sus imágenes?")) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/muro/posts/${selected.id}`, { method: "DELETE" }, auth);
      setSelected(null);
      setIsError(false);
      setMessage("Reflexión eliminada.");
      void load();
    } catch (error) {
      fail(error, "No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className={styles.managerTabs} role="tablist">
        <button role="tab" aria-selected={tab === "inbox"} className={tab === "inbox" ? styles.managerTabActive : ""} onClick={() => setTab("inbox")}>Bandeja</button>
        <button role="tab" aria-selected={tab === "categories"} className={tab === "categories" ? styles.managerTabActive : ""} onClick={() => setTab("categories")}>Categorías</button>
      </div>

      {tab === "categories" ? (
        <CategoriesPanel token={token} categories={categories} reload={loadCategories} />
      ) : (
        <div className={styles.manager}>
          <aside className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h2>Reflexiones</h2>
              <p>{page ? `${page.total} resultados` : "Cargando…"}</p>
            </div>
            <input className={styles.search} placeholder="Buscar por título, autor o correo" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className={styles.field} style={{ padding: "0 16px 10px" }}>
              <select aria-label="Categoría" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.submissionFilters}>
              {FILTERS.map((key) => (
                <button key={key} className={status === key ? styles.filterActive : ""} onClick={() => setStatus(key)}>
                  {STATUS_LABEL[key]} ({page?.counts[key] ?? 0})
                </button>
              ))}
              <button className={status === "all" ? styles.filterActive : ""} onClick={() => setStatus("all")}>Todas</button>
            </div>
            <div className={styles.itemList}>
              {page?.items.map((post) => (
                <button key={post.id} className={`${styles.listItem} ${selected?.id === post.id ? styles.listItemActive : ""}`} onClick={() => select(post)}>
                  <strong>{post.title}</strong>
                  <span>{post.author_name}</span>
                  <small>{STATUS_LABEL[post.status]} · {formatDate(post.submitted_at)}</small>
                </button>
              ))}
              {page && page.items.length === 0 && <p className={styles.empty}>No hay reflexiones en este estado.</p>}
            </div>
          </aside>

          <section className={styles.editor}>
            {!selected ? (
              <div className={styles.emptyEditor}>
                <strong>Selecciona una reflexión</strong>
                <p>Revisa el contenido, edítalo si hace falta y apruébalo, obsérvalo o recházalo. Nada se publica automáticamente.</p>
              </div>
            ) : (
              <>
                <div className={styles.editorHeader}>
                  <div>
                    <h2>Revisar reflexión</h2>
                    <p>{STATUS_LABEL[selected.status].replace(/s$/, "")} · enviada {formatDate(selected.submitted_at)} · {selected.author_email}</p>
                  </div>
                  <div className={styles.actions}>
                    {currentUsername === "WFFAdmin" && <button className={styles.dangerButton} disabled={busy} onClick={remove}>Eliminar</button>}
                    <button className={styles.secondaryButton} disabled={busy} onClick={saveEdits}>Guardar edición</button>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  {message && <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>}
                  <div className={styles.twoColumns}>
                    <div className={styles.field}>
                      <label htmlFor="mm-title">Título</label>
                      <input id="mm-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={160} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="mm-author">Autor/a</label>
                      <input id="mm-author" value={draft.author_name} onChange={(e) => setDraft({ ...draft, author_name: e.target.value })} maxLength={120} />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="mm-cat">Categoría</label>
                    <select id="mm-cat" value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: Number(e.target.value) })}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="mm-body">Contenido</label>
                    <textarea id="mm-body" style={{ minHeight: 220 }} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} maxLength={6000} />
                  </div>
                  {selected.images.length > 0 && (
                    <div className={styles.galleryGrid}>
                      {selected.images.map((image) => (
                        <a key={image.id} href={mediaUrl(image.url)} target="_blank" rel="noopener noreferrer" className={styles.galleryItem}>
                          <img src={mediaUrl(image.url)} alt="" loading="lazy" />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className={styles.field}>
                    <label htmlFor="mm-notes">Comentario de revisión (se envía al autor al observar o rechazar)</label>
                    <textarea id="mm-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
                  </div>
                  <label className={styles.checkboxField} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                    Notificar al autor por correo (si el servidor tiene SMTP configurado)
                  </label>
                  <div className={styles.actions} style={{ justifyContent: "flex-start" }}>
                    {["pending", "observed", "rejected", "withdrawn"].includes(selected.status) && (
                      <button className={styles.primaryButton} disabled={busy} onClick={() => review("approve")}>Aprobar y publicar</button>
                    )}
                    {["pending", "approved"].includes(selected.status) && (
                      <button className={styles.secondaryButton} disabled={busy} onClick={() => review("observe")}>Observar</button>
                    )}
                    {["pending", "observed", "approved"].includes(selected.status) && (
                      <button className={styles.dangerButton} disabled={busy} onClick={() => review("reject")}>Rechazar</button>
                    )}
                    {selected.status === "approved" && (
                      <button className={styles.secondaryButton} disabled={busy} onClick={() => review("withdraw")}>Retirar del Muro</button>
                    )}
                    {["rejected", "withdrawn", "observed"].includes(selected.status) && (
                      <button className={styles.secondaryButton} disabled={busy} onClick={() => review("reopen")}>Devolver a pendientes</button>
                    )}
                  </div>
                  {selected.reviewed_at && <small>Última revisión: {formatDate(selected.reviewed_at)}</small>}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function CategoriesPanel({ token, categories, reload }: { token: string; categories: MuroCategory[]; reload: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E75733");
  const [message, setMessage] = useState("");
  const auth = { token, redirectOnUnauthorized: true };

  const run = async (action: () => Promise<unknown>, ok: string) => {
    try {
      await action();
      await reload();
      setMessage(ok);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "No se pudo completar la acción");
    }
  };

  return (
    <section className={styles.settingCard}>
      <h2>Categorías del Muro</h2>
      {message && <div className={styles.status} role="status">{message}</div>}
      <div className={styles.twoColumns} style={{ margin: "16px 0" }}>
        <div className={styles.field}>
          <label htmlFor="cat-name">Nueva categoría</label>
          <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <div className={styles.field}>
          <label htmlFor="cat-color">Color</label>
          <input id="cat-color" type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} />
        </div>
      </div>
      <button
        className={styles.primaryButton}
        disabled={name.trim().length < 2}
        onClick={() => run(async () => {
          await apiRequest("/admin/muro/categories", { method: "POST", body: JSON.stringify({ name: name.trim(), color, position: categories.length }) }, auth);
          setName("");
        }, "Categoría creada.")}
      >
        Crear categoría
      </button>
      <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
        {categories.map((category) => (
          <div key={category.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ width: 14, height: 14, borderRadius: "50%", background: category.color }} aria-hidden="true" />
            <strong style={{ flex: 1, minWidth: 160 }}>{category.name}</strong>
            <input
              type="color"
              aria-label={`Color de ${category.name}`}
              defaultValue={category.color}
              onBlur={(e) => e.target.value.toUpperCase() !== category.color.toUpperCase() && void run(
                () => apiRequest(`/admin/muro/categories/${category.id}`, { method: "PUT", body: JSON.stringify({ color: e.target.value.toUpperCase() }) }, auth),
                "Color actualizado.",
              )}
            />
            <button
              className={styles.secondaryButton}
              onClick={() => {
                const next = window.prompt("Nuevo nombre", category.name);
                if (next && next.trim().length >= 2 && next !== category.name) {
                  void run(() => apiRequest(`/admin/muro/categories/${category.id}`, { method: "PUT", body: JSON.stringify({ name: next.trim() }) }, auth), "Categoría renombrada.");
                }
              }}
            >
              Renombrar
            </button>
            <button
              className={styles.dangerButton}
              onClick={() => window.confirm(`¿Eliminar «${category.name}»?`) && void run(() => apiRequest(`/admin/muro/categories/${category.id}`, { method: "DELETE" }, auth), "Categoría eliminada.")}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
