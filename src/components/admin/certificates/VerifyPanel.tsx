import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CertificatesApi } from "../../../services/certificates";
import type { CertificateVerification } from "../../../types/certificates";
import { copyText } from "../../../utils/certificates";
import forms from "../AdminForms.module.css";
import styles from "./Certificates.module.css";
import { DetailView } from "./DetailView";
import { IssuedPreview } from "./IssuedPreview";

export function VerifyPanel({ api, initialQuery }: { api: CertificatesApi; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const verify = useCallback(async (value: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    setResult(null);
    try {
      setResult(await api.verify(value));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo verificar");
    } finally {
      setBusy(false);
    }
  }, [api]);

  // Al llegar desde el historial se verifica directamente (siempre contra la base de datos).
  useEffect(() => {
    if (!initialQuery) return;
    const timer = window.setTimeout(() => void verify(initialQuery), 0);
    return () => window.clearTimeout(timer);
  }, [initialQuery, verify]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) void verify(query.trim());
  };

  const certificate = result?.certificate;

  return (
    <div>
      <form className={styles.verifyForm} onSubmit={submit}>
        <div className={forms.field}>
          <label htmlFor="verify-query">Código del certificado o URL de validación</label>
          <input id="verify-query" value={query} maxLength={600} autoComplete="off" placeholder="WFF-2026-8F29C7A41B62" onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button type="submit" className={forms.primaryButton} disabled={busy || !query.trim()}>{busy ? "Consultando…" : "Verificar"}</button>
      </form>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {result && !result.found && (
        <p className={styles.error} role="status">
          {result.code
            ? `No existe ningún certificado registrado con el código ${result.code}.`
            : "No se reconoce un código de certificado en lo que ingresaste."}
        </p>
      )}

      {certificate && result && (
        <>
          <p className={certificate.status === "valid" && result.integrity_ok ? styles.success : styles.error} role="status">
            {certificate.status === "valid" ? "El certificado existe y está vigente." : "El certificado existe, pero está REVOCADO."}{" "}
            {result.integrity_ok
              ? "El documento almacenado coincide con su huella SHA-256 original."
              : "ATENCIÓN: el documento almacenado NO coincide con su huella SHA-256 original."}
          </p>
          <div className={styles.verifyResult}>
            <section className={forms.editor}>
              <DetailView certificate={certificate} />
              {notice && <p className={styles.hint} role="status">{notice}</p>}
              <div className={styles.buttons}>
                <button type="button" className={forms.primaryButton} onClick={() => api.downloadPdf(certificate.id, certificate.code).catch((e: Error) => setError(e.message))}>Descargar PDF</button>
                <button type="button" className={forms.secondaryButton} onClick={() => void copyText(certificate.validation_url).then((ok) => ok && setNotice("Enlace de validación copiado."))}>Copiar enlace</button>
              </div>
            </section>
            <IssuedPreview api={api} id={certificate.id} code={certificate.code} />
          </div>
        </>
      )}
    </div>
  );
}
