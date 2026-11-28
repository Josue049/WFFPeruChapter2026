import type { CertificateData, CertificateOptions, CertificateType, CertificateTypeOption } from "../../../types/certificates";
import { todayIso } from "../../../utils/certificates";

export function emptyCertificate(options: CertificateOptions): CertificateData {
  const first = options.types[0];
  return {
    certificate_type: first.value,
    type_label: first.label,
    recipient_name: "",
    recognition_text: first.text,
    activity_name: "",
    certificate_date: todayIso(),
    duration_label: "Duración",
    duration_value: "",
    show_duration: true,
  };
}

/** Cambia el tipo y actualiza el texto de reconocimiento si seguía siendo el sugerido. */
export function applyType(data: CertificateData, type: CertificateType, types: CertificateTypeOption[]): CertificateData {
  const previous = types.find((item) => item.value === data.certificate_type);
  const next = types.find((item) => item.value === type);
  const untouched = !data.recognition_text.trim() || data.recognition_text === previous?.text;
  return {
    ...data,
    certificate_type: type,
    type_label: type === "custom" ? "" : next?.label ?? "",
    recognition_text: untouched ? next?.text ?? "" : data.recognition_text,
  };
}
