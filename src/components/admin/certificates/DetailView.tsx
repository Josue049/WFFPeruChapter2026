import type { CertificateDetail } from "../../../types/certificates";
import { STATUS_NAMES, TYPE_NAMES, formatDateTime, formatDay } from "../../../utils/certificates";
import styles from "./Certificates.module.css";

export function StatusBadge({ status }: { status: CertificateDetail["status"] }) {
  return <span className={`${styles.badge} ${status === "valid" ? styles.badgeValid : styles.badgeRevoked}`}>{STATUS_NAMES[status]}</span>;
}

export function DetailView({ certificate }: { certificate: CertificateDetail }) {
  const rows: [string, string | null][] = [
    ["Código", certificate.code],
    ["Beneficiario", certificate.recipient_name],
    ["Tipo", `${TYPE_NAMES[certificate.certificate_type]} (${certificate.type_label})`],
    ["Texto de reconocimiento", certificate.recognition_text],
    ["Curso o actividad", certificate.activity_name],
    ["Fecha del certificado", formatDay(certificate.certificate_date)],
    ["Duración", certificate.show_duration ? `${certificate.duration_label}: ${certificate.duration_value}` : "No se muestra"],
    ["Emitido el", formatDateTime(certificate.created_at)],
    ["Emitido por", certificate.issued_by_name],
    ["Reemplaza a", certificate.replaces_code],
    ["Reemplazado por", certificate.replaced_by_code],
    ["Revocado el", certificate.revoked_at && formatDateTime(certificate.revoked_at)],
    ["Revocado por", certificate.revoked_by_name],
    ["Motivo de revocación (privado)", certificate.revocation_reason],
    ["Documento visible al público", certificate.public_document ? "Sí" : "No"],
    ["Plantilla", `${certificate.template_id}, versión ${certificate.template_version}`],
    ["Enlace de validación", certificate.validation_url],
    ["SHA-256 del PDF", certificate.pdf_sha256],
  ];

  return (
    <dl className={styles.details}>
      <div><dt>Estado</dt><dd><StatusBadge status={certificate.status} /></dd></div>
      {rows.filter(([, value]) => value).map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}
