import { useEffect, useState } from "react";
import type { AdminQuestion } from "../../../types/campus";
import styles from "../AdminForms.module.css";
import { adminRequest, errorMessage, jsonBody } from "./adminApi";

const blankQuestion = (): AdminQuestion => ({
  text: "",
  kind: "single",
  points: 1,
  explanation: "",
  options: [
    { text: "", is_correct: true },
    { text: "", is_correct: false },
  ],
});

const KIND_LABEL = { single: "Selección única", multiple: "Selección múltiple", true_false: "Verdadero / Falso" } as const;

export function QuizEditor({ token, lessonId, onSaved }: { token: string; lessonId: number; onSaved: () => void }) {
  const [items, setItems] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let active = true;
    adminRequest<{ items: AdminQuestion[] }>(token, `/lessons/${lessonId}/questions`)
      .then((data) => active && setItems(data.items))
      .catch((error) => active && (setIsError(true), setMessage(errorMessage(error))))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, lessonId]);

  const patch = (index: number, change: Partial<AdminQuestion>) =>
    setItems((current) => current.map((q, i) => (i === index ? { ...q, ...change } : q)));

  const changeKind = (index: number, kind: AdminQuestion["kind"]) => {
    const question = items[index];
    if (kind === "true_false") {
      patch(index, {
        kind,
        options: [
          { text: "Verdadero", is_correct: true },
          { text: "Falso", is_correct: false },
        ],
      });
    } else if (kind === "single") {
      let seen = false;
      patch(index, {
        kind,
        options: question.options.map((o) => {
          const keep = o.is_correct && !seen;
          if (keep) seen = true;
          return { ...o, is_correct: keep };
        }),
      });
    } else {
      patch(index, { kind });
    }
  };

  const setOption = (qi: number, oi: number, change: { text?: string; is_correct?: boolean }) => {
    const question = items[qi];
    const options = question.options.map((o, i) => {
      if (i === oi) return { ...o, ...change };
      if (change.is_correct && question.kind !== "multiple") return { ...o, is_correct: false };
      return o;
    });
    patch(qi, { options });
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const save = async () => {
    setBusy(true);
    setMessage("");
    try {
      const data = await adminRequest<{ items: AdminQuestion[] }>(token, `/lessons/${lessonId}/questions`, {
        method: "PUT",
        body: jsonBody({ items }),
      });
      setItems(data.items);
      setIsError(false);
      setMessage("Preguntas guardadas.");
      onSaved();
    } catch (error) {
      setIsError(true);
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Cargando preguntas…</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {message && <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>}
      {items.map((question, qi) => (
        <fieldset key={question.id ?? `new-${qi}`} className={styles.settingCard} style={{ margin: 0 }}>
          <legend style={{ fontWeight: 800 }}>Pregunta {qi + 1}</legend>
          <div className={styles.field}>
            <label htmlFor={`q-text-${qi}`}>Enunciado</label>
            <textarea id={`q-text-${qi}`} style={{ minHeight: 70 }} value={question.text} onChange={(e) => patch(qi, { text: e.target.value })} maxLength={3000} />
          </div>
          <div className={styles.twoColumns} style={{ marginTop: 12 }}>
            <div className={styles.field}>
              <label htmlFor={`q-kind-${qi}`}>Tipo</label>
              <select id={`q-kind-${qi}`} value={question.kind} onChange={(e) => changeKind(qi, e.target.value as AdminQuestion["kind"])}>
                {Object.entries(KIND_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor={`q-pts-${qi}`}>Puntos</label>
              <input id={`q-pts-${qi}`} type="number" min={1} max={100} value={question.points} onChange={(e) => patch(qi, { points: Math.max(1, Number(e.target.value) || 1) })} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <strong style={{ fontSize: ".86rem" }}>
              Opciones ({question.kind === "multiple" ? "marca todas las correctas" : "marca la correcta"})
            </strong>
            {question.options.map((option, oi) => (
              <div key={option.id ?? `o-${oi}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type={question.kind === "multiple" ? "checkbox" : "radio"}
                  name={`correct-${qi}`}
                  checked={option.is_correct}
                  aria-label={`Opción ${oi + 1} correcta`}
                  onChange={(e) => setOption(qi, oi, { is_correct: question.kind === "multiple" ? e.target.checked : true })}
                />
                <input
                  style={{ flex: 1, border: "1px solid #dcd5cb", borderRadius: 10, padding: "8px 10px" }}
                  value={option.text}
                  disabled={question.kind === "true_false"}
                  onChange={(e) => setOption(qi, oi, { text: e.target.value })}
                  placeholder={`Opción ${oi + 1}`}
                  maxLength={500}
                />
                {question.kind !== "true_false" && question.options.length > 2 && (
                  <button type="button" className={styles.secondaryButton} onClick={() => patch(qi, { options: question.options.filter((_, i) => i !== oi) })}>✕</button>
                )}
              </div>
            ))}
            {question.kind !== "true_false" && question.options.length < 12 && (
              <button type="button" className={styles.secondaryButton} style={{ justifySelf: "start" }} onClick={() => patch(qi, { options: [...question.options, { text: "", is_correct: false }] })}>
                + Agregar opción
              </button>
            )}
          </div>
          <div className={styles.field} style={{ marginTop: 12 }}>
            <label htmlFor={`q-exp-${qi}`}>Explicación interna (opcional, no se muestra al estudiante)</label>
            <input id={`q-exp-${qi}`} value={question.explanation ?? ""} onChange={(e) => patch(qi, { explanation: e.target.value })} maxLength={3000} />
          </div>
          <div className={styles.actions} style={{ justifyContent: "flex-start", marginTop: 12 }}>
            <button type="button" className={styles.secondaryButton} onClick={() => move(qi, -1)} disabled={qi === 0}>↑ Subir</button>
            <button type="button" className={styles.secondaryButton} onClick={() => move(qi, 1)} disabled={qi === items.length - 1}>↓ Bajar</button>
            <button type="button" className={styles.dangerButton} onClick={() => setItems(items.filter((_, i) => i !== qi))}>Eliminar pregunta</button>
          </div>
        </fieldset>
      ))}
      <div className={styles.actions} style={{ justifyContent: "flex-start" }}>
        <button type="button" className={styles.secondaryButton} onClick={() => setItems([...items, blankQuestion()])}>+ Agregar pregunta</button>
        <button type="button" className={styles.primaryButton} disabled={busy} onClick={save}>{busy ? "Guardando…" : "Guardar preguntas"}</button>
      </div>
    </div>
  );
}
