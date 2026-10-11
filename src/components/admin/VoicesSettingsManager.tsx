import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import styles from "./AdminForms.module.css";

interface VoicesSettings {
  id: number;
  submissions_mode: "manual" | "scheduled";
  submissions_enabled: boolean;
  submissions_starts_at: string | null;
  submissions_ends_at: string | null;
  is_submission_open: boolean;
  updated_at: string | null;
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num: number) => `${num}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toApiDate(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function VoicesSettingsManager({ token }: { token: string }) {
  const [settings, setSettings] = useState<VoicesSettings | null>(null);
  const [mode, setMode] = useState<"manual" | "scheduled">("manual");
  const [enabled, setEnabled] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await apiRequest<VoicesSettings>("/voices/settings");
    setSettings(data);
    setMode(data.submissions_mode);
    setEnabled(Boolean(data.submissions_enabled));
    setStartsAt(toLocalInput(data.submissions_starts_at));
    setEndsAt(toLocalInput(data.submissions_ends_at));
  };

  useEffect(() => {
    void load().catch((error: unknown) => setMessage(error instanceof Error ? error.message : "No se pudo cargar la configuración"));
  }, []);

  const save = async () => {
    try {
      if (mode === "scheduled" && startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
        setMessage("La fecha de cierre debe ser posterior a la fecha de apertura.");
        return;
      }

      const updated = await apiRequest<VoicesSettings>("/voices/settings", {
        method: "PUT",
        body: JSON.stringify({
          submissions_mode: mode,
          submissions_enabled: enabled,
          submissions_starts_at: mode === "scheduled" ? toApiDate(startsAt) : null,
          submissions_ends_at: mode === "scheduled" ? toApiDate(endsAt) : null,
        }),
      }, { token, redirectOnUnauthorized: true });

      setSettings(updated);
      setMessage("Configuración guardada correctamente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la configuración");
    }
  };

  return (
    <section className={styles.editor}>
      <div className={styles.editorHeader}>
        <div>
          <h2>Configuración de convocatoria</h2>
          <p>Controla si el formulario público de Voces está abierto manualmente o por fechas programadas.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.primaryButton} type="button" onClick={() => void save()}>Guardar configuración</button>
        </div>
      </div>
      <div className={styles.formGrid}>
        {message && <div className={styles.status}>{message}</div>}

        <div className={styles.field}>
          <label>Modo</label>
          <select value={mode} onChange={(event) => setMode(event.target.value as "manual" | "scheduled") }>
            <option value="manual">Manual</option>
            <option value="scheduled">Programado por fechas</option>
          </select>
        </div>

        {mode === "manual" ? (
          <div className={styles.field}>
            <label>Apertura manual</label>
            <select value={enabled ? "open" : "closed"} onChange={(event) => setEnabled(event.target.value === "open") }>
              <option value="closed">Convocatoria cerrada</option>
              <option value="open">Convocatoria abierta</option>
            </select>
          </div>
        ) : (
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label>Inicio de postulaciones</label>
              <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Cierre de postulaciones</label>
              <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
          </div>
        )}

        <div className={styles.status}>
          Estado actual: <strong>{settings?.is_submission_open ? "abierta" : "cerrada"}</strong>
          {settings?.updated_at ? ` · actualizada ${new Date(settings.updated_at).toLocaleString("es-PE")}` : ""}
        </div>
      </div>
    </section>
  );
}
