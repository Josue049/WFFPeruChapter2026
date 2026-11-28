import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ApiError } from "../../../services/api";
import type { CertificatesApi } from "../../../services/certificates";
import type { CertificateData, CertificateDetail, CertificateOptions } from "../../../types/certificates";
import { copyText, newRequestId, todayIso } from "../../../utils/certificates";
import forms from "../AdminForms.module.css";
import { CertificateFields } from "./CertificateFields";
import { emptyCertificate } from "./certificateDraft";
import styles from "./Certificates.module.css";
import { Modal } from "./Modal";

/** La vista previa siempre muestra la plantilla: los campos vacíos usan un texto de muestra. */
function withPlaceholders(data: CertificateData): CertificateData {
  const filled = (value: string, minimum: number, fallback: string) => (value.trim().length >= minimum ? value : fallback);
  return {
    ...data,
    type_label: data.certificate_type === "custom" ? filled(data.type_label, 3, "PERSONALIZADO") : data.type_label,
    recipient_name: filled(data.recipient_name, 2, "Nombre del beneficiario"),
    recognition_text: filled(data.recognition_text, 3, "texto de reconocimiento"),
    activity_name: filled(data.activity_name, 2, "Nombre del curso o actividad"),
    certificate_date: data.certificate_date || todayIso(),
    duration_label: filled(data.duration_label, 1, "Duración"),
    duration_value: filled(data.duration_value, 1, "—"),
  };
}

export interface Correction {
  certificate: CertificateDetail;
}

interface Props {
  api: CertificatesApi;
  options: CertificateOptions;
  correction: Correction | null;
  onCancelCorrection: () => void;
  onIssued: () => void;
}

function fromDetail(certificate: CertificateDetail): CertificateData {
  return {
    certificate_type: certificate.certificate_type,
    type_label: certificate.type_label,
    recipient_name: certificate.recipient_name,
    recognition_text: certificate.recognition_text,
    activity_name: certificate.activity_name,
    certificate_date: certificate.certificate_date,
    duration_label: certificate.duration_label || "Duración",
    duration_value: certificate.duration_value,
    show_duration: certificate.show_duration,
  };
}

export function IssueForm({ api, options, correction, onCancelCorrection, onIssued }: Props) {
  const [data, setData] = useState<CertificateData>(() => (correction ? fromDetail(correction.certificate) : emptyCertificate(options)));
  const [publicDocument, setPublicDocument] = useState(correction?.certificate.public_document ?? true);
  const [requestId, setRequestId] = useState(newRequestId);
  const [issued, setIssued] = useState<CertificateDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [expanded, setExpanded] = useState(false);
  // Una corrección se aplica una sola vez: lo que se emita después es un certificado independiente.
  const [corrected, setCorrected] = useState(false);
  const replacing = corrected ? null : correction?.certificate ?? null;

  const draft = useMemo(() => JSON.stringify(withPlaceholders(data)), [data]);

  // Vista previa en vivo: espera a que se deje de escribir y descarta respuestas antiguas.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      api.previewDraft(JSON.parse(draft) as CertificateData, controller.signal)
        .then((blob) => {
          if (controller.signal.aborted) return;
          setPreview(URL.createObjectURL(blob));
          setPreviewError("");
          setPreviewLoading(false);
        })
        .catch((e: unknown) => {
          if (controller.signal.aborted) return;
          setPreviewError(e instanceof Error ? e.message : "No se pudo generar la vista previa");
          setPreviewLoading(false);
        });
    }, 600);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [api, draft, refresh]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const change = (next: CertificateData) => {
    setData(next);
    setIssued(null);
    setError("");
    setNotice("");
    setRequestId(newRequestId()); // otro contenido: es otra solicitud de emisión
  };

  const clear = () => {
    change(emptyCertificate(options));
    setPublicDocument(true);
    if (correction) onCancelCorrection();
  };

  const missing =
    data.recipient_name.trim().length < 2 ||
    data.activity_name.trim().length < 2 ||
    data.recognition_text.trim().length < 3 ||
    !data.certificate_date ||
    (data.certificate_type === "custom" && data.type_label.trim().length < 3) ||
    (data.show_duration && (!data.duration_label.trim() || !data.duration_value.trim()));

  const issue = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || issued || missing) return;
    const warning = replacing
      ? `Se emitirá un certificado nuevo y ${replacing.status === "valid" ? "se REVOCARÁ" : "reemplazará a"} ${replacing.code}.`
      : "Se registrará un certificado definitivo. Sus datos no se podrán modificar.";
    if (!window.confirm(`${warning}\n\nRevisa la vista previa. ¿Emitir el certificado de "${data.recipient_name.trim()}"?`)) return;

    setBusy(true);
    setError("");
    setNotice("");
    const request = {
      ...data,
      public_document: publicDocument,
      request_id: requestId,
      replaces_id: replacing?.id,
    };
    try {
      let result: CertificateDetail;
      try {
        result = await api.issue(request);
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 409 && e.message.startsWith("Posible duplicado"))) throw e;
        if (!window.confirm(`${e.message}.\n\n¿Emitir de todos modos?`)) return;
        result = await api.issue({ ...request, allow_duplicate: true });
      }
      setIssued(result);
      if (replacing) setCorrected(true);
      onIssued();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo emitir el certificado");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (issued && (await copyText(issued.validation_url))) setNotice("Enlace de validación copiado.");
  };

  const download = async () => {
    if (!issued) return;
    try {
      await api.downloadPdf(issued.id, issued.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo descargar el PDF");
    }
  };

  return (
    <div className={styles.generator}>
      <form className={`${forms.editor} ${styles.form}`} onSubmit={issue}>
        {replacing && !issued && (
          <div className={styles.warning}>
            Corrección de <strong>{replacing.code}</strong>: al emitir, ese certificado quedará reemplazado y sin vigencia.
            <button type="button" className={forms.secondaryButton} onClick={clear}>Cancelar corrección</button>
          </div>
        )}
        <CertificateFields value={data} types={options.types} onChange={change} />
        <label className={forms.checkboxField}>
          <input type="checkbox" checked={publicDocument} onChange={(event) => { setPublicDocument(event.target.checked); setIssued(null); setRequestId(newRequestId()); }} />
          Permitir ver el documento original en la página pública
        </label>
        {!options.public_document_enabled && <p className={styles.hint}>El servidor tiene desactivada la vista pública de documentos.</p>}

        {error && <p className={styles.error} role="alert">{error}</p>}
        {issued && (
          <p className={styles.success} role="status">
            Certificado <strong>{issued.code}</strong> registrado.
          </p>
        )}
        {notice && <p className={styles.hint} role="status">{notice}</p>}

        <div className={styles.buttons}>
          <button type="button" className={forms.secondaryButton} onClick={() => { setRefresh((n) => n + 1); setExpanded(true); }}>Vista previa</button>
          <button type="submit" className={forms.primaryButton} disabled={busy || Boolean(issued) || missing}>
            {busy ? "Emitiendo…" : "Generar y registrar certificado"}
          </button>
          <button type="button" className={forms.secondaryButton} disabled={!issued} onClick={() => void download()}>Descargar PDF</button>
          <button type="button" className={forms.secondaryButton} disabled={!issued} onClick={() => void copy()}>Copiar enlace de validación</button>
          <button type="button" className={forms.secondaryButton} disabled={busy} onClick={clear}>Limpiar formulario</button>
        </div>
        {missing && !issued && <p className={styles.hint}>Completa todos los campos para emitir.</p>}
      </form>

      <section className={styles.previewColumn} aria-label="Vista previa del certificado">
        <div className={styles.paper} aria-busy={previewLoading}>
          {preview && <img src={preview} alt="Vista previa del certificado" className={previewLoading || previewError ? styles.stale : ""} />}
          {!preview && !previewError && <p role="status">Preparando vista previa…</p>}
        </div>
        {previewError
          ? <p className={styles.error} role="alert">{previewError}</p>
          : <p className={styles.hint}>{previewLoading ? "Actualizando…" : "Vista previa sobre la plantilla original. No se registra nada."}</p>}
      </section>

      {expanded && (
        <Modal title="Vista previa" wide onClose={() => setExpanded(false)}>
          {previewError && <p className={styles.error} role="alert">{previewError}</p>}
          {previewLoading && <p className={styles.hint} role="status">Actualizando…</p>}
          <div className={styles.paper}>{preview && <img src={preview} alt="Vista previa ampliada del certificado" />}</div>
        </Modal>
      )}
    </div>
  );
}
