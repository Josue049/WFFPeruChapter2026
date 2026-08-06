import { useCallback, useEffect, useMemo, useState } from "react";
import type { VolunteerHighlight, VolunteerStory } from "../../types";
import { apiRequest } from "../../services/api";
import { GalleryField, TransparentPortraitField } from "./ImageField";
import styles from "./AdminForms.module.css";

type StoryForm = Omit<
  VolunteerStory,
  "id" | "edition_number" | "created_at" | "updated_at"
>;

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
});

const nullable = (value: string) => value.trim() || null;

export function VolunteersManager({ token }: { token: string }) {
  const [items, setItems] = useState<VolunteerStory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editionNumber, setEditionNumber] = useState<number | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyStory());
  const [highlight, setHighlight] = useState<VolunteerHighlight>(emptyHighlight);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [stories, setting] = await Promise.all([
      apiRequest<VolunteerStory[]>(
        "/volunteer-stories",
        {},
        { token, redirectOnUnauthorized: true },
      ),
      apiRequest<VolunteerHighlight>(
        "/volunteer-highlight",
        {},
        { token, redirectOnUnauthorized: true },
      ),
    ]);
    setItems(stories);
    setHighlight(setting);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      apiRequest<VolunteerStory[]>(
        "/volunteer-stories",
        {},
        { token, redirectOnUnauthorized: true },
      ),
      apiRequest<VolunteerHighlight>(
        "/volunteer-highlight",
        {},
        { token, redirectOnUnauthorized: true },
      ),
    ])
      .then(([stories, setting]) => {
        if (!cancelled) {
          setItems(stories);
          setHighlight(setting);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "No se pudo cargar el módulo.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.name} ${item.headline} ${item.project ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [items, search],
  );

  const select = (item: VolunteerStory) => {
    setSelectedId(item.id);
    setEditionNumber(item.edition_number);
    setForm(toForm(item));
    setMessage("");
  };

  const createNew = () => {
    setSelectedId(null);
    setEditionNumber(null);
    setForm(emptyStory());
    setMessage("");
  };

  const save = async () => {
    if (!form.portrait_image.trim()) {
      setMessage("Sube primero el retrato PNG transparente.");
      return;
    }
    if (!form.name.trim() || !form.headline.trim() || !form.introduction.trim() || !form.content_html.trim()) {
      setMessage("Completa nombre, titular, introducción e historia editorial.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const payload = {
        ...form,
        name: form.name.trim(),
        slug: nullable(form.slug),
        headline: form.headline.trim(),
        introduction: form.introduction.trim(),
        content_html: form.content_html,
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
        {
          method: selectedId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
        { token, redirectOnUnauthorized: true },
      );
      select(result);
      await load();
      setMessage("Historia guardada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar esta historia?")) return;
    await apiRequest(
      `/volunteer-stories/${selectedId}`,
      { method: "DELETE" },
      { token, redirectOnUnauthorized: true },
    );
    createNew();
    await load();
  };

  const saveHighlight = async () => {
    try {
      const payload =
        highlight.mode === "random"
          ? { mode: "random" }
          : {
              mode: "scheduled",
              story_id: highlight.story_id,
              starts_at: toIso(highlight.starts_at),
              ends_at: toIso(highlight.ends_at),
            };
      const updated = await apiRequest<VolunteerHighlight>(
        "/volunteer-highlight",
        { method: "PUT", body: JSON.stringify(payload) },
        { token, redirectOnUnauthorized: true },
      );
      setHighlight(updated);
      setMessage("Configuración de portada actualizada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo programar.");
    }
  };

  return (
    <div>
      <section className={styles.settingCard}>
        <h3>Historia principal</h3>
        <p>
          El retrato se mantiene idéntico en portada y cuadrícula. En portada se muestra a color;
          la cubierta editorial aplica blanco y negro únicamente mediante CSS.
        </p>
        <div className={styles.modeCards}>
          <label className={`${styles.modeCard} ${highlight.mode === "random" ? styles.modeCardActive : ""}`}>
            <input
              type="radio"
              checked={highlight.mode === "random"}
              onChange={() =>
                setHighlight({ ...highlight, mode: "random", story_id: null, starts_at: null, ends_at: null })
              }
            />
            <strong>Aleatorio</strong>
            <span>Escoge una historia publicada en cada recarga.</span>
          </label>
          <label className={`${styles.modeCard} ${highlight.mode === "scheduled" ? styles.modeCardActive : ""}`}>
            <input
              type="radio"
              checked={highlight.mode === "scheduled"}
              onChange={() => setHighlight({ ...highlight, mode: "scheduled" })}
            />
            <strong>Programado</strong>
            <span>Fija una historia durante una campaña o fecha especial.</span>
          </label>
        </div>
        {highlight.mode === "scheduled" && (
          <div className={styles.threeColumns} style={{ marginTop: 16 }}>
            <div className={styles.field}>
              <label>Historia publicada</label>
              <select
                value={highlight.story_id ?? ""}
                onChange={(event) =>
                  setHighlight({ ...highlight, story_id: Number(event.target.value) || null })
                }
              >
                <option value="">Seleccionar…</option>
                {items
                  .filter((item) => item.published)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      N.º {String(item.edition_number).padStart(2, "0")} · {item.name}
                    </option>
                  ))}
              </select>
            </div>
            <Field
              label="Desde"
              type="datetime-local"
              value={toLocalInput(highlight.starts_at)}
              onChange={(value) => setHighlight({ ...highlight, starts_at: value })}
            />
            <Field
              label="Hasta"
              type="datetime-local"
              value={toLocalInput(highlight.ends_at)}
              onChange={(value) => setHighlight({ ...highlight, ends_at: value })}
            />
          </div>
        )}
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <button className={styles.primaryButton} onClick={saveHighlight}>Guardar portada</button>
        </div>
      </section>

      <div className={styles.manager}>
        <aside className={styles.listPanel}>
          <div className={styles.listHeader}>
            <h2>Voluntarios</h2>
            <p>Una persona equivale a una edición editorial completa.</p>
            <button className={styles.newButton} onClick={createNew}>+ Nueva historia</button>
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
                className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`}
                onClick={() => select(item)}
              >
                <strong>N.º {String(item.edition_number).padStart(2, "0")} · {item.name}</strong>
                <span>{item.headline}</span>
                <small>{item.published ? "Publicado" : "Borrador"}</small>
              </button>
            ))}
            {!filtered.length && <div className={styles.empty}>Todavía no hay historias.</div>}
          </div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorHeader}>
            <div>
              <h2>{selectedId ? `Editar edición N.º ${String(editionNumber).padStart(2, "0")}` : "Nueva historia"}</h2>
              <p>El contenido narrativo se administra como un solo bloque editorial.</p>
            </div>
            <div className={styles.actions}>
              {selectedId && <button className={styles.dangerButton} onClick={remove}>Eliminar</button>}
              <button className={styles.primaryButton} onClick={save} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>

          <div className={styles.formGrid}>
            {message && <div className={styles.status}>{message}</div>}

            <TransparentPortraitField
              label="Retrato editorial PNG sin fondo"
              value={form.portrait_image}
              token={token}
              onChange={(portrait_image) => setForm({ ...form, portrait_image })}
              help="PNG con transparencia real, mínimo 1200 × 1500 px. El sistema conserva color y transparencia; el blanco y negro se aplica solo en la cubierta."
              required
            />

            <div className={styles.twoColumns}>
              <Field label="Nombre completo" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <Field label="Slug opcional" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
            </div>

            <Field
              label="Titular editorial"
              value={form.headline}
              onChange={(headline) => setForm({ ...form, headline })}
              placeholder="Ej.: Conectando educación, cultura y sostenibilidad para transformar realidades"
            />

            <TextArea
              label="Bajada o introducción"
              value={form.introduction}
              onChange={(introduction) => setForm({ ...form, introduction })}
              rows={4}
            />

            <div className={styles.fourColumns}>
              <Field label="Rol" value={form.role ?? ""} onChange={(role) => setForm({ ...form, role })} />
              <Field label="Área" value={form.area ?? ""} onChange={(area) => setForm({ ...form, area })} />
              <Field label="Proyecto o iniciativa" value={form.project ?? ""} onChange={(project) => setForm({ ...form, project })} />
              <Field label="Ciudad" value={form.city ?? ""} onChange={(city) => setForm({ ...form, city })} />
            </div>

            <TextArea
              label="Historia editorial — bloque único"
              value={form.content_html}
              onChange={(content_html) => setForm({ ...form, content_html })}
              rows={24}
              help="Admite HTML editorial seguro: párrafos, subtítulos, listas, citas y enlaces. Aquí va toda la historia, sin dividirla artificialmente en logro e impacto."
            />

            <TextArea
              label="Cita destacada"
              value={form.quote ?? ""}
              onChange={(quote) => setForm({ ...form, quote })}
              rows={3}
            />

            <GalleryField value={form.gallery} token={token} onChange={(gallery) => setForm({ ...form, gallery })} />

            <div className={styles.threeColumns}>
              <Field label="LinkedIn" value={form.linkedin_url ?? ""} onChange={(linkedin_url) => setForm({ ...form, linkedin_url })} />
              <Field label="Instagram" value={form.instagram_url ?? ""} onChange={(instagram_url) => setForm({ ...form, instagram_url })} />
              <Field label="Sitio web" value={form.website_url ?? ""} onChange={(website_url) => setForm({ ...form, website_url })} />
            </div>

            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => setForm({ ...form, published: event.target.checked })}
              />
              <span>Publicado</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 6,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  help?: string;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
      {help && <small>{help}</small>}
    </div>
  );
}

function toLocalInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function toIso(value: string | null) {
  return value ? new Date(value).toISOString() : null;
}
