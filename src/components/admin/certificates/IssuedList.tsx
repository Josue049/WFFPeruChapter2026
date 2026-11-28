import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CertificatesApi } from "../../../services/certificates";
import type { CertificateDetail, CertificateItem, CertificateOptions, CertificatePage } from "../../../types/certificates";
import { TYPE_NAMES, copyText, formatDateTime, formatDay } from "../../../utils/certificates";
import forms from "../AdminForms.module.css";
import styles from "./Certificates.module.css";
import { DetailView, StatusBadge } from "./DetailView";
import { IssuedPreview } from "./IssuedPreview";
import { Modal } from "./Modal";

const PAGE_SIZE = 25;
const EMPTY_FILTERS = { name: "", code: "", activity: "", certificate_type: "", date_from: "", date_to: "", status: "" };

type Dialog =
  | { kind: "view"; item: CertificateItem }
  | { kind: "details"; certificate: CertificateDetail }
  | { kind: "revoke"; item: CertificateItem };

interface Props {
  api: CertificatesApi;
  options: CertificateOptions;
  /** Cambia cuando hay emisiones o revocaciones: obliga a recargar. */
  version: number;
  onChanged: () => void;
  onVerify: (code: string) => void;
  onCorrect: (certificate: CertificateDetail) => void;
}

export function IssuedList({ api, options, version, onChanged, onVerify, onCorrect }: Props) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<CertificatePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
      Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
      setLoading(true);
      api.list(params, controller.signal)
        .then((data) => {
          setResult(data);
          setError("");
          setLoading(false);
        })
        .catch((e: unknown) => {
          if (controller.signal.aborted) return;
          setError(e instanceof Error ? e.message : "No se pudo cargar el historial");
          setLoading(false);
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [api, filters, page, version]);

  const filter = (patch: Partial<typeof EMPTY_FILTERS>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la acción");
    }
  };

  const showDetails = (id: number) => run(async () => setDialog({ kind: "details", certificate: await api.detail(id) }));

  const revoke = async (event: FormEvent) => {
    event.preventDefault();
    if (dialog?.kind !== "revoke") return;
    setBusy(true);
    setDialogError("");
    try {
      await api.revoke(dialog.item.id, reason);
      setNotice(`Certificado ${dialog.item.code} revocado.`);
      setDialog(null);
      onChanged();
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : "No se pudo revocar");
    } finally {
      setBusy(false);
    }
  };

  const pages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <div className={styles.filters}>
        <div className={forms.field}><label>Nombre<input type="search" value={filters.name} onChange={(e) => filter({ name: e.target.value })} /></label></div>
        <div className={forms.field}><label>Código<input type="search" value={filters.code} onChange={(e) => filter({ code: e.target.value })} /></label></div>
        <div className={forms.field}><label>Curso o actividad<input type="search" value={filters.activity} onChange={(e) => filter({ activity: e.target.value })} /></label></div>
        <div className={forms.field}><label>Tipo
          <select value={filters.certificate_type} onChange={(e) => filter({ certificate_type: e.target.value })}>
            <option value="">Todos</option>
            {options.types.map((type) => <option key={type.value} value={type.value}>{type.name}</option>)}
          </select></label>
        </div>
        <div className={forms.field}><label>Fecha desde<input type="date" value={filters.date_from} onChange={(e) => filter({ date_from: e.target.value })} /></label></div>
        <div className={forms.field}><label>Fecha hasta<input type="date" value={filters.date_to} onChange={(e) => filter({ date_to: e.target.value })} /></label></div>
        <div className={forms.field}><label>Estado
          <select value={filters.status} onChange={(e) => filter({ status: e.target.value })}>
            <option value="">Todos</option>
            <option value="valid">Vigente</option>
            <option value="revoked">Revocado</option>
          </select></label>
        </div>
        <button type="button" className={forms.secondaryButton} onClick={() => filter(EMPTY_FILTERS)}>Limpiar filtros</button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.success} role="status">{notice}</p>}

      <section className={forms.auditTableCard} aria-busy={loading}>
        <div className={forms.auditTableWrap}>
          <table className={`${forms.auditTable} ${styles.table}`}>
            <thead>
              <tr>
                <th>Código</th><th>Beneficiario</th><th>Tipo</th><th>Curso o actividad</th>
                <th>Fecha</th><th>Emisión</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {result?.items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.code}>{item.code}</td>
                  <td><strong>{item.recipient_name}</strong></td>
                  <td>{TYPE_NAMES[item.certificate_type]}</td>
                  <td>{item.activity_name}</td>
                  <td>{formatDay(item.certificate_date)}</td>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" onClick={() => setDialog({ kind: "view", item })}>Visualizar</button>
                      <button type="button" onClick={() => void run(() => api.downloadPdf(item.id, item.code))}>Descargar PDF</button>
                      <button type="button" onClick={() => void run(async () => { if (await copyText(item.validation_url)) setNotice(`Enlace de ${item.code} copiado.`); })}>Copiar enlace</button>
                      <button type="button" onClick={() => onVerify(item.code)}>Verificar</button>
                      <button type="button" onClick={() => void showDetails(item.id)}>Detalles</button>
                      {item.status === "valid" && (
                        <button type="button" className={styles.dangerLink} onClick={() => { setReason(""); setDialogError(""); setDialog({ kind: "revoke", item }); }}>Revocar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && !result && <div className={forms.empty} role="status">Cargando…</div>}
          {result && !result.items.length && <div className={forms.empty}>No hay certificados que coincidan.</div>}
        </div>
      </section>

      {result && result.total > 0 && (
        <div className={styles.pager}>
          <button type="button" className={forms.secondaryButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page} de {pages} · {result.total} certificados</span>
          <button type="button" className={forms.secondaryButton} disabled={page >= pages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      )}

      {dialog?.kind === "view" && (
        <Modal title={`${dialog.item.recipient_name} · ${dialog.item.code}`} wide onClose={() => setDialog(null)}>
          <IssuedPreview api={api} id={dialog.item.id} code={dialog.item.code} />
        </Modal>
      )}
      {dialog?.kind === "details" && (
        <Modal title="Detalles del certificado" onClose={() => setDialog(null)}>
          <DetailView certificate={dialog.certificate} />
          <div className={styles.buttons}>
            <button type="button" className={forms.secondaryButton} onClick={() => { onCorrect(dialog.certificate); setDialog(null); }}>
              Corregir (revocar y emitir de nuevo)
            </button>
          </div>
        </Modal>
      )}
      {dialog?.kind === "revoke" && (
        <Modal title="Revocar certificado" onClose={() => !busy && setDialog(null)}>
          <form onSubmit={revoke}>
            <p>
              <strong>{dialog.item.code}</strong> de {dialog.item.recipient_name} dejará de estar vigente. El registro se
              conserva y la página pública lo mostrará como revocado. Esta acción no se puede deshacer.
            </p>
            <div className={forms.field}>
              <label htmlFor="revoke-reason">Motivo (privado, solo visible en el panel)</label>
              <textarea id="revoke-reason" value={reason} minLength={5} maxLength={1000} required onChange={(e) => setReason(e.target.value)} />
            </div>
            {dialogError && <p className={styles.error} role="alert">{dialogError}</p>}
            <div className={styles.buttons}>
              <button type="submit" className={forms.dangerButton} disabled={busy || reason.trim().length < 5}>
                {busy ? "Revocando…" : "Revocar certificado"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
