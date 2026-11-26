import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "../../types";
import { apiRequest } from "../../services/api";
import { mediaUrl } from "../../utils/mediaUrl";
import { HeroSlideView } from "../Header/HeroSlideView";
import { ImageField } from "./ImageField";
import { BANNER_ASPECTS } from "./cropAspects";
import styles from "./AdminForms.module.css";
import local from "./BannersManager.module.css";

type SlideForm = Omit<HeroSlide, "id" | "position" | "created_at" | "updated_at">;

const emptyForm = (): SlideForm => ({
  image: "",
  subtitle: "",
  title: "",
  button_text: "",
  link_url: "",
  subtitle_en: "",
  title_en: "",
  button_text_en: "",
  overlay: 50,
  active: true,
});

const toForm = (slide: HeroSlide): SlideForm => ({
  image: slide.image,
  subtitle: slide.subtitle,
  title: slide.title,
  button_text: slide.button_text,
  link_url: slide.link_url,
  subtitle_en: slide.subtitle_en,
  title_en: slide.title_en,
  button_text_en: slide.button_text_en,
  overlay: slide.overlay,
  active: slide.active,
});

// Los dos banners que hoy muestra el sitio, para poder editarlos desde el panel.
const CURRENT_BANNERS: SlideForm[] = [
  {
    image: "/img/comite.webp",
    subtitle: "Capítulo nacional del WFF",
    title: "Comité de coordinación 2026",
    button_text: "Ver info",
    link_url: "https://www.fao.org/peru/noticias/detail-events/en/c/1742822/",
    subtitle_en: "WFF National Chapter",
    title_en: "2026 Coordination Committee",
    button_text_en: "Learn more",
    overlay: 50,
    active: true,
  },
  {
    image: "/img/Inauguracion.webp",
    subtitle: "Jóvenes peruanos por los sistemas agroalimentarios",
    title: "Únete al Capítulo Nacional",
    button_text: "Unirme",
    link_url:
      "https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl",
    subtitle_en: "Peruvian youth for agrifood systems",
    title_en: "Join the National Chapter",
    button_text_en: "Join us",
    overlay: 50,
    active: true,
  },
];

const PREVIEW_WIDTH = 1440;

function ScaledPreview({ form, english }: { form: SlideForm; english: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [naturalRatio, setNaturalRatio] = useState(1155 / 2048);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const update = () => setScale(element.clientWidth / PREVIEW_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!form.image) return;
    const image = new Image();
    image.onload = () => image.naturalWidth && setNaturalRatio(image.naturalHeight / image.naturalWidth);
    image.src = mediaUrl(form.image);
  }, [form.image]);

  const subtitle = (english && form.subtitle_en) || form.subtitle;
  const title = (english && form.title_en) || form.title;
  const buttonText = (english && form.button_text_en) || form.button_text;

  return (
    <div ref={boxRef} className={local.previewBox} style={{ height: PREVIEW_WIDTH * naturalRatio * scale }}>
      <div className={local.previewCanvas} style={{ width: PREVIEW_WIDTH, transform: `scale(${scale})` }}>
        {form.image ? (
          <HeroSlideView
            image={mediaUrl(form.image)}
            subtitle={subtitle}
            title={title}
            buttonText={buttonText}
            link={form.link_url}
            overlay={form.overlay}
            preview
          />
        ) : (
          <div className={local.noImage} style={{ height: PREVIEW_WIDTH * naturalRatio }}>Sube una imagen para ver la vista previa</div>
        )}
      </div>
    </div>
  );
}

export function BannersManager({ token }: { token: string }) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<SlideForm>(emptyForm());
  const [english, setEnglish] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const notify = (text: string, isError = false) => {
    setMessage(text);
    setMessageIsError(isError);
  };

  const request = useCallback(
    <T,>(path: string, init: RequestInit = {}) => apiRequest<T>(path, init, { token, redirectOnUnauthorized: true }),
    [token],
  );

  const load = useCallback(async () => {
    const result = await request<HeroSlide[]>("/admin/hero-slides");
    setSlides(result);
    setLoaded(true);
    return result;
  }, [request]);

  useEffect(() => {
    load().catch((error) => {
      setLoaded(true);
      notify(error instanceof Error ? error.message : "No se pudieron cargar los banners.", true);
    });
  }, [load]);

  const select = (slide: HeroSlide) => {
    setSelectedId(slide.id);
    setCreating(false);
    setForm(toForm(slide));
    notify("");
  };

  const startNew = () => {
    setSelectedId(null);
    setCreating(true);
    setForm(emptyForm());
    notify("");
  };

  const save = async () => {
    if (!form.image.trim()) {
      notify("Sube o indica la imagen del banner.", true);
      return;
    }
    if (form.button_text.trim() && !form.link_url.trim()) {
      notify("Si el botón tiene texto, indica también el enlace.", true);
      return;
    }
    try {
      setBusy(true);
      const saved = await request<HeroSlide>(selectedId ? `/admin/hero-slides/${selectedId}` : "/admin/hero-slides", {
        method: selectedId ? "PUT" : "POST",
        body: JSON.stringify({ ...form, image: form.image.trim(), link_url: form.link_url.trim() }),
      });
      await load();
      setSelectedId(saved.id);
      setCreating(false);
      setForm(toForm(saved));
      notify("Banner guardado. Ya se ve en la pantalla principal.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo guardar.", true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selectedId || !window.confirm("¿Eliminar este banner de la pantalla principal?")) return;
    try {
      setBusy(true);
      await request(`/admin/hero-slides/${selectedId}`, { method: "DELETE" });
      setSelectedId(null);
      setCreating(false);
      setForm(emptyForm());
      await load();
      notify("Banner eliminado. La imagen sigue en la Galería por si deseas quitarla.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo eliminar.", true);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      await request(`/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...toForm(slide), active: !slide.active }),
      });
      const result = await load();
      const updated = result.find((item) => item.id === slide.id);
      if (updated && updated.id === selectedId) setForm(toForm(updated));
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo cambiar el estado.", true);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const ids = slides.map((slide) => slide.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      setSlides(await request<HeroSlide[]>("/admin/hero-slides/reorder", { method: "PUT", body: JSON.stringify({ ids }) }));
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo reordenar.", true);
    }
  };

  const importCurrent = async () => {
    try {
      setBusy(true);
      for (const banner of CURRENT_BANNERS) {
        await request("/admin/hero-slides", { method: "POST", body: JSON.stringify(banner) });
      }
      await load();
      notify("Listo: los banners actuales ahora se pueden editar desde aquí.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudieron importar.", true);
    } finally {
      setBusy(false);
    }
  };

  const editing = creating || selectedId !== null;
  const set = <K extends keyof SlideForm>(key: K, value: SlideForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Banners</h2>
          <p>Se muestran en este orden en la pantalla principal. Solo los activos son visibles.</p>
          <button className={styles.newButton} onClick={startNew}>+ Nuevo banner</button>
        </div>

        <div className={styles.itemList} style={{ paddingTop: 12 }}>
          {slides.map((slide, index) => (
            <div key={slide.id} className={`${local.slideRow} ${selectedId === slide.id ? local.slideRowActive : ""}`}>
              <button type="button" className={local.slideMain} onClick={() => select(slide)}>
                <span className={local.thumb}>
                  <img src={mediaUrl(slide.image)} alt="" loading="lazy" />
                </span>
                <span className={local.slideText}>
                  <strong>{slide.title || "Sin título"}</strong>
                  <small>{slide.active ? "Activo" : "Oculto"}</small>
                </span>
              </button>
              <div className={local.rowActions}>
                <button type="button" onClick={() => void move(index, -1)} disabled={index === 0} aria-label="Subir">↑</button>
                <button type="button" onClick={() => void move(index, 1)} disabled={index === slides.length - 1} aria-label="Bajar">↓</button>
                <button type="button" onClick={() => void toggleActive(slide)} aria-label={slide.active ? "Ocultar" : "Mostrar"} title={slide.active ? "Ocultar" : "Mostrar"}>
                  {slide.active ? "👁" : "🚫"}
                </button>
              </div>
            </div>
          ))}

          {loaded && !slides.length && (
            <div className={styles.empty}>
              <p>
                Todavía no hay banners propios, así que el sitio muestra los dos predeterminados.
              </p>
              <button className={styles.secondaryButton} onClick={() => void importCurrent()} disabled={busy}>
                {busy ? "Cargando…" : "Cargar los banners actuales para editarlos"}
              </button>
            </div>
          )}
        </div>
      </aside>

      <section className={styles.editor}>
        {!editing ? (
          <div className={styles.emptyEditor}>
            <strong>Banner de la pantalla principal</strong>
            <p>Elige un banner de la lista para editarlo o crea uno nuevo con imagen, texto y botón.</p>
            {message && <div className={`${styles.status} ${messageIsError ? styles.statusError : ""}`}>{message}</div>}
          </div>
        ) : (
          <>
            <div className={styles.editorHeader}>
              <div>
                <h2>{selectedId ? "Editar banner" : "Nuevo banner"}</h2>
                <p>Los cambios se ven en la pantalla principal apenas guardas.</p>
              </div>
              <div className={styles.actions}>
                {selectedId && <button className={styles.dangerButton} onClick={() => void remove()} disabled={busy}>Eliminar</button>}
                <button className={styles.primaryButton} onClick={() => void save()} disabled={busy}>
                  {busy ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>

            <div className={styles.formGrid}>
              {message && <div className={`${styles.status} ${messageIsError ? styles.statusError : ""}`}>{message}</div>}

              <div className={local.previewWrap}>
                <div className={local.previewHead}>
                  <strong>Vista previa</strong>
                  <div className={local.langTabs} role="tablist">
                    <button role="tab" aria-selected={!english} className={!english ? local.langActive : ""} onClick={() => setEnglish(false)}>Español</button>
                    <button role="tab" aria-selected={english} className={english ? local.langActive : ""} onClick={() => setEnglish(true)}>English</button>
                  </div>
                </div>
                <ScaledPreview form={form} english={english} />
              </div>

              <ImageField
                label="Imagen del banner"
                value={form.image}
                token={token}
                onChange={(image) => set("image", image)}
                aspects={BANNER_ASPECTS}
                maxOutputWidth={2400}
                help="Se recomienda 16:9 (por ejemplo 2048 × 1152 px). Al subirla podrás recortarla y encuadrarla."
                required
              />

              <div className={styles.twoColumns}>
                <Field label="Texto superior (opcional)" value={form.subtitle} max={200} onChange={(value) => set("subtitle", value)} placeholder="Capítulo nacional del WFF" />
                <Field label="Título (opcional)" value={form.title} max={300} onChange={(value) => set("title", value)} placeholder="Comité de coordinación 2026" />
              </div>

              <div className={styles.twoColumns}>
                <Field label="Texto del botón (opcional)" value={form.button_text} max={60} onChange={(value) => set("button_text", value)} placeholder="Ver info" />
                <Field label="Enlace del botón" value={form.link_url} onChange={(value) => set("link_url", value)} placeholder="https://… o /hitos" />
              </div>

              <details className={local.details}>
                <summary>Versión en inglés (opcional)</summary>
                <p className={styles.field}>
                  <small>Se muestra a quienes ven el sitio en inglés. Si lo dejas vacío, se usa el texto en español.</small>
                </p>
                <div className={styles.twoColumns}>
                  <Field label="Texto superior" value={form.subtitle_en} max={200} onChange={(value) => set("subtitle_en", value)} />
                  <Field label="Título" value={form.title_en} max={300} onChange={(value) => set("title_en", value)} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <Field label="Texto del botón" value={form.button_text_en} max={60} onChange={(value) => set("button_text_en", value)} />
                </div>
              </details>

              <div className={styles.field}>
                <label>Oscurecer imagen: {form.overlay}%</label>
                <input type="range" min={0} max={80} step={5} value={form.overlay} onChange={(event) => set("overlay", Number(event.target.value))} />
                <small>Aumenta el valor si el texto no se lee bien sobre la foto.</small>
              </div>

              <label className={styles.checkboxField}>
                <input type="checkbox" checked={form.active} onChange={(event) => set("active", event.target.checked)} />
                <span>Visible en la pantalla principal</span>
              </label>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  max?: number;
}) {
  return (
    <div className={styles.field}>
      <label>{label}</label>
      <input value={value} placeholder={placeholder} maxLength={max} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
