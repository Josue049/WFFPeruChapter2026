import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { NavBar } from "../components/Header/NavBar";
import { TopBar } from "../components/Header/TopBar";
import { ApiError, apiRequest } from "../services/api";
import type { MuroAuthorView, MuroCategory, MuroStatus } from "../types/muro";
import styles from "./Muro.module.css";

const STATUS_LABEL: Record<MuroStatus, string> = {
  pending: "En revisión",
  approved: "Publicada",
  observed: "Con observaciones",
  rejected: "No publicada",
  withdrawn: "Retirada",
};

/** Página privada del autor (enlace con token): estado, comentarios y corrección. */
export default function MuroMiReflexion() {
  const { token = "" } = useParams();
  const [post, setPost] = useState<MuroAuthorView | null>(null);
  const [categories, setCategories] = useState<MuroCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<MuroAuthorView>(`/muro/submissions/by-token/${encodeURIComponent(token)}`),
      apiRequest<MuroCategory[]>("/muro/categories"),
    ])
      .then(([data, cats]) => {
        if (!active) return;
        setPost(data);
        setCategories(cats);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof ApiError ? e.message : "No se pudo cargar la reflexión");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const editable = post?.status === "observed" || post?.status === "pending";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!post) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const updated = await apiRequest<MuroAuthorView>(`/muro/submissions/by-token/${encodeURIComponent(token)}`, {
        method: "PUT",
        body: JSON.stringify({
          author_name: post.author_name,
          title: post.title,
          category_id: post.category_id,
          body: post.body,
        }),
      });
      setPost(updated);
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };

  const update = (patch: Partial<MuroAuthorView>) => setPost((current) => (current ? { ...current, ...patch } : current));

  return (
    <>
      <TopBar />
      <NavBar />
      <main className={styles.page}>
        <div className={styles.article}>
          <Link to="/muro" className={styles.back}>← Muro</Link>
          {loading && <p className={styles.status} role="status">Cargando…</p>}
          {!loading && !post && <div className={styles.error} role="alert">{error || "Enlace no válido"}</div>}
          {post && (
            <>
              <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}>Tu reflexión</h1>
              <p><span className={styles.statusPill}>{STATUS_LABEL[post.status]}</span></p>
              {post.reviewer_notes && (
                <div className={styles.notice}><strong>Comentario del equipo:</strong><br />{post.reviewer_notes}</div>
              )}
              {post.status === "approved" && <div className={styles.success}>Tu reflexión ya está publicada en el Muro.</div>}
              {saved && <div className={styles.success} role="status">Cambios guardados. Tu reflexión volvió a revisión.</div>}
              {error && <div className={styles.error} role="alert">{error}</div>}

              <form onSubmit={save} className={styles.formGrid} style={{ marginTop: 20 }}>
                <div className={styles.field}>
                  <label htmlFor="mr-name">Nombre</label>
                  <input id="mr-name" value={post.author_name} disabled={!editable} onChange={(e) => update({ author_name: e.target.value })} maxLength={120} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="mr-cat">Categoría</label>
                  <select id="mr-cat" value={post.category_id ?? ""} disabled={!editable} onChange={(e) => update({ category_id: Number(e.target.value) })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="mr-title">Título</label>
                  <input id="mr-title" value={post.title} disabled={!editable} onChange={(e) => update({ title: e.target.value })} maxLength={160} />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="mr-body">Contenido</label>
                  <textarea id="mr-body" value={post.body} disabled={!editable} onChange={(e) => update({ body: e.target.value })} maxLength={6000} />
                </div>
                {editable && (
                  <div className={styles.fieldFull}>
                    <button type="submit" className={styles.primary} disabled={busy}>
                      {busy ? "Guardando…" : "Guardar y reenviar a revisión"}
                    </button>
                  </div>
                )}
              </form>
              {!editable && <p className={styles.hint}>Esta reflexión ya no puede editarse desde este enlace.</p>}
            </>
          )}
        </div>
      </main>
    </>
  );
}
