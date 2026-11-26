import { useCallback, useEffect, useMemo, useState } from "react";
import type { VolunteerHighlight, VolunteerStory } from "../../types";
import { apiRequest } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import { ImageField } from "./ImageField";
import { StoryEditor } from "./StoryEditor";
import { useStoryImages } from "./storyImages";
import { COVER_ASPECTS } from "./cropAspects";
import styles from "./AdminForms.module.css";
import local from "./VolunteersManager.module.css";

type StoryForm = Omit<VolunteerStory, "id" | "edition_number" | "created_at" | "updated_at" | "cover_image" | "cover_only"> & {
  /** null = el servidor asigna el siguiente número. */
  edition_number: number | null;
  cover_image: string;
};
type Tab = "highlight" | "stories";

const emptyStory = (): StoryForm => ({
  name: "",
  slug: "",
  headline: "",
  introduction: "",
  content_html: "",
  quote: "",
  role: "",
  area: "",
  project: "",
  city: "",
  portrait_image: "",
  gallery: [],
  linkedin_url: "",
  instagram_url: "",
  website_url: "",
  published: true,
  edition_number: null,
  cover_image: "",
});

const emptyHighlight: VolunteerHighlight = {
  mode: "random",
  story_id: null,
  starts_at: null,
  ends_at: null,
  updated_at: null,
};

const toForm = (item: VolunteerStory): StoryForm => ({
  name: item.name,
  slug: item.slug,
  headline: item.headline,
  introduction: item.introduction,
  content_html: item.content_html,
  quote: item.quote ?? "",
  role: item.role ?? "",
  area: item.area ?? "",
  project: item.project ?? "",
  city: item.city ?? "",
  portrait_image: item.portrait_image,
  gallery: item.gallery ?? [],
  linkedin_url: item.linkedin_url ?? "",
  instagram_url: item.instagram_url ?? "",
  website_url: item.website_url ?? "",
  published: item.published,
  edition_number: item.edition_number,
  cover_image: item.cover_image ?? "",
});

const nullable = (value: string) => value.trim() || null;
const pad = (value: number) => String(value).padStart(2, "0");

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function VolunteersManager({ token }: { token: string }) {
  const [tab, setTab] = useState<Tab>("stories");
  const [items, setItems] = useState<VolunteerStory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyStory());
  const [highlight, setHighlight] = useState<VolunteerHighlight>(emptyHighlight);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [highlightMessage, setHighlightMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const storyImages = useStoryImages(token);

  const notify = (text: string, isError = false) => {
    setMessage(text);
    setMessageIsError(isError);
  };

  const load = useCallback(async () => {
    const [stories, setting] = await Promise.all([
      apiRequest<VolunteerStory[]>("/volunteer-stories", {}, { token, redirectOnUnauthorized: true }),
      apiRequest<VolunteerHighlight>("/volunteer-highlight", {}, { token, redirectOnUnauthorized: true }),
    ]);
    // Mismo orden que la página pública: la edición más reciente primero.
    setItems([...stories].sort((a, b) => b.edition_number - a.edition_number));
    setHighlight(setting);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    load().catch((error) => {
      if (!cancelled) {
        setMessage(error instanceof Error ? error.message : "No se pudo cargar el módulo.");
        setMessageIsError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const filtered = useMemo(
    () => items.filter((item) => `${item.name} ${item.headline} ${item.project ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const published = useMemo(() => items.filter((item) => item.published), [items]);

  const select = (item: VolunteerStory) => {
    setSelectedId(item.id);
    setForm(toForm(item));
    notify("");
  };

  const createNew = () => {
    setSelectedId(null);
    setForm(emptyStory());
    notify("");
  };

  const save = async () => {
    if (!form.cover_image && !form.portrait_image) {
      notify("Sube la imagen de portada.", true);
      return;
    }
    if (!form.name.trim() || !form.headline.trim() || !form.introduction.trim() || !form.content_html.trim()) {
      notify("Completa nombre, titular, introducción e historia editorial.", true);
      return;
    }

    try {
      setSaving(true);
      notify("");
      const name = form.name.trim();
      const content_html = await storyImages.upload(form.content_html);
      const payload = {
        ...form,
        content_html,
        name,
        slug: nullable(form.slug),
        // La API exige una foto: las ediciones nuevas usan la misma imagen de portada.
        portrait_image: form.portrait_image || form.cover_image,
        cover_image: nullable(form.cover_image),
        quote: nullable(form.quote ?? ""),
        role: nullable(form.role ?? ""),
        area: nullable(form.area ?? ""),
        project: nullable(form.project ?? ""),
        city: nullable(form.city ?? ""),
        linkedin_url: nullable(form.linkedin_url ?? ""),
        instagram_url: nullable(form.instagram_url ?? ""),
        website_url: nullable(form.website_url ?? ""),
      };
      const result = await apiRequest<VolunteerStory>(
        selectedId ? `/volunteer-stories/${selectedId}` : "/volunteer-stories",
        { method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload) },
        { token, redirectOnUnauthorized: true },
      );
      select(result);
      await load();
      notify("Historia guardada correctamente.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo guardar.", true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar definitivamente esta edición?")) return;
    try {
      await apiRequest(`/volunteer-stories/${selectedId}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
      createNew();
      await load();
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo eliminar.", true);
    }
  };

  const saveHighlight = async () => {
    try {
      setHighlightMessage("");
      const body = highlight.mode === "scheduled"
        ? { mode: "scheduled", story_id: highlight.story_id, starts_at: highlight.starts_at, ends_at: highlight.ends_at }
        : { mode: "random", story_id: null, starts_at: null, ends_at: null };
      const result = await apiRequest<VolunteerHighlight>(
        "/volunteer-highlight",
        { method: "PUT", body: JSON.stringify(body) },
        { token, redirectOnUnauthorized: true },
      );
      setHighlight(result);
      setHighlightMessage("Portada destacada guardada.");
    } catch (error) {
      setHighlightMessage(error instanceof Error ? `Error: ${error.message}` : "Error: no se pudo guardar.");
    }
  };

  const nextEdition = items.length ? Math.max(...items.map((item) => item.edition_number)) + 1 : 1;
  return (
    <div>
      <div className={styles.managerTabs} role="tablist">
        <button role="tab" aria-selected={tab === "stories"} className={tab === "stories" ? styles.managerTabActive : ""} onClick={() => setTab("stories")}>
          Ediciones
        </button>
        <button role="tab" aria-selected={tab === "highlight"} className={tab === "highlight" ? styles.managerTabActive : ""} onClick={() => setTab("highlight")}>
          Portada principal
        </button>
      </div>

      {tab === "highlight" && (
        <section className={styles.settingCard}>
          <h3>Portada principal de la página</h3>
          <p>
            Es el bloque superior de /voluntarios-destacados: la edición destacada con su portada.
          </p>

          <div className={styles.modeCards}>
            <button
              type="button"
              className={`${styles.modeCard} ${highlight.mode === "random" ? styles.modeCardActive : ""}`}
              onClick={() => setHighlight({ ...highlight, mode: "random", story_id: null, starts_at: null, ends_at: null })}
            >
              <strong>Aleatorio</strong>
              <span>Escoge una historia publicada en cada recarga.</span>
            </button>
            <button
              type="button"
              className={`${styles.modeCard} ${highlight.mode === "scheduled" ? styles.modeCardActive : ""}`}
              onClick={() => setHighlight({ ...highlight, mode: "scheduled" })}
            >
              <strong>Programado</strong>
              <span>Fija una historia durante una campaña o fecha especial.</span>
            </button>
          </div>

          {highlight.mode === "scheduled" && (
            <div className={styles.threeColumns} style={{ marginTop: 16 }}>
              <div className={styles.field}>
                <label>Historia publicada</label>
                <select
                  value={highlight.story_id ?? ""}
                  onChange={(event) => setHighlight({ ...highlight, story_id: Number(event.target.value) || null })}
                >
                  <option value="">Seleccionar…</option>
                  {published.map((item) => (
                    <option value={item.id} key={item.id}>
                      N.º {pad(item.edition_number)} · {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Desde"
                type="datetime-local"
                value={toLocalInput(highlight.starts_at)}
                onChange={(value) => setHighlight({ ...highlight, starts_at: toIso(value) })}
              />
              <Field
                label="Hasta"
                type="datetime-local"
                value={toLocalInput(highlight.ends_at)}
                onChange={(value) => setHighlight({ ...highlight, ends_at: toIso(value) })}
              />
            </div>
          )}

          <div className={styles.actions} style={{ marginTop: 16, justifyContent: "flex-start" }}>
            <button className={styles.primaryButton} onClick={() => void saveHighlight()}>Guardar</button>
          </div>
          {highlightMessage && (
            <div className={`${styles.status} ${highlightMessage.startsWith("Error") ? styles.statusError : ""}`} style={{ marginTop: 12 }}>
              {highlightMessage}
            </div>
          )}
        </section>
      )}

      {tab === "stories" && (
        <div className={styles.manager}>
          <aside className={styles.listPanel}>
            <div className={styles.listHeader}>
              <h2>Voluntarios</h2>
              <p>En el mismo orden que en la página.</p>
              <button className={styles.newButton} onClick={createNew}>+ Nueva edición</button>
            </div>

            <input
              className={styles.search}
              placeholder="Buscar persona o proyecto…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className={styles.itemList}>
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.listItem} ${local.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`}
                  onClick={() => select(item)}
                >
                  <span className={local.thumb}>
                    {(item.cover_image || item.portrait_image) && <img src={mediaUrl(item.cover_image || item.portrait_image)} alt="" loading="lazy" />}
                  </span>
                  <span className={local.listText}>
                    <strong>N.º {pad(item.edition_number)} · {item.name}</strong>
                    <span>{item.headline}</span>
                    <small>{item.published ? "Publicado" : "Borrador"}</small>
                  </span>
                </button>
              ))}
              {!filtered.length && <div className={styles.empty}>Todavía no hay ediciones.</div>}
            </div>
          </aside>

          <section className={styles.editor}>
            <div className={styles.editorHeader}>
              <div>
                <h2>{selectedId ? `Editar edición N.º ${pad(form.edition_number ?? nextEdition)}` : "Nueva edición"}</h2>
                <p>Completa los datos de la edición.</p>
              </div>
              <div className={styles.actions}>
                {selectedId && <button className={styles.dangerButton} onClick={() => void remove()}>Eliminar</button>}
                <button className={styles.primaryButton} onClick={() => void save()} disabled={saving}>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              {message && <div className={`${styles.status} ${messageIsError ? styles.statusError : ""}`}>{message}</div>}

              <div className={local.fields}>
                <ImageField
                  label="Imagen de portada"
                  value={form.cover_image}
                  token={token}
                  onChange={(cover_image) => setForm((current) => ({ ...current, cover_image }))}
                  help="La portada completa en una sola imagen (4:5). Se muestra tal cual, sin textos encima."
                  required
                  aspects={COVER_ASPECTS}
                  maxOutputWidth={1600}
                />

                <div className={styles.twoColumns}>
                  <Field
                    label="Número de edición (define el orden)"
                    type="number"
                    value={form.edition_number?.toString() ?? ""}
                    onChange={(value) => setForm({ ...form, edition_number: Math.max(0, Math.trunc(Number(value))) || null })}
                    placeholder={`Automático: ${nextEdition}`}
                  />
                  <Field label="Nombre completo" value={form.name} onChange={(name) => setForm({ ...form, name })} />
                </div>

                <div className={styles.twoColumns}>
                  <Field label="Slug opcional" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} placeholder="Se genera automáticamente" />
                </div>

                <Field
                  label="Titular editorial"
                  value={form.headline}
                  max={350}
                  onChange={(headline) => setForm({ ...form, headline })}
                  placeholder="Ej.: Conectando educación, cultura y sostenibilidad para transformar realidades"
                />

                <TextArea
                  label="Bajada o introducción"
                  value={form.introduction}
                  max={900}
                  rows={4}
                  onChange={(introduction) => setForm({ ...form, introduction })}
                />

                <div className={styles.twoColumns}>
                  <Field label="Rol" value={form.role ?? ""} onChange={(role) => setForm({ ...form, role })} />
                  <Field label="Área (se muestra junto a la historia)" value={form.area ?? ""} onChange={(area) => setForm({ ...form, area })} />
                </div>
                <div className={styles.twoColumns}>
                  <Field label="Proyecto o iniciativa" value={form.project ?? ""} onChange={(project) => setForm({ ...form, project })} />
                  <Field label="Ciudad" value={form.city ?? ""} onChange={(city) => setForm({ ...form, city })} />
                </div>
              </div>

              <StoryEditor
                key={selectedId ?? "nueva"}
                label="Historia editorial"
                value={form.content_html}
                onChange={(content_html) => setForm((current) => ({ ...current, content_html }))}
                onRegisterImage={storyImages.register}
                variant="volunteer"
                placeholder="Escribe aquí la historia…"
              />

              <TextArea label="Cita destacada" value={form.quote ?? ""} max={700} rows={3} onChange={(quote) => setForm({ ...form, quote })} />

              <div className={styles.threeColumns}>
                <Field label="LinkedIn" value={form.linkedin_url ?? ""} onChange={(linkedin_url) => setForm({ ...form, linkedin_url })} />
                <Field label="Instagram" value={form.instagram_url ?? ""} onChange={(instagram_url) => setForm({ ...form, instagram_url })} />
                <Field label="Sitio web" value={form.website_url ?? ""} onChange={(website_url) => setForm({ ...form, website_url })} />
              </div>

              <label className={styles.checkboxField}>
                <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
                <span>Publicado</span>
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  max?: number;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={max} onChange={(event) => onChange(event.target.value)} />
      {max && <small className={local.counter}>{value.length} / {max}</small>}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  max?: number;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <textarea rows={rows} value={value} maxLength={max} onChange={(event) => onChange(event.target.value)} />
      {max && <small className={local.counter}>{value.length} / {max}</small>}
    </div>
  );
}
