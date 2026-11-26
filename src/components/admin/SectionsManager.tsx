import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import { SECTION_INFO, SECTION_KEYS } from "../../config/siteSections";
import type { SectionKey, SiteSections } from "../../config/siteSections";
import styles from "./AdminForms.module.css";
import local from "./SectionsManager.module.css";

export function SectionsManager({ token }: { token: string }) {
  const [sections, setSections] = useState<SiteSections | null>(null);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [christmas, setChristmas] = useState<boolean | null>(null);
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    apiRequest<{ christmas: boolean }>("/site-theme")
      .then((theme) => setChristmas(theme.christmas))
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "No se pudo cargar el modo navidad.");
        setMessageIsError(true);
      });
  }, []);

  const toggleChristmas = async () => {
    if (christmas === null || savingTheme) return;
    setSavingTheme(true);
    notify("");
    try {
      const result = await apiRequest<{ christmas: boolean }>(
        "/admin/site-theme",
        { method: "PUT", body: JSON.stringify({ christmas: !christmas }) },
        { token, redirectOnUnauthorized: true },
      );
      setChristmas(result.christmas);
      notify(`Modo navidad ${result.christmas ? "activado" : "desactivado"}. Recarga el sitio para ver el cambio.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo guardar el cambio.", true);
    } finally {
      setSavingTheme(false);
    }
  };

  const notify = (text: string, isError = false) => {
    setMessage(text);
    setMessageIsError(isError);
  };

  const load = useCallback(async () => {
    setSections(await apiRequest<SiteSections>("/admin/site-sections", {}, { token, redirectOnUnauthorized: true }));
  }, [token]);

  useEffect(() => {
    load().catch((error) => notify(error instanceof Error ? error.message : "No se pudieron cargar las secciones.", true));
  }, [load]);

  const toggle = async (key: SectionKey) => {
    if (!sections || saving) return;
    const next = { ...sections, [key]: !sections[key] };
    setSaving(key);
    notify("");
    try {
      setSections(await apiRequest<SiteSections>(
        "/admin/site-sections",
        { method: "PUT", body: JSON.stringify(next) },
        { token, redirectOnUnauthorized: true },
      ));
      notify(`${SECTION_INFO[key].label} ${next[key] ? "activada" : "desactivada"}. El cambio se ve en el sitio en menos de un minuto.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "No se pudo guardar el cambio.", true);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className={local.shell}>
      <section className={styles.settingCard}>
        <h3>Espacios públicos del sitio</h3>
        <p>
          Al desactivar un espacio desaparece del menú y su dirección deja de abrirse. No se borra nada: el contenido
          sigue en el panel y reaparece al volver a activarlo. Empoderamiento Femenino es un área fija y no se puede ocultar.
        </p>
      </section>

      {message && <div className={`${styles.status} ${messageIsError ? styles.statusError : ""}`}>{message}</div>}

      <ul className={local.list}>
        <li className={`${local.row} ${christmas ? "" : local.rowOff}`}>
          <div className={local.text}>
            <strong>🎄 Modo navidad</strong>
            <span>Decora el encabezado y el menú con focos, ramas, pinos y un gorro navideño.</span>
          </div>
          <span className={`${local.state} ${christmas ? local.stateOn : local.stateOff}`}>
            {christmas === null ? "…" : christmas ? "Activado" : "Desactivado"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={christmas === true}
            aria-label={`${christmas ? "Desactivar" : "Activar"} modo navidad`}
            className={`${local.switch} ${christmas ? local.switchOn : ""}`}
            disabled={christmas === null || savingTheme}
            onClick={() => void toggleChristmas()}
          >
            <span />
          </button>
        </li>
      </ul>

      <ul className={local.list}>
        {SECTION_KEYS.map((key) => {
          const info = SECTION_INFO[key];
          const on = sections ? sections[key] : false;
          return (
            <li key={key} className={`${local.row} ${on ? "" : local.rowOff}`}>
              <div className={local.text}>
                <strong>{info.label}</strong>
                <span>{info.description}</span>
                <small>{info.path}</small>
              </div>
              <span className={`${local.state} ${on ? local.stateOn : local.stateOff}`}>{sections ? (on ? "Activa" : "Desactivada") : "…"}</span>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? "Desactivar" : "Activar"} ${info.label}`}
                className={`${local.switch} ${on ? local.switchOn : ""}`}
                disabled={!sections || saving !== null}
                onClick={() => void toggle(key)}
              >
                <span />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
