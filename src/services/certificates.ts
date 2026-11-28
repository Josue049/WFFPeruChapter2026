import type {
  BulkRowResult,
  CertificateData,
  CertificateDetail,
  CertificateOptions,
  CertificatePage,
  CertificateSummary,
  CertificateVerification,
  ImportedRow,
} from "../types/certificates";
import { saveBlob } from "../utils/certificates";
import { apiBlob, apiRequest } from "./api";

export interface IssueRequest extends CertificateData {
  public_document: boolean;
  request_id: string;
  allow_duplicate?: boolean;
  replaces_id?: number;
}

/** Llamadas administrativas de certificados (todas exigen sesión y permiso en el servidor). */
export function certificatesApi(token: string) {
  const auth = { token, redirectOnUnauthorized: true };
  const base = "/admin/certificates";
  const post = (body: unknown, signal?: AbortSignal): RequestInit => ({ method: "POST", body: JSON.stringify(body), signal });

  return {
    options: () => apiRequest<CertificateOptions>(`${base}/options`, {}, auth),
    summary: () => apiRequest<CertificateSummary>(`${base}/summary`, {}, auth),
    list: (params: URLSearchParams, signal?: AbortSignal) =>
      apiRequest<CertificatePage>(`${base}?${params.toString()}`, { signal }, auth),
    detail: (id: number) => apiRequest<CertificateDetail>(`${base}/${id}`, {}, auth),
    previewDraft: (data: CertificateData, signal?: AbortSignal) => apiBlob(`${base}/preview`, post(data, signal), auth),
    previewIssued: (id: number, signal?: AbortSignal) => apiBlob(`${base}/${id}/preview`, { signal }, auth),
    issue: (data: IssueRequest) => apiRequest<CertificateDetail>(base, post(data), auth),
    revoke: (id: number, reason: string) =>
      apiRequest<CertificateDetail>(`${base}/${id}/revoke`, post({ reason }), auth),
    verify: (query: string) => apiRequest<CertificateVerification>(`${base}/verify`, post({ query }), auth),
    downloadPdf: async (id: number, code: string) =>
      saveBlob(await apiBlob(`${base}/${id}/pdf`, {}, auth), `${code}.pdf`),
    downloadZip: async (ids: number[]) =>
      saveBlob(await apiBlob(`${base}/zip`, post({ ids }), auth), "certificados-wff.zip"),
    downloadImportTemplate: async () =>
      saveBlob(await apiBlob(`${base}/import/template.xlsx`, {}, auth), "plantilla-certificados.xlsx"),
    importFile: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiRequest<{ rows: ImportedRow[] }>(`${base}/import`, { method: "POST", body: form }, auth);
    },
    validateRows: (rows: CertificateData[], signal?: AbortSignal) =>
      apiRequest<{ results: BulkRowResult[] }>(`${base}/bulk/validate`, post({ rows }, signal), auth),
  };
}

export type CertificatesApi = ReturnType<typeof certificatesApi>;
