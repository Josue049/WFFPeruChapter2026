import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuditLog } from "../../types";
import { apiRequest } from "../../services/api";
import styles from "./AdminForms.module.css";

const entityLabels: Record<string, string> = {
  article: "Voces",
  article_submission: "Postulación",
  milestone: "Hitos",
  volunteer_story: "Voluntarios",
  volunteer_highlight: "Portada voluntarios",
  admin_user: "Usuarios",
};

export function AuditLogsManager({ token }: { token: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [username, setUsername] = useState("");
  const [entity, setEntity] = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "300" });
    if (username.trim()) params.set("username", username.trim());
    if (entity) params.set("entity_type", entity);
    try {
      setLogs(await apiRequest<AuditLog[]>(`/audit-logs?${params.toString()}`, {}, { token, redirectOnUnauthorized: true }));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los registros.");
    }
  }, [token, username, entity]);

  useEffect(() => { void load(); }, [load]);

  const entities = useMemo(() => Array.from(new Set(logs.map((log) => log.entity_type))).sort(), [logs]);

  return (
    <div className={styles.auditShell}>
      <section className={styles.settingCard}>
        <div className={styles.auditHeader}><div><h3>Actividad administrativa</h3><p>Registro de cambios realizados por las cuentas del centro de contenidos.</p></div><button className={styles.secondaryButton} onClick={() => void load()}>Actualizar</button></div>
        <div className={styles.auditFilters}>
          <div className={styles.field}><label>Usuario</label><input placeholder="Ej. editorComunicaciones" value={username} onChange={(event) => setUsername(event.target.value)} /></div>
          <div className={styles.field}><label>Módulo</label><select value={entity} onChange={(event) => setEntity(event.target.value)}><option value="">Todos</option>{entities.map((value) => <option key={value} value={value}>{entityLabels[value] ?? value}</option>)}</select></div>
        </div>
      </section>

      {error && <div className={`${styles.status} ${styles.statusError}`}>{error}</div>}
      <section className={styles.auditTableCard}>
        <div className={styles.auditTableWrap}>
          <table className={styles.auditTable}>
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Descripción</th><th></th></tr></thead>
            <tbody>
              {logs.map((log) => <tr key={log.id}><td>{formatDate(log.created_at)}</td><td><strong>@{log.username}</strong></td><td><span className={styles.actionBadge}>{actionLabel(log.action)}</span></td><td>{entityLabels[log.entity_type] ?? log.entity_type}</td><td>{log.description}</td><td><button className={styles.logDetailButton} onClick={() => setSelected(log)}>Ver cambio</button></td></tr>)}
            </tbody>
          </table>
          {!logs.length && <div className={styles.empty}>No hay movimientos para mostrar.</div>}
        </div>
      </section>

      {selected && <div className={styles.logModalBackdrop} onClick={() => setSelected(null)}><section className={styles.logModal} onClick={(event) => event.stopPropagation()}><div className={styles.auditHeader}><div><h3>{selected.description}</h3><p>{formatDate(selected.created_at)} · @{selected.username}</p></div><button className={styles.secondaryButton} onClick={() => setSelected(null)}>Cerrar</button></div><div className={styles.diffGrid}><JsonPanel title="Antes" data={selected.before_data} /><JsonPanel title="Después" data={selected.after_data} /></div></section></div>}
    </div>
  );
}

function JsonPanel({ title, data }: { title: string; data: AuditLog["before_data"] }) {
  return <div className={styles.jsonPanel}><strong>{title}</strong>{data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Sin datos.</p>}</div>;
}
function actionLabel(value: string) { return ({ CREATE: "Creó", UPDATE: "Editó", DELETE: "Eliminó", REVIEW: "Revisó", PUBLISH: "Publicó" } as Record<string, string>)[value] ?? value; }
function formatDate(value: string) { return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value)); }
