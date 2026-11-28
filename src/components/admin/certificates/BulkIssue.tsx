import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ApiError } from "../../../services/api";
import type { CertificatesApi } from "../../../services/certificates";
import type {
  BulkRowResult,
  CertificateData,
  CertificateDetail,
  CertificateOptions,
  ImportedRow,
} from "../../../types/certificates";
import { TYPE_NAMES, newRequestId, saveBlob } from "../../../utils/certificates";
import forms from "../AdminForms.module.css";
import { emptyCertificate } from "./certificateDraft";
import { CertificateFields } from "./CertificateFields";
import styles from "./Certificates.module.css";
import { Modal } from "./Modal";

interface Row {
  key: string; // también es la clave de idempotencia de la emisión
  line: number;
  /** Valores propios de la fila (del archivo o corregidos); el resto sale de los campos comunes. */
  own: Partial<CertificateData>;
  acceptDuplicate: boolean;
  issued?: CertificateDetail;
  failure?: string;
}

function mergeRow(common: CertificateData, row: Row, options: CertificateOptions): CertificateData {
  const data: CertificateData = { ...common, recipient_name: "", ...row.own };
  const type = options.types.find((item) => item.value === data.certificate_type);
  // Una fila con otro tipo usa el texto sugerido de ese tipo, no el del tipo común.
  if (data.certificate_type !== common.certificate_type && row.own.recognition_text === undefined) {
    data.recognition_text = type?.text || common.recognition_text;
  }
  if (data.certificate_type !== "custom") data.type_label = type?.label ?? "";
  // Si el archivo trae una duración, se muestra aunque los campos comunes la oculten.
  if (row.own.duration_value && row.own.show_duration === undefined) data.show_duration = true;
  return data;
}

const csvCell = (value: string) => {
  // Evita que una hoja de cálculo interprete el texto como fórmula.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function BulkIssue({ api, options, onIssued }: { api: CertificatesApi; options: CertificateOptions; onIssued: () => void }) {
  const [common, setCommon] = useState<CertificateData>(() => emptyCertificate(options));
  const [publicDocument, setPublicDocument] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [validation, setValidation] = useState<{ signature: string; results: Map<string, BulkRowResult> } | null>(null);
  const [validationError, setValidationError] = useState("");
  const [revalidate, setRevalidate] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const stop = useRef(false);
  const running = progress !== null;

  useEffect(() => {
    stop.current = false;
    return () => {
      stop.current = true; // al salir de la sección no se siguen emitiendo filas
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  const pending = useMemo(() => rows.filter((row) => !row.issued), [rows]);
  const payload = useMemo(() => pending.map((row) => mergeRow(common, row, options)), [pending, common, options]);
  const signature = useMemo(
    () => JSON.stringify([pending.map((row) => row.key), payload, revalidate]),
    [pending, payload, revalidate],
  );
  const current = validation?.signature === signature;

  useEffect(() => {
    if (!pending.length || running) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      api.validateRows(payload, controller.signal)
        .then(({ results }) => {
          setValidation({ signature, results: new Map(results.map((result) => [pending[result.index].key, result])) });
          setValidationError("");
        })
        .catch((e: unknown) => {
          if (!controller.signal.aborted) setValidationError(e instanceof Error ? e.message : "No se pudieron validar los registros");
        });
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
    // `signature` resume las filas y los datos: evita revalidar por cambios que no afectan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, signature, running]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (rows.some((row) => !row.issued) && !window.confirm("Se reemplazará la lista actual. ¿Continuar?")) return;
    setReading(true);
    setError("");
    setMessage("");
    try {
      const { rows: imported } = await api.importFile(file);
      setRows(imported.map(({ row, ...own }: ImportedRow) => ({
        key: newRequestId(),
        line: row,
        own: own as Partial<CertificateData>,
        acceptDuplicate: false,
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo");
    } finally {
      setReading(false);
    }
  };

  const patchRow = (key: string, patch: Partial<Row>) =>
    setRows((list) => list.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const editRow = (key: string, own: Partial<CertificateData>) =>
    // Si cambia el contenido, es una solicitud distinta (nueva clave de idempotencia).
    setRows((list) => list.map((row) => (row.key === key ? { ...row, own, failure: undefined } : row)));

  const resultFor = (row: Row) => validation?.results.get(row.key);
  const ready = current
    ? pending.filter((row) => {
        const result = resultFor(row);
        return result && !result.errors.length && (!result.duplicates.length || row.acceptDuplicate);
      })
    : [];
  const issued = rows.flatMap((row) => (row.issued ? [row.issued] : []));
  const withErrors = current ? pending.filter((row) => resultFor(row)?.errors.length).length : 0;
  const duplicates = current ? pending.filter((row) => resultFor(row)?.duplicates.length && !row.acceptDuplicate).length : 0;
  const failed = rows.filter((row) => row.failure).length;

  const issueAll = async () => {
    const queue = ready;
    if (!queue.length || !window.confirm(`Se emitirán ${queue.length} certificados definitivos. ¿Continuar?`)) return;
    stop.current = false;
    setError("");
    setMessage("");
    setProgress({ done: 0, total: queue.length });
    let success = 0;
    let failures = 0;
    // Uno por uno: el fallo de un registro no impide procesar los demás.
    for (const [index, row] of queue.entries()) {
      if (stop.current) break;
      const request = {
        ...mergeRow(common, row, options),
        public_document: publicDocument,
        request_id: row.key,
        allow_duplicate: row.acceptDuplicate,
      };
      try {
        const result = await api.issue(request);
        success += 1;
        patchRow(row.key, { issued: result, failure: undefined });
      } catch (e) {
        failures += 1;
        patchRow(row.key, { failure: e instanceof Error ? e.message : "Error al emitir" });
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) stop.current = true;
      }
      setProgress({ done: index + 1, total: queue.length });
    }
    setProgress(null);
    setRevalidate((n) => n + 1);
    const skipped = queue.length - success - failures;
    setMessage(`Proceso terminado: ${success} emitidos correctamente, ${failures} fallidos${skipped ? `, ${skipped} sin procesar` : ""}.`);
    onIssued();
  };

  const downloadReport = () => {
    const lines = [["Fila", "Nombre", "Resultado", "Código", "Enlace de validación", "Detalle"]];
    rows.forEach((row) => {
      const data = row.issued ?? mergeRow(common, row, options);
      lines.push([
        String(row.line),
        data.recipient_name,
        row.issued ? "Emitido" : row.failure ? "Fallido" : "No emitido",
        row.issued?.code ?? "",
        row.issued?.validation_url ?? "",
        row.failure ?? resultFor(row)?.errors.join(" · ") ?? "",
      ]);
    });
    const csv = "﻿" + lines.map((line) => line.map(csvCell).join(";")).join("\r\n");
    saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "resumen-certificados.csv");
  };

  const run = (action: () => Promise<unknown>) => {
    setError("");
    action().catch((e: unknown) => setError(e instanceof Error ? e.message : "No se pudo descargar"));
  };

  const editingRow = rows.find((row) => row.key === editing);

  return (
    <div className={styles.bulk}>
      <section className={forms.editor}>
        <h2 className={styles.step}>1. Campos comunes</h2>
        <p className={styles.hint}>Se aplican a todos los participantes que no traigan un valor propio en el archivo.</p>
        <fieldset className={styles.commonFields} disabled={running}>
          <CertificateFields value={common} types={options.types} onChange={setCommon} withName={false} />
          <label className={forms.checkboxField}>
            <input type="checkbox" checked={publicDocument} onChange={(e) => setPublicDocument(e.target.checked)} />
            Permitir ver el documento original en la página pública
          </label>
        </fieldset>
      </section>

      <section className={forms.editor}>
        <h2 className={styles.step}>2. Lista de participantes</h2>
        <p className={styles.hint}>Excel (.xlsx) o CSV con al menos los nombres. Máximo {options.max_import_rows} filas.</p>
        <div className={styles.buttons}>
          <button type="button" className={forms.secondaryButton} onClick={() => run(api.downloadImportTemplate)}>Descargar plantilla Excel</button>
          <label className={`${forms.primaryButton} ${styles.fileButton}`}>
            {reading ? "Leyendo…" : "Cargar archivo"}
            <input type="file" accept=".xlsx,.csv,.txt" disabled={running || reading} onChange={(e) => void upload(e)} />
          </label>
          {rows.length > 0 && (
            <button type="button" className={forms.secondaryButton} disabled={running} onClick={() => { if (window.confirm("¿Vaciar la lista?")) { setRows([]); setMessage(""); } }}>Vaciar lista</button>
          )}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>

      {rows.length > 0 && (
        <section className={forms.editor}>
          <h2 className={styles.step}>3. Revisar y emitir</h2>
          <p className={styles.summaryLine} role="status">
            {rows.length} registros · {ready.length} listos · {withErrors} con errores · {duplicates} posibles duplicados · {issued.length} emitidos · {failed} fallidos
          </p>
          {validationError && (
            <p className={styles.error} role="alert">
              {validationError}{" "}
              <button type="button" className={forms.secondaryButton} onClick={() => setRevalidate((n) => n + 1)}>Reintentar</button>
            </p>
          )}

          <div className={forms.auditTableWrap}>
            <table className={`${forms.auditTable} ${styles.table}`}>
              <thead><tr><th>Fila</th><th>Nombre completo</th><th>Tipo y actividad</th><th>Revisión</th><th>Acciones</th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const data = row.issued ?? mergeRow(common, row, options);
                  const result = row.issued ? undefined : resultFor(row);
                  return (
                    <tr key={row.key}>
                      <td>{row.line}</td>
                      <td>
                        {row.issued
                          ? <strong>{data.recipient_name}</strong>
                          : <input className={styles.cellInput} aria-label={`Nombre de la fila ${row.line}`} value={data.recipient_name} maxLength={160} disabled={running} onChange={(e) => editRow(row.key, { ...row.own, recipient_name: e.target.value })} />}
                      </td>
                      <td>{TYPE_NAMES[data.certificate_type] ?? data.certificate_type}<br /><small>{data.activity_name || "Sin actividad"} · {data.certificate_date}</small></td>
                      <td>
                        {row.issued && <span className={`${styles.badge} ${styles.badgeValid}`}>Emitido {row.issued.code}</span>}
                        {row.failure && <p className={styles.rowError}>No se emitió: {row.failure}</p>}
                        {!row.issued && !current && <small>Validando…</small>}
                        {current && result?.errors.map((text) => <p key={text} className={styles.rowError}>{text}</p>)}
                        {current && result && result.duplicates.length > 0 && (
                          <>
                            {result.duplicates.map((text) => <p key={text} className={styles.rowWarning}>{text}</p>)}
                            <label className={forms.checkboxField}>
                              <input type="checkbox" checked={row.acceptDuplicate} disabled={running} onChange={(e) => patchRow(row.key, { acceptDuplicate: e.target.checked })} />
                              Emitir de todos modos
                            </label>
                          </>
                        )}
                        {current && result && !result.errors.length && !result.duplicates.length && !row.failure && <small>Listo</small>}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          {row.issued ? (
                            <button type="button" onClick={() => run(() => api.downloadPdf(row.issued!.id, row.issued!.code))}>Descargar PDF</button>
                          ) : (
                            <>
                              <button type="button" disabled={running} onClick={() => setEditing(row.key)}>Editar</button>
                              <button type="button" disabled={running} className={styles.dangerLink} onClick={() => setRows((list) => list.filter((item) => item.key !== row.key))}>Quitar</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {progress && (
            <div className={styles.progress} role="status">
              <progress max={progress.total} value={progress.done} />
              <span>Emitiendo {progress.done} de {progress.total}. No cierres esta pestaña.</span>
              <button type="button" className={forms.secondaryButton} onClick={() => { stop.current = true; }}>Detener</button>
            </div>
          )}
          {message && <p className={failed ? styles.warning : styles.success} role="status">{message}</p>}

          <div className={styles.buttons}>
            <button type="button" className={forms.primaryButton} disabled={running || !ready.length} onClick={() => void issueAll()}>
              Generar y registrar {ready.length || ""} certificados
            </button>
            <button type="button" className={forms.secondaryButton} disabled={running || !issued.length} onClick={() => run(() => api.downloadZip(issued.map((item) => item.id)))}>
              Descargar ZIP ({issued.length})
            </button>
            <button type="button" className={forms.secondaryButton} disabled={running} onClick={downloadReport}>Descargar resumen (CSV)</button>
          </div>
        </section>
      )}

      {editingRow && (
        <Modal title={`Corregir fila ${editingRow.line}`} onClose={() => setEditing(null)}>
          <div className={styles.form}>
            <CertificateFields
              value={mergeRow(common, editingRow, options)}
              types={options.types}
              onChange={(next) => {
                // Solo se fijan en la fila los campos que cambiaron.
                const before = mergeRow(common, editingRow, options);
                const changed = Object.fromEntries(
                  (Object.keys(next) as (keyof CertificateData)[]).filter((key) => next[key] !== before[key]).map((key) => [key, next[key]]),
                );
                editRow(editingRow.key, { ...editingRow.own, ...changed });
              }}
            />
            <button type="button" className={forms.primaryButton} onClick={() => setEditing(null)}>Listo</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
