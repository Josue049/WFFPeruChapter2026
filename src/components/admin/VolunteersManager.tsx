import { useCallback, useEffect, useMemo, useState } from "react";
import type { VolunteerHighlight, VolunteerStory } from "../../types";
import { apiRequest } from "../../services/api";
import { GalleryField, ImageField } from "./ImageField";
import styles from "./AdminForms.module.css";

type StoryForm = Omit<VolunteerStory, "id" | "created_at" | "updated_at">;

const emptyStory = (): StoryForm => ({
  name: "", slug: "", headline: "", introduction: "", story: "", achievement: "", impact: "",
  quote: "", role: "", project: "", city: "", portrait_image: "", gallery: [],
  linkedin_url: "", instagram_url: "", website_url: "", published: true,
});

const emptyHighlight: VolunteerHighlight = { mode: "random", story_id: null, starts_at: null, ends_at: null, updated_at: null };

export function VolunteersManager({ token }: { token: string }) {
  const [items, setItems] = useState<VolunteerStory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyStory());
  const [highlight, setHighlight] = useState<VolunteerHighlight>(emptyHighlight);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [stories, setting] = await Promise.all([
      apiRequest<VolunteerStory[]>("/volunteer-stories", {}, { token, redirectOnUnauthorized: true }),
      apiRequest<VolunteerHighlight>("/volunteer-highlight", {}, { token, redirectOnUnauthorized: true }),
    ]);
    setItems(stories); setHighlight(setting);
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => items.filter((item) => `${item.name} ${item.headline} ${item.project ?? ""}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const select = (item: VolunteerStory) => {
    setSelectedId(item.id);
    setForm({
      name: item.name, slug: item.slug, headline: item.headline, introduction: item.introduction,
      story: item.story, achievement: item.achievement, impact: item.impact, quote: item.quote ?? "",
      role: item.role ?? "", project: item.project ?? "", city: item.city ?? "", portrait_image: item.portrait_image,
      gallery: item.gallery ?? [], linkedin_url: item.linkedin_url ?? "", instagram_url: item.instagram_url ?? "",
      website_url: item.website_url ?? "", published: item.published,
    });
    setMessage("");
  };

  const save = async () => {
    try {
      const payload = { ...form, slug: form.slug || null, quote: form.quote || null, role: form.role || null, project: form.project || null, city: form.city || null, linkedin_url: form.linkedin_url || null, instagram_url: form.instagram_url || null, website_url: form.website_url || null };
      const result = await apiRequest<VolunteerStory>(selectedId ? `/volunteer-stories/${selectedId}` : "/volunteer-stories", { method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload) }, { token, redirectOnUnauthorized: true });
      select(result); await load(); setMessage("Historia guardada correctamente.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar"); }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar esta historia?")) return;
    await apiRequest(`/volunteer-stories/${selectedId}`, { method: "DELETE" }, { token, redirectOnUnauthorized: true });
    setSelectedId(null); setForm(emptyStory()); await load();
  };

  const saveHighlight = async () => {
    try {
      const payload = highlight.mode === "random" ? { mode: "random" } : {
        mode: "scheduled", story_id: highlight.story_id,
        starts_at: toIso(highlight.starts_at), ends_at: toIso(highlight.ends_at),
      };
      const updated = await apiRequest<VolunteerHighlight>("/volunteer-highlight", { method: "PUT", body: JSON.stringify(payload) }, { token, redirectOnUnauthorized: true });
      setHighlight(updated); setMessage("Configuración de portada actualizada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo programar"); }
  };

  return (
    <div>
      <section className={styles.settingCard}>
        <h3>Historia principal</h3>
        <p>En modo aleatorio cambia en cada recarga. Una programación activa tiene prioridad durante el intervalo seleccionado.</p>
        <div className={styles.modeCards}>
          <label className={`${styles.modeCard} ${highlight.mode === "random" ? styles.modeCardActive : ""}`}>
            <input type="radio" checked={highlight.mode === "random"} onChange={() => setHighlight({ ...highlight, mode: "random", story_id: null, starts_at: null, ends_at: null })} />
            <strong>Aleatorio</strong><span>Escoge una historia publicada en cada recarga.</span>
          </label>
          <label className={`${styles.modeCard} ${highlight.mode === "scheduled" ? styles.modeCardActive : ""}`}>
            <input type="radio" checked={highlight.mode === "scheduled"} onChange={() => setHighlight({ ...highlight, mode: "scheduled" })} />
            <strong>Programado</strong><span>Fija una persona para una ocasión especial.</span>
          </label>
        </div>
        {highlight.mode === "scheduled" && (
          <div className={`${styles.threeColumns}`} style={{ marginTop: 16 }}>
            <div className={styles.field}><label>Historia publicada</label><select value={highlight.story_id ?? ""} onChange={(e) => setHighlight({ ...highlight, story_id: Number(e.target.value) || null })}><option value="">Seleccionar…</option>{items.filter((item) => item.published).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></div>
            <Field label="Desde" type="datetime-local" value={toLocalInput(highlight.starts_at)} onChange={(value) => setHighlight({ ...highlight, starts_at: value })} />
            <Field label="Hasta" type="datetime-local" value={toLocalInput(highlight.ends_at)} onChange={(value) => setHighlight({ ...highlight, ends_at: value })} />
          </div>
        )}
        <div className={styles.actions} style={{ marginTop: 16 }}><button className={styles.primaryButton} onClick={saveHighlight}>Guardar portada</button></div>
      </section>

      <div className={styles.manager}>
        <aside className={styles.listPanel}>
          <div className={styles.listHeader}><h2>Voluntarios</h2><p>Perfiles editoriales de logros e impacto.</p><button className={styles.newButton} onClick={() => { setSelectedId(null); setForm(emptyStory()); }}>+ Nueva historia</button></div>
          <input className={styles.search} placeholder="Buscar persona o proyecto…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={styles.itemList}>{filtered.map((item) => <button key={item.id} className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`} onClick={() => select(item)}><strong>{item.name}</strong><span>{item.headline}</span><small>{item.published ? "Publicado" : "Borrador"}</small></button>)}{!filtered.length && <div className={styles.empty}>Todavía no hay historias.</div>}</div>
        </aside>

        <section className={styles.editor}>
          <div className={styles.editorHeader}><div><h2>{selectedId ? "Editar historia" : "Nueva historia"}</h2><p>Construye un perfil con enfoque de revista y resultados concretos.</p></div><div className={styles.actions}>{selectedId && <button className={styles.dangerButton} onClick={remove}>Eliminar</button>}<button className={styles.primaryButton} onClick={save}>Guardar</button></div></div>
          <div className={styles.formGrid}>
            {message && <div className={styles.status}>{message}</div>}
            <ImageField label="Retrato principal" value={form.portrait_image} token={token} onChange={(portrait_image) => setForm({ ...form, portrait_image })} help="Recomendado: retrato vertical 4:5, mínimo 1200 × 1500 px." required />
            <div className={styles.twoColumns}><Field label="Nombre completo" value={form.name} onChange={(name) => setForm({ ...form, name })} /><Field label="Slug opcional" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} /></div>
            <Field label="Titular editorial" value={form.headline} onChange={(headline) => setForm({ ...form, headline })} placeholder="La frase que resume por qué destaca" />
            <TextArea label="Introducción" value={form.introduction} onChange={(introduction) => setForm({ ...form, introduction })} rows={4} />
            <div className={styles.threeColumns}><Field label="Rol" value={form.role ?? ""} onChange={(role) => setForm({ ...form, role })} /><Field label="Proyecto" value={form.project ?? ""} onChange={(project) => setForm({ ...form, project })} /><Field label="Ciudad" value={form.city ?? ""} onChange={(city) => setForm({ ...form, city })} /></div>
            <TextArea label="Historia" value={form.story} onChange={(story) => setForm({ ...form, story })} rows={11} />
            <TextArea label="Logro principal" value={form.achievement} onChange={(achievement) => setForm({ ...form, achievement })} rows={6} />
            <TextArea label="Impacto generado" value={form.impact} onChange={(impact) => setForm({ ...form, impact })} rows={6} />
            <TextArea label="Cita destacada" value={form.quote ?? ""} onChange={(quote) => setForm({ ...form, quote })} rows={3} />
            <GalleryField value={form.gallery} token={token} onChange={(gallery) => setForm({ ...form, gallery })} />
            <div className={styles.threeColumns}><Field label="LinkedIn" type="url" value={form.linkedin_url ?? ""} onChange={(linkedin_url) => setForm({ ...form, linkedin_url })} /><Field label="Instagram" type="url" value={form.instagram_url ?? ""} onChange={(instagram_url) => setForm({ ...form, instagram_url })} /><Field label="Sitio web" type="url" value={form.website_url ?? ""} onChange={(website_url) => setForm({ ...form, website_url })} /></div>
            <div className={styles.checkboxRow}><Check label="Publicado" checked={form.published} onChange={(published) => setForm({ ...form, published })} /></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function toLocalInput(value: string | null): string { if (!value) return ""; const date = new Date(value); const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function toIso(value: string | null): string | null { if (!value) return null; return new Date(value).toISOString(); }
function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <div className={styles.field}><label>{label}</label><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>; }
function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) { return <div className={styles.field}><label>{label}</label><textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></div>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className={styles.checkboxField}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><label>{label}</label></div>; }
