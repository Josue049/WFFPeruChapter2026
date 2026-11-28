import { useId } from "react";
import type { CertificateData, CertificateType, CertificateTypeOption } from "../../../types/certificates";
import forms from "../AdminForms.module.css";
import { applyType } from "./certificateDraft";

interface Props {
  value: CertificateData;
  types: CertificateTypeOption[];
  onChange: (next: CertificateData) => void;
  /** En generación masiva los campos comunes no incluyen el nombre. */
  withName?: boolean;
}

export function CertificateFields({ value, types, onChange, withName = true }: Props) {
  const id = useId();
  const set = (patch: Partial<CertificateData>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className={forms.field}>
        <label htmlFor={`${id}-type`}>Tipo de certificado</label>
        <select
          id={`${id}-type`}
          value={value.certificate_type}
          onChange={(event) => onChange(applyType(value, event.target.value as CertificateType, types))}
        >
          {types.map((type) => <option key={type.value} value={type.value}>{type.name}</option>)}
        </select>
      </div>
      {value.certificate_type === "custom" && (
        <div className={forms.field}>
          <label htmlFor={`${id}-label`}>Texto de la etiqueta personalizada</label>
          <input id={`${id}-label`} value={value.type_label} maxLength={60} placeholder="DE EXCELENCIA" onChange={(event) => set({ type_label: event.target.value })} />
          <small>Aparece en la etiqueta amarilla, debajo de «Certificado».</small>
        </div>
      )}
      {withName && (
        <div className={forms.field}>
          <label htmlFor={`${id}-name`}>Nombre completo del beneficiario</label>
          <input id={`${id}-name`} value={value.recipient_name} maxLength={160} autoComplete="off" onChange={(event) => set({ recipient_name: event.target.value })} />
        </div>
      )}
      <div className={forms.field}>
        <label htmlFor={`${id}-text`}>Texto de reconocimiento</label>
        <input id={`${id}-text`} value={value.recognition_text} maxLength={300} onChange={(event) => set({ recognition_text: event.target.value })} />
        <small>Debajo continúa el texto fijo «desarrollado en el marco del Foro Mundial de la Alimentación…».</small>
      </div>
      <div className={forms.field}>
        <label htmlFor={`${id}-activity`}>Nombre del curso o actividad</label>
        <input id={`${id}-activity`} value={value.activity_name} maxLength={250} onChange={(event) => set({ activity_name: event.target.value })} />
      </div>
      <div className={forms.field}>
        <label htmlFor={`${id}-date`}>Fecha</label>
        <input id={`${id}-date`} type="date" min="2000-01-01" max="2100-12-31" value={value.certificate_date} onChange={(event) => set({ certificate_date: event.target.value })} />
      </div>
      <label className={forms.checkboxField}>
        <input type="checkbox" checked={value.show_duration} onChange={(event) => set({ show_duration: event.target.checked })} />
        Mostrar el apartado de duración
      </label>
      {value.show_duration && (
        <div className={forms.twoColumns}>
          <div className={forms.field}>
            <label htmlFor={`${id}-dlabel`}>Etiqueta de duración</label>
            <input id={`${id}-dlabel`} value={value.duration_label} maxLength={60} placeholder="Duración" onChange={(event) => set({ duration_label: event.target.value })} />
          </div>
          <div className={forms.field}>
            <label htmlFor={`${id}-dvalue`}>Duración</label>
            <input id={`${id}-dvalue`} value={value.duration_value} maxLength={80} placeholder="5 lecciones, 8 horas…" onChange={(event) => set({ duration_value: event.target.value })} />
          </div>
        </div>
      )}
    </>
  );
}
