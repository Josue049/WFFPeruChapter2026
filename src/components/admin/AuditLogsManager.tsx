import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
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

type DiffSide = "before" | "after";
type Primitive = string | number | boolean | null;

type DiffPiece = {
  text: string;
  changed: boolean;
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
      setLogs(
        await apiRequest<AuditLog[]>(
          `/audit-logs?${params.toString()}`,
          {},
          { token, redirectOnUnauthorized: true },
        ),
      );
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los registros.",
      );
    }
  }, [token, username, entity]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const entities = useMemo(
    () => Array.from(new Set(logs.map((log) => log.entity_type))).sort(),
    [logs],
  );

  return (
    <div className={styles.auditShell}>
      <section className={styles.settingCard}>
        <div className={styles.auditHeader}>
          <div>
            <h3>Actividad administrativa</h3>
            <p>Registro de cambios realizados por las cuentas del centro de contenidos.</p>
          </div>
          <button className={styles.secondaryButton} onClick={() => void load()}>
            Actualizar
          </button>
        </div>

        <div className={styles.auditFilters}>
          <div className={styles.field}>
            <label>Usuario</label>
            <input
              placeholder="Ej. editorComunicaciones"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Módulo</label>
            <select value={entity} onChange={(event) => setEntity(event.target.value)}>
              <option value="">Todos</option>
              {entities.map((value) => (
                <option key={value} value={value}>
                  {entityLabels[value] ?? value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && <div className={`${styles.status} ${styles.statusError}`}>{error}</div>}

      <section className={styles.auditTableCard}>
        <div className={styles.auditTableWrap}>
          <table className={styles.auditTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.created_at)}</td>
                  <td>
                    <strong>@{log.username}</strong>
                  </td>
                  <td>
                    <span className={styles.actionBadge}>{actionLabel(log.action)}</span>
                  </td>
                  <td>{entityLabels[log.entity_type] ?? log.entity_type}</td>
                  <td>{log.description}</td>
                  <td>
                    <button className={styles.logDetailButton} onClick={() => setSelected(log)}>
                      Ver cambio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!logs.length && <div className={styles.empty}>No hay movimientos para mostrar.</div>}
        </div>
      </section>

      {selected && (
        <div className={styles.logModalBackdrop} onClick={() => setSelected(null)}>
          <section className={styles.logModal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.auditHeader}>
              <div>
                <h3>{selected.description}</h3>
                <p>
                  {formatDate(selected.created_at)} · @{selected.username}
                </p>
              </div>
              <button className={styles.secondaryButton} onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>

            <p className={styles.diffHint}>
              Las partes resaltadas en rojo son exactamente los valores que cambiaron.
            </p>

            <div className={styles.diffGrid}>
              <JsonPanel
                title="Antes"
                data={selected.before_data}
                otherData={selected.after_data}
                side="before"
              />
              <JsonPanel
                title="Después"
                data={selected.after_data}
                otherData={selected.before_data}
                side="after"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function JsonPanel({
  title,
  data,
  otherData,
  side,
}: {
  title: string;
  data: AuditLog["before_data"];
  otherData: AuditLog["before_data"];
  side: DiffSide;
}) {
  if (!data) {
    return (
      <div className={styles.jsonPanel}>
        <strong>{title}</strong>
        <p>Sin datos.</p>
      </div>
    );
  }

  const currentObject = isRecord(data) ? data : null;
  const otherObject = isRecord(otherData) ? otherData : null;

  if (!currentObject) {
    const currentText = JSON.stringify(data, null, 2);
    const otherText = otherData ? JSON.stringify(otherData, null, 2) : "";
    return (
      <div className={styles.jsonPanel}>
        <strong>{title}</strong>
        <pre className={styles.diffPre}>
          {renderDiffText(
            side === "before" ? currentText : otherText,
            side === "before" ? otherText : currentText,
            side,
          )}
        </pre>
      </div>
    );
  }

  const keys = Array.from(
    new Set([...Object.keys(currentObject), ...Object.keys(otherObject ?? {})]),
  );

  return (
    <div className={styles.jsonPanel}>
      <strong>{title}</strong>
      <pre className={styles.diffPre}>
        <span>{"{\n"}</span>
        {keys.map((key, index) => {
          const currentHasKey = Object.prototype.hasOwnProperty.call(currentObject, key);
          const otherHasKey = Boolean(
            otherObject && Object.prototype.hasOwnProperty.call(otherObject, key),
          );
          const currentValue = currentObject[key];
          const otherValue = otherObject?.[key];
          const comma = index < keys.length - 1 ? "," : "";

          return (
            <span key={key} className={styles.diffJsonLine}>
              <span>{`  ${JSON.stringify(key)}: `}</span>
              {renderComparedValue(
                currentValue,
                otherValue,
                currentHasKey,
                otherHasKey,
                side,
              )}
              <span>{`${comma}\n`}</span>
            </span>
          );
        })}
        <span>{"}"}</span>
      </pre>
    </div>
  );
}

function renderComparedValue(
  currentValue: unknown,
  otherValue: unknown,
  currentHasKey: boolean,
  otherHasKey: boolean,
  side: DiffSide,
): ReactNode {
  if (!currentHasKey) {
    return (
      <span className={styles.diffMissing}>
        {side === "before" ? "— no existía —" : "— eliminado —"}
      </span>
    );
  }

  const currentText = stringifyValue(currentValue);

  if (!otherHasKey) {
    return <mark className={styles.diffChanged}>{currentText}</mark>;
  }

  if (deepEqual(currentValue, otherValue)) {
    return currentText;
  }

  if (isPrimitive(currentValue) && isPrimitive(otherValue)) {
    const beforeText = stringifyValue(side === "before" ? currentValue : otherValue);
    const afterText = stringifyValue(side === "before" ? otherValue : currentValue);
    return renderDiffText(beforeText, afterText, side);
  }

  return <mark className={styles.diffChanged}>{currentText}</mark>;
}

function renderDiffText(beforeText: string, afterText: string, side: DiffSide): ReactNode {
  const pieces = diffTokenText(beforeText, afterText, side);

  return pieces.map((piece, index) =>
    piece.changed ? (
      <mark
        key={`${index}-${piece.text.slice(0, 12)}`}
        className={`${styles.diffChanged} ${
          side === "before" ? styles.diffRemoved : styles.diffAdded
        }`}
      >
        {piece.text}
      </mark>
    ) : (
      <span key={`${index}-${piece.text.slice(0, 12)}`}>{piece.text}</span>
    ),
  );
}

function diffTokenText(beforeText: string, afterText: string, side: DiffSide): DiffPiece[] {
  if (beforeText === afterText) return [{ text: side === "before" ? beforeText : afterText, changed: false }];

  const beforeTokens = tokenize(beforeText);
  const afterTokens = tokenize(afterText);

  // El LCS da una marca muy precisa para textos normales. Para cuerpos HTML
  // extraordinariamente largos usamos prefijo/sufijo para evitar bloquear el admin.
  if (beforeTokens.length * afterTokens.length > 1_600_000) {
    return prefixSuffixDiff(beforeText, afterText, side);
  }

  const rows = beforeTokens.length + 1;
  const cols = afterTokens.length + 1;
  const table = new Uint16Array(rows * cols);

  const cell = (i: number, j: number) => i * cols + j;

  for (let i = beforeTokens.length - 1; i >= 0; i -= 1) {
    for (let j = afterTokens.length - 1; j >= 0; j -= 1) {
      table[cell(i, j)] =
        beforeTokens[i] === afterTokens[j]
          ? table[cell(i + 1, j + 1)] + 1
          : Math.max(table[cell(i + 1, j)], table[cell(i, j + 1)]);
    }
  }

  const beforePieces: DiffPiece[] = [];
  const afterPieces: DiffPiece[] = [];
  let i = 0;
  let j = 0;

  while (i < beforeTokens.length && j < afterTokens.length) {
    if (beforeTokens[i] === afterTokens[j]) {
      pushPiece(beforePieces, beforeTokens[i], false);
      pushPiece(afterPieces, afterTokens[j], false);
      i += 1;
      j += 1;
    } else if (table[cell(i + 1, j)] >= table[cell(i, j + 1)]) {
      pushPiece(beforePieces, beforeTokens[i], true);
      i += 1;
    } else {
      pushPiece(afterPieces, afterTokens[j], true);
      j += 1;
    }
  }

  while (i < beforeTokens.length) {
    pushPiece(beforePieces, beforeTokens[i], true);
    i += 1;
  }

  while (j < afterTokens.length) {
    pushPiece(afterPieces, afterTokens[j], true);
    j += 1;
  }

  return side === "before" ? beforePieces : afterPieces;
}

function prefixSuffixDiff(beforeText: string, afterText: string, side: DiffSide): DiffPiece[] {
  const current = side === "before" ? beforeText : afterText;
  const other = side === "before" ? afterText : beforeText;
  let prefix = 0;
  const maxPrefix = Math.min(current.length, other.length);

  while (prefix < maxPrefix && current[prefix] === other[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < current.length - prefix &&
    suffix < other.length - prefix &&
    current[current.length - 1 - suffix] === other[other.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const pieces: DiffPiece[] = [];
  if (prefix > 0) pieces.push({ text: current.slice(0, prefix), changed: false });

  const changedEnd = suffix > 0 ? current.length - suffix : current.length;
  if (changedEnd > prefix) {
    pieces.push({ text: current.slice(prefix, changedEnd), changed: true });
  }

  if (suffix > 0) pieces.push({ text: current.slice(current.length - suffix), changed: false });
  return pieces;
}

function tokenize(value: string): string[] {
  return value.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [value];
}

function pushPiece(target: DiffPiece[], text: string, changed: boolean) {
  const last = target[target.length - 1];
  if (last && last.changed === changed) {
    last.text += text;
    return;
  }
  target.push({ text, changed });
}

function stringifyValue(value: unknown): string {
  const serialized = JSON.stringify(value, null, 2);
  return serialized === undefined ? "undefined" : serialized;
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isPrimitive(value: unknown): value is Primitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function actionLabel(value: string) {
  return (
    {
      CREATE: "Creó",
      UPDATE: "Editó",
      DELETE: "Eliminó",
      REVIEW: "Revisó",
      PUBLISH: "Publicó",
    } as Record<string, string>
  )[value] ?? value;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
