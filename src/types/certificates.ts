export type CertificateType = "completion" | "participation" | "recognition" | "appreciation" | "custom";
export type CertificateStatus = "valid" | "revoked";

export interface CertificateData {
  certificate_type: CertificateType;
  type_label: string;
  recipient_name: string;
  recognition_text: string;
  activity_name: string;
  /** AAAA-MM-DD */
  certificate_date: string;
  duration_label: string;
  duration_value: string;
  show_duration: boolean;
}

export interface CertificateTypeOption {
  value: CertificateType;
  name: string;
  label: string;
  text: string;
}

export interface CertificateOptions {
  types: CertificateTypeOption[];
  validation_base_url: string;
  template: { id: string; version: string };
  public_document_enabled: boolean;
  max_import_rows: number;
}

export interface CertificateSummary {
  total: number;
  valid: number;
  revoked: number;
}

export interface CertificateItem {
  id: number;
  code: string;
  certificate_type: CertificateType;
  type_label: string;
  recipient_name: string;
  activity_name: string;
  certificate_date: string;
  created_at: string;
  status: CertificateStatus;
  validation_url: string;
}

export interface CertificateDetail extends CertificateItem {
  recognition_text: string;
  duration_label: string;
  duration_value: string;
  show_duration: boolean;
  public_document: boolean;
  template_id: string;
  template_version: string;
  pdf_sha256: string;
  pdf_size: number;
  issued_by_name: string;
  revoked_at: string | null;
  revoked_by_name: string | null;
  revocation_reason: string | null;
  replaces_code: string | null;
  replaced_by_code: string | null;
}

export interface CertificatePage {
  items: CertificateItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface CertificateVerification {
  found: boolean;
  code: string | null;
  certificate: CertificateDetail | null;
  integrity_ok: boolean;
}

/** Fila leída de un Excel/CSV: solo trae las columnas con valor. */
export type ImportedRow = Partial<Record<keyof CertificateData, string | boolean>> & { row: number };

export interface BulkRowResult {
  index: number;
  errors: string[];
  duplicates: string[];
}

export interface PublicCertificate {
  code: string;
  status: CertificateStatus;
  certificate_type: CertificateType;
  type_label: string;
  recipient_name: string;
  activity_name: string;
  certificate_date: string;
  duration_label: string;
  duration_value: string;
  show_duration: boolean;
  issued_at: string;
  document_available: boolean;
}
