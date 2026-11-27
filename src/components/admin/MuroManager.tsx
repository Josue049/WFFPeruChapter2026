import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiRequest } from "../../services/api";
import type { MuroAdminPage, MuroCategory, MuroPostAdmin, MuroStatus } from "../../types/muro";
import { getContrastTextColor } from "../../utils/color";
import { optimizeEditorialImageFile } from "../../utils/imageOptimizer";
import { mediaUrl } from "../../utils/mediaUrl";
import styles from "./AdminForms.module.css";
import { ImageField } from "./ImageField";
import { cleanMuroHtml, isHtml, toEditorBody, visibleLength } from "../../utils/richText";
import { RichTextEditor } from "../editor/RichTextEditor";
import { ModeSwitch } from "../editor/ModeSwitch";
import type { EditorMode } from "../editor/ModeSwitch";
import editorStyles from "./StoryEditor.module.css";
import muroStyles from "../../pages/Muro.module.css";

const MAX_PHOTOS = 8;
const PAGE_SIZE = 50;
// Correo interno que el servidor asigna a lo creado desde el panel: no es de quien escribe, no se muestra.
const TEAM_EMAIL = "redaccion@wffperu.org";
const AUTHOR_ASPECTS = [{ label: "Cuadrado 1:1", value: 1 }];

const STATUS_LABEL: Record<MuroStatus, string> = {
  pending: "Pendiente",
  observed: "Observada",
  approved: "Publicada",
  rejected: "Rechazada",
  withdrawn: "Retirada",
};

const SUBMISSION_FILTERS: [MuroStatus, string][] = [
  ["pending", "Pendientes"],
  ["observed", "Observadas"],
  ["rejected", "Rechazadas"],
  ["withdrawn", "Retiradas"],
];

type View = "published" | "submissions" | "tags";
type ReviewAction = "approve" | "observe" | "reject" | "withdraw" | "reopen";
type Draft = { title: string; author_name: string; author_photo: string; body: string; category_id: number };

const REVIEW_MESSAGE: Record<ReviewAction, string> = {
  approve: "Publicada en el Muro.",
  observe: "Marcada como observada.",
  reject: "Postulación rechazada.",
  withdraw: "Retirada del Muro. La encuentras en Postulados → Retiradas.",
  reopen: "Devuelta a pendientes.",
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" }) : "—";

const errorText = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback);

const toDraft = (post: MuroPostAdmin): Draft => ({
  title: post.title,
  author_name: post.author_name,
  author_photo: post.author_photo ?? "",
  body: toEditorBody(post.body),
  category_id: post.category?.id ?? 0,
});

const isValidDraft = (draft: Draft) =>
  draft.title.trim().length >= 5 && draft.author_name.trim().length >= 2 && visibleLength(cleanMuroHtml(draft.body)) >= 20;

export function MuroManager({ token, currentUsername }: { token: string; currentUsername: string }) {
  const [view, setView] = useState<View>("published");
  // Reflexión que debe quedar abierta al llegar a "Publicados" tras aprobarla.
  const [justPublished, setJustPublished] = useState<MuroPostAdmin | null>(null);

  const open = (next: View) => {
    setJustPublished(null);
    setView(next);
  };

  return (
    <div>
      <div className={styles.managerTabs}>
        <button className={view === "published" ? styles.managerTabActive : ""} onClick={() => open("published")}>Publicados</button>
        <button className={view === "submissions" ? styles.managerTabActive : ""} onClick={() => open("submissions")}>Postulados</button>
        <button className={view === "tags" ? styles.managerTabActive : ""} onClick={() => open("tags")}>Etiquetas</button>
      </div>
      {view === "published" && (
        <PostsManager key="published" mode="published" token={token} currentUsername={currentUsername} initial={justPublished} />
      )}
      {view === "submissions" && (
        <PostsManager
          key="submissions"
          mode="submissions"
          token={token}
          currentUsername={currentUsername}
          onPublished={(post) => {
            setJustPublished(post);
            setView("published");
          }}
        />
      )}
      {view === "tags" && <MuroTagsManager token={token} />}
    </div>
  );
}

function PostsManager({
  mode,
  token,
  currentUsername,
  initial = null,
  onPublished,
}: {
  mode: "published" | "submissions";
  token: string;
  currentUsername: string;
  initial?: MuroPostAdmin | null;
  onPublished?: (post: MuroPostAdmin) => void;
}) {
  const isPublished = mode === "published";
  const [filter, setFilter] = useState<MuroStatus>("pending");
  const status: MuroStatus = isPublished ? "approved" : filter;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [items, setItems] = useState<MuroPostAdmin[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [categories, setCategories] = useState<MuroCategory[]>([]);
  const [selected, setSelected] = useState<MuroPostAdmin | null>(initial);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(initial ? toDraft(initial) : { title: "", author_name: "", author_photo: "", body: "", category_id: 0 });
  const [publishNow, setPublishNow] = useState(true);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState(initial?.reviewer_notes ?? "");
  const [sendEmail, setSendEmail] = useState(true);
  const [message, setMessage] = useState(initial ? REVIEW_MESSAGE.approve : "");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("write");
  const requestId = useRef(0);

  const auth = { token, redirectOnUnauthorized: true };

  const notify = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const load = useCallback(
    async (offset = 0) => {
      const id = ++requestId.current;
      const params = new URLSearchParams({ status, limit: String(PAGE_SIZE), offset: String(offset) });
      if (search.trim()) params.set("q", search.trim());
      if (categoryFilter) params.set("category_id", categoryFilter);
      try {
        const page = await apiRequest<MuroAdminPage>(`/admin/muro/posts?${params.toString()}`, {}, { token, redirectOnUnauthorized: true });
        if (id !== requestId.current) return;
        setItems((current) => (offset ? [...current, ...page.items] : page.items));
        setTotal(page.total);
        setCounts(page.counts);
      } catch (error) {
        if (id !== requestId.current) return;
        setMessage(errorText(error, "No se pudo cargar la lista"));
        setIsError(true);
      }
    },
    [status, search, categoryFilter, token],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    apiRequest<MuroCategory[]>("/muro/categories")
      .then(setCategories)
      .catch(() => {
        setMessage("No se pudieron cargar las etiquetas");
        setIsError(true);
      });
  }, []);

  const select = (post: MuroPostAdmin) => {
    setCreating(false);
    setSelected(post);
    setDraft(toDraft(post));
    setNotes(post.reviewer_notes ?? "");
    notify("");
  };

  const close = () => {
    setCreating(false);
    setSelected(null);
  };

  const startCreate = () => {
    setSelected(null);
    setCreating(true);
    setDraft({ title: "", author_name: "Equipo WFF Perú", author_photo: "", body: "", category_id: categories[0]?.id ?? 0 });
    setPublishNow(true);
    setNewPhotos([]);
    notify("");
  };

  /** Ejecuta una acción mostrando el estado ocupado y el error, si lo hay. */
  const run = async (action: () => Promise<void>, fallback: string) => {
    setBusy(true);
    notify("");
    try {
      await action();
    } catch (error) {
      notify(errorText(error, fallback), true);
    } finally {
      setBusy(false);
    }
  };

  const putDraft = (id: number) =>
    apiRequest<MuroPostAdmin>(
      `/admin/muro/posts/${id}`,
      { method: "PUT", body: JSON.stringify({ ...draft, category_id: draft.category_id || undefined }) },
      auth,
    );

  const uploadPhotos = async (id: number, files: File[]) => {
    const body = new FormData();
    for (const file of files) body.append("images", await optimizeEditorialImageFile(file));
    return apiRequest<MuroPostAdmin>(`/admin/muro/posts/${id}/images`, { method: "POST", body }, auth);
  };

  const createPost = () =>
    run(async () => {
      let created = await apiRequest<MuroPostAdmin>(
        "/admin/muro/posts",
        { method: "POST", body: JSON.stringify({ ...draft, category_id: draft.category_id || categories[0]?.id, publish: publishNow }) },
        auth,
      );
      let photoError = "";
      if (newPhotos.length) {
        try {
          created = await uploadPhotos(created.id, newPhotos);
        } catch (error) {
          // La reflexión ya existe: se abre igual para reintentar las fotos sin duplicarla.
          photoError = errorText(error, "error desconocido");
        }
      }
      setNewPhotos([]);
      // Un borrador no pertenece a "Publicados": se cierra para no confundir.
      if (created.status === "approved" || !isPublished) select(created);
      else close();
      const done = created.status === "approved" ? "Creada y publicada en el Muro." : "Borrador guardado en Postulados → Pendientes.";
      notify(photoError ? `${done} Las fotos no se subieron: ${photoError}` : done, Boolean(photoError));
      await load();
    }, "No se pudo crear la reflexión");

  const saveEdits = () =>
    run(async () => {
      if (!selected) return;
      select(await putDraft(selected.id));
      notify("Cambios guardados.");
      await load();
    }, "No se pudieron guardar los cambios");

  const review = (action: ReviewAction) => {
    if (!selected) return;
    if ((action === "observe" || action === "reject") && notes.trim().length < 5) {
      notify("Escribe un comentario de revisión para el autor (mínimo 5 caracteres).", true);
      return;
    }
    if (action === "reject" && !window.confirm("¿Rechazar esta postulación?")) return;
    if (action === "withdraw" && !window.confirm("¿Retirar esta reflexión del Muro público?")) return;
    void run(async () => {
      // Al publicar se guardan primero las correcciones hechas en el formulario.
      if (action === "approve") await putDraft(selected.id);
      const updated = await apiRequest<MuroPostAdmin>(
        `/admin/muro/posts/${selected.id}/review`,
        { method: "POST", body: JSON.stringify({ action, notes: notes.trim() || null, send_email: sendEmail }) },
        auth,
      );
      if (action === "approve" && onPublished) {
        onPublished(updated);
        return;
      }
      close();
      notify(REVIEW_MESSAGE[action]);
      await load();
    }, "No se pudo completar la acción");
  };

  const addPhotos = (files: File[]) =>
    run(async () => {
      if (!selected) return;
      setSelected(await uploadPhotos(selected.id, files));
      notify(files.length === 1 ? "Foto agregada." : `${files.length} fotos agregadas.`);
      await load();
    }, "No se pudieron subir las fotos");

  const photoAction = (path: string, method: "DELETE" | "PUT", done: string) =>
    run(async () => {
      if (!selected) return;
      setSelected(await apiRequest<MuroPostAdmin>(`/admin/muro/posts/${selected.id}/images/${path}`, { method }, auth));
      notify(done);
      await load();
    }, "No se pudo completar la acción");

  const remove = () => {
    if (!selected || !window.confirm("¿Eliminar definitivamente esta reflexión y sus fotos?")) return;
    void run(async () => {
      await apiRequest(`/admin/muro/posts/${selected.id}`, { method: "DELETE" }, auth);
      close();
      notify("Reflexión eliminada.");
      await load();
    }, "No se pudo eliminar");
  };

  const currentStatus = selected?.status;
  const statusMessage = message && (
    <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>
  );

  const fields = (
    <>
      <div className={styles.twoColumns}>
        <div className={styles.field}>
          <label htmlFor="muro-title">Título</label>
          <input id="muro-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={160} placeholder="Mínimo 5 caracteres" />
        </div>
        <div className={styles.field}>
          <label htmlFor="muro-author">Autor/a</label>
          <input id="muro-author" value={draft.author_name} onChange={(e) => setDraft({ ...draft, author_name: e.target.value })} maxLength={120} />
        </div>
      </div>
      <ImageField
        label="Foto del autor"
        value={draft.author_photo}
        token={token}
        aspects={AUTHOR_ASPECTS}
        maxOutputWidth={640}
        onChange={(author_photo) => setDraft((current) => ({ ...current, author_photo }))}
      />
      <div className={styles.field}>
        <label htmlFor="muro-tag">Etiqueta</label>
        <select id="muro-tag" value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: Number(e.target.value) })}>
          {!draft.category_id && <option value={0}>Sin etiqueta</option>}
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className={editorStyles.field}>
        <div className={editorStyles.head}>
          <strong>Contenido</strong>
          <ModeSwitch mode={editorMode} onChange={setEditorMode} withHtml />
        </div>
        {editorMode === "write" && (
          <RichTextEditor basic value={cleanMuroHtml(draft.body)} onChange={(body) => setDraft((current) => ({ ...current, body }))} placeholder="Mínimo 20 caracteres" />
        )}
        {editorMode === "html" && (
          <>
            <textarea
              className={editorStyles.code}
              aria-label="Contenido en HTML"
              value={draft.body}
              spellCheck={false}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="<p>Escribe o pega aquí el HTML…</p>"
            />
            <small>Etiquetas admitidas: p, br, div, strong, b, em, i y span con data-size (small, normal, large, xlarge). Lo demás se elimina al guardar.</small>
          </>
        )}
        {editorMode === "preview" && (
          <MuroPreview
            draft={draft}
            category={categories.find((c) => c.id === draft.category_id)}
            authorPhoto={draft.author_photo ? mediaUrl(draft.author_photo) : ""}
            images={creating ? [] : selected?.images ?? []}
            publishedAt={creating ? null : selected?.published_at ?? null}
          />
        )}
        <small>{visibleLength(cleanMuroHtml(draft.body))} caracteres</small>
      </div>
    </>
  );

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>{isPublished ? "Publicados" : "Postulados"}</h2>
          <p>{isPublished ? "Reflexiones visibles en el Muro." : "Enviadas por la comunidad y borradores."}{total === null ? "" : ` · ${total}`}</p>
          {isPublished && <button className={styles.newButton} disabled={busy} onClick={startCreate}>+ Nueva publicación</button>}
        </div>
        <input className={styles.search} placeholder="Buscar por título, autor o contenido…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.field} style={{ padding: "0 16px 10px" }}>
          <select aria-label="Filtrar por etiqueta" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Todas las etiquetas</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {!isPublished && (
          <div className={styles.submissionFilters}>
            {SUBMISSION_FILTERS.map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? styles.filterActive : ""}
                disabled={busy}
                onClick={() => { setFilter(value); setItems([]); setTotal(null); close(); notify(""); }}
              >
                {label} ({counts[value] ?? 0})
              </button>
            ))}
          </div>
        )}
        <div className={styles.itemList}>
          {items.map((post) => (
            <button key={post.id} disabled={busy} className={`${styles.listItem} ${selected?.id === post.id ? styles.listItemActive : ""}`} onClick={() => select(post)}>
              <strong>{post.title}</strong>
              <span>{post.author_name}{post.category ? ` · ${post.category.name}` : ""}</span>
              <small>{isPublished ? `Publicada ${formatDate(post.published_at)}` : `Enviada ${formatDate(post.submitted_at)}`}</small>
            </button>
          ))}
          {total === 0 && <div className={styles.empty}>{isPublished ? "No hay publicaciones." : "No hay postulaciones en este filtro."}</div>}
          {total !== null && items.length < total && (
            <button className={styles.secondaryButton} disabled={busy} onClick={() => void load(items.length)}>Cargar más</button>
          )}
        </div>
      </aside>

      <section className={styles.editor}>
        {creating ? (
          <>
            <div className={styles.editorHeader}>
              <div>
                <h2>Nueva publicación</h2>
                <p>La creas tú, sin pasar por el formulario público.</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.secondaryButton} disabled={busy} onClick={close}>Cancelar</button>
                <button className={styles.primaryButton} disabled={busy || !categories.length || !isValidDraft(draft)} onClick={() => void createPost()}>
                  {busy ? "Creando…" : publishNow ? "Crear y publicar" : "Guardar borrador"}
                </button>
              </div>
            </div>
            <div className={styles.formGrid}>
              {statusMessage}
              {!categories.length && <div className={styles.status}>Primero crea al menos una etiqueta en la pestaña Etiquetas.</div>}
              {fields}
              <div className={styles.field}>
                <label>Fotos ({newPhotos.length} / {MAX_PHOTOS})</label>
                <small>{newPhotos.length ? newPhotos.map((file) => file.name).join(", ") : "Opcional. La primera foto es la portada."}</small>
                <PhotoAdder
                  label={newPhotos.length ? "Agregar más fotos" : "Elegir fotos"}
                  disabled={busy || newPhotos.length >= MAX_PHOTOS}
                  onFiles={(files) => setNewPhotos((current) => [...current, ...files].slice(0, MAX_PHOTOS))}
                />
                {newPhotos.length > 0 && <button type="button" className={styles.secondaryButton} disabled={busy} onClick={() => setNewPhotos([])}>Quitar fotos elegidas</button>}
              </div>
              <label className={styles.checkboxField} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
                Publicar de inmediato (si no, queda como borrador en Postulados)
              </label>
            </div>
          </>
        ) : !selected ? (
          <div className={styles.emptyEditor}>
            {statusMessage}
            <strong>{isPublished ? "Selecciona una publicación" : "Selecciona una postulación"}</strong>
            <p>{isPublished ? "Podrás editarla, cambiar sus fotos o retirarla del Muro." : "Podrás corregirla, observarla, rechazarla o publicarla."}</p>
          </div>
        ) : (
          <>
            <div className={styles.editorHeader}>
              <div>
                <h2>{isPublished ? "Editar publicación" : "Revisar postulación"}</h2>
                <p>{STATUS_LABEL[selected.status]} · enviada {formatDate(selected.submitted_at)}{selected.author_email !== TEAM_EMAIL && ` · ${selected.author_email}`}</p>
                {selected.status === "approved" && <p><a href={`/muro/${selected.slug}`} target="_blank" rel="noopener noreferrer">Ver en el Muro ↗</a></p>}
              </div>
              <div className={styles.actions}>
                {currentUsername === "WFFAdmin" && <button className={styles.dangerButton} disabled={busy} onClick={remove}>Eliminar</button>}
                {currentStatus === "approved" && <button className={styles.secondaryButton} disabled={busy} onClick={() => review("withdraw")}>Retirar del Muro</button>}
                <button className={isPublished ? styles.primaryButton : styles.secondaryButton} disabled={busy || !isValidDraft(draft)} onClick={() => void saveEdits()}>Guardar cambios</button>
                {currentStatus !== "approved" && <button className={styles.primaryButton} disabled={busy || !isValidDraft(draft)} onClick={() => review("approve")}>{busy ? "Procesando…" : "Aprobar y publicar"}</button>}
              </div>
            </div>
            <div className={styles.formGrid}>
              {statusMessage}
              {fields}
              <div className={styles.field}>
                <label>Fotos ({selected.images.length} / {MAX_PHOTOS})</label>
                <small>La primera foto es la portada de la tarjeta en el Muro. Los cambios en fotos se guardan al instante.</small>
                <div className={styles.galleryGrid}>
                  {selected.images.map((image, index) => (
                    <div key={image.id} className={styles.galleryItem}>
                      <a href={mediaUrl(image.url)} target="_blank" rel="noopener noreferrer" aria-label="Abrir foto">
                        <img src={mediaUrl(image.url)} alt="" loading="lazy" />
                      </a>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => window.confirm("¿Quitar esta foto?") && void photoAction(String(image.id), "DELETE", "Foto quitada.")}
                        aria-label="Quitar foto"
                      >×</button>
                      <div className={styles.galleryMove}>
                        {index === 0 ? (
                          <button type="button" disabled>Portada</button>
                        ) : (
                          <button type="button" disabled={busy} onClick={() => void photoAction(`${image.id}/cover`, "PUT", "Portada actualizada.")}>Hacer portada</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <PhotoAdder
                  label={busy ? "Procesando…" : "Agregar fotos"}
                  disabled={busy || selected.images.length >= MAX_PHOTOS}
                  onFiles={(files) => void addPhotos(files)}
                />
              </div>
              {!isPublished && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="muro-notes">Comentario de revisión (se envía al autor al observar o rechazar)</label>
                    <textarea id="muro-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
                  </div>
                  <label className={styles.checkboxField} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                    Notificar al autor por correo (si el servidor tiene SMTP configurado)
                  </label>
                  <div className={styles.actions} style={{ justifyContent: "flex-start" }}>
                    {currentStatus === "pending" && <button className={styles.secondaryButton} disabled={busy} onClick={() => review("observe")}>Observar</button>}
                    {(currentStatus === "pending" || currentStatus === "observed") && <button className={styles.dangerButton} disabled={busy} onClick={() => review("reject")}>Rechazar</button>}
                    {currentStatus !== "pending" && currentStatus !== "approved" && <button className={styles.secondaryButton} disabled={busy} onClick={() => review("reopen")}>Devolver a pendientes</button>}
                  </div>
                </>
              )}
              {selected.reviewed_at && <small>Última revisión: {formatDate(selected.reviewed_at)}</small>}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/** Cómo se verá la reflexión en su página pública. */
function MuroPreview({
  draft,
  category,
  authorPhoto,
  images,
  publishedAt,
}: {
  draft: Draft;
  category: MuroCategory | undefined;
  authorPhoto: string;
  images: MuroPostAdmin["images"];
  publishedAt: string | null;
}) {
  const body = cleanMuroHtml(draft.body);
  return (
    <div className={muroStyles.page} style={{ minHeight: 0, padding: "20px 0", border: "1px solid #dcd2c7", borderRadius: 14, background: "#fff" }}>
      <article className={muroStyles.article} style={{ paddingTop: 0 }}>
        {category && <span className={muroStyles.tag} style={{ background: category.color }}>{category.name}</span>}
        <h1>{draft.title || "Sin título"}</h1>
        <div className={muroStyles.authorRow}>
          {authorPhoto && <img className={muroStyles.authorPhoto} src={authorPhoto} alt="" />}
          <p className={muroStyles.articleMeta}>
            Por {draft.author_name}
            {publishedAt && ` · ${new Date(publishedAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
        </div>
        {images.length > 0 && (
          <div className={`${muroStyles.gallery} ${images.length === 1 ? muroStyles.gallerySingle : ""}`}>
            {images.map((image) => <img key={image.id} src={mediaUrl(image.url)} alt="" loading="lazy" />)}
          </div>
        )}
        {isHtml(body) ? (
          <div className={`${muroStyles.body} ${muroStyles.richBody}`} dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <div className={muroStyles.body}>{body}</div>
        )}
      </article>
    </div>
  );
}

function PhotoAdder({ label, disabled, onFiles }: { label: string; disabled: boolean; onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button type="button" className={styles.uploadButton} disabled={disabled} onClick={() => inputRef.current?.click()}>
        {label}
      </button>
      <input
        ref={inputRef}
        className={styles.hiddenInput}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

function MuroTagsManager({ token }: { token: string }) {
  const [tags, setTags] = useState<MuroCategory[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E75733");
  const [position, setPosition] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const auth = { token, redirectOnUnauthorized: true };
  const validColor = /^#[0-9A-Fa-f]{6}$/.test(color);

  const load = useCallback(async () => {
    const data = await apiRequest<MuroCategory[]>("/muro/categories");
    setTags(data);
    return data;
  }, []);

  const nextPosition = (data: MuroCategory[]) => Math.min(1000, data.reduce((max, tag) => Math.max(max, (tag.position ?? 0) + 1), 0));

  const reset = (data: MuroCategory[] = tags) => {
    setEditingId(null);
    setName("");
    setColor("#E75733");
    setPosition(nextPosition(data));
  };

  useEffect(() => {
    load()
      .then((data) => setPosition(nextPosition(data)))
      .catch((error: unknown) => {
        setMessage(errorText(error, "No se pudieron cargar las etiquetas"));
        setIsError(true);
      });
  }, [load]);

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      reset(await load());
      setMessage(done);
      setIsError(false);
    } catch (error) {
      setMessage(errorText(error, "No se pudo completar la acción"));
      setIsError(true);
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(
      () => apiRequest(
        editingId ? `/admin/muro/categories/${editingId}` : "/admin/muro/categories",
        { method: editingId ? "PUT" : "POST", body: JSON.stringify({ name: name.trim(), color: color.toUpperCase(), position }) },
        auth,
      ),
      editingId ? "Etiqueta actualizada." : "Etiqueta creada.",
    );

  const edit = (tag: MuroCategory) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color);
    setPosition(tag.position ?? 0);
    setMessage("");
  };

  const remove = (tag: MuroCategory) => {
    if (!window.confirm(`¿Eliminar la etiqueta «${tag.name}»?`)) return;
    void run(() => apiRequest(`/admin/muro/categories/${tag.id}`, { method: "DELETE" }, auth), "Etiqueta eliminada.");
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Etiquetas</h2>
          <p>Administra nombre, color y orden de las etiquetas del Muro.</p>
        </div>
        <div className={styles.itemList}>
          {tags.map((tag) => (
            <div key={tag.id} className={styles.listItem} style={{ alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <strong>{tag.name}</strong>
                <span style={{ background: tag.color, color: getContrastTextColor(tag.color), borderRadius: 999, padding: "7px 12px", fontWeight: 700, fontSize: 12 }}>{tag.name}</span>
              </div>
              <small>{tag.color} · orden {tag.position ?? 0}</small>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className={styles.secondaryButton} type="button" disabled={busy} onClick={() => edit(tag)}>Editar</button>
                <button className={styles.dangerButton} type="button" disabled={busy} onClick={() => remove(tag)}>Eliminar</button>
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
            <p>Se muestran en las tarjetas y en el filtro público del Muro.</p>
          </div>
          <div className={styles.actions}>
            {editingId && <button className={styles.secondaryButton} type="button" disabled={busy} onClick={() => reset()}>Cancelar</button>}
            <button className={styles.primaryButton} type="button" disabled={busy || name.trim().length < 2 || !validColor} onClick={() => void submit()}>
              {editingId ? "Guardar cambios" : "Crear etiqueta"}
            </button>
          </div>
        </div>
        <div className={styles.formGrid}>
          {message && <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>}
          <div className={styles.field}>
            <label htmlFor="muro-tag-name">Nombre</label>
            <input id="muro-tag-name" value={name} maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="Ej. Juventud y liderazgo" />
          </div>
          <div className={styles.field}>
            <label htmlFor="muro-tag-color">Color</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input type="color" aria-label="Selector de color" value={validColor ? color : "#E75733"} onChange={(event) => setColor(event.target.value)} style={{ width: 64, height: 44, padding: 4 }} />
              <input id="muro-tag-color" value={color} onChange={(event) => setColor(event.target.value)} placeholder="#E75733" maxLength={7} style={{ maxWidth: 180 }} />
              {validColor && <span style={{ background: color, color: getContrastTextColor(color), borderRadius: 999, padding: "10px 16px", fontWeight: 700 }}>{name.trim() || "Vista previa"}</span>}
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="muro-tag-position">Orden en el filtro (menor aparece primero)</label>
            <input id="muro-tag-position" type="number" min={0} max={1000} value={position} onChange={(event) => setPosition(Math.max(0, Math.min(1000, Math.trunc(Number(event.target.value) || 0))))} style={{ maxWidth: 180 }} />
          </div>
        </div>
      </section>
    </div>
  );
}
