import { useEffect, useState } from "react";
import type { CertificatesApi } from "../../../services/certificates";
import styles from "./Certificates.module.css";

/** Imagen del PDF original almacenado (la ruta exige sesión, por eso se descarga como blob). */
export function IssuedPreview({ api, id, code }: { api: CertificatesApi; id: number; code: string }) {
  const [result, setResult] = useState<{ id: number; url: string; error: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let url = "";
    api.previewIssued(id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setResult({ id, url, error: "" });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setResult({ id, url: "", error: error instanceof Error ? error.message : "No se pudo cargar la vista previa" });
        }
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [api, id]);

  const current = result?.id === id ? result : null;
  return (
    <div className={styles.paper}>
      {current?.url && <img src={current.url} alt={`Certificado ${code}`} />}
      {!current && <p role="status">Cargando documento…</p>}
      {current?.error && <p role="alert">{current.error}</p>}
    </div>
  );
}
