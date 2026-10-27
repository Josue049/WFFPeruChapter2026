import { useState } from "react";
import { useCampus } from "../../campus/CampusContext";
import styles from "../../pages/campus/Campus.module.css";
import type { QuizInfo, QuizQuestionPublic, QuizResult } from "../../types/campus";
import { ApiError } from "../../services/api";
import { formatDate } from "./format";

interface Props {
  lessonId: number;
  quiz: QuizInfo;
  onFinished: () => void;
}

interface StartResponse {
  attempt_id: number;
  questions: QuizQuestionPublic[];
}

export function QuizRunner({ lessonId, quiz, onFinished }: Props) {
  const { request } = useCampus();
  const [attempt, setAttempt] = useState<StartResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const blocked = quiz.attempts_left === 0 && !quiz.has_open_attempt;

  const start = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const data = await request<StartResponse>(`/campus/lessons/${lessonId}/quiz/start`, { method: "POST" });
      setAnswers({});
      setAttempt(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo iniciar la evaluación");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (question: QuizQuestionPublic, optionId: number) => {
    setAnswers((current) => {
      const selected = current[question.id] ?? [];
      if (question.kind === "multiple") {
        return {
          ...current,
          [question.id]: selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId],
        };
      }
      return { ...current, [question.id]: [optionId] };
    });
  };

  const unanswered = attempt ? attempt.questions.filter((q) => !answers[q.id]?.length).length : 0;

  const submit = async () => {
    if (!attempt) return;
    if (unanswered && !window.confirm(`Tienes ${unanswered} pregunta(s) sin responder. ¿Enviar de todos modos?`)) return;
    setBusy(true);
    setError("");
    try {
      const data = await request<QuizResult>(`/campus/attempts/${attempt.attempt_id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(data);
      setAttempt(null);
      onFinished();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo enviar la evaluación");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className={styles.result} role="status">
        <p className={`${styles.resultScore} ${result.passed ? styles.resultPass : styles.resultFail}`}>
          {Math.round(result.score_percent)}%
        </p>
        <h3>{result.passed ? "¡Aprobaste la evaluación!" : "No alcanzaste la nota mínima"}</h3>
        <p>
          Nota mínima: {result.passing_score}% · Puntos: {result.points_earned}/{result.points_total}
          {result.attempts_left !== null && ` · Intentos restantes: ${result.attempts_left}`}
        </p>
        {!result.passed && result.attempts_left !== 0 && (
          <button type="button" className={styles.primary} onClick={start} disabled={busy}>
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  }

  if (attempt) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {attempt.questions.map((question, index) => (
          <fieldset key={question.id} className={styles.question}>
            <legend>
              {index + 1}. {question.text}
            </legend>
            <small>
              {question.kind === "multiple" ? "Selecciona todas las correctas" : "Selecciona una opción"} · {question.points} pt
            </small>
            {question.options.map((option) => {
              const checked = answers[question.id]?.includes(option.id) ?? false;
              return (
                <label key={option.id} className={`${styles.option} ${checked ? styles.optionOn : ""}`}>
                  <input
                    type={question.kind === "multiple" ? "checkbox" : "radio"}
                    name={`q-${question.id}`}
                    checked={checked}
                    onChange={() => toggle(question, option.id)}
                  />
                  <span>{option.text}</span>
                </label>
              );
            })}
          </fieldset>
        ))}
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.primary} disabled={busy}>
          {busy ? "Enviando…" : "Enviar evaluación"}
        </button>
      </form>
    );
  }

  return (
    <div className={styles.quizIntro}>
      <div className={styles.stats}>
        <div className={styles.stat}><b>{quiz.question_count}</b><span>Preguntas</span></div>
        <div className={styles.stat}><b>{quiz.passing_score}%</b><span>Nota mínima</span></div>
        <div className={styles.stat}>
          <b>{quiz.attempts_left === null ? "∞" : `${quiz.attempts_left}`}</b>
          <span>Intentos restantes</span>
        </div>
        <div className={styles.stat}><b>{quiz.best_score === null ? "—" : `${Math.round(quiz.best_score)}%`}</b><span>Mejor nota</span></div>
      </div>
      {quiz.passed && <div className={styles.success}>Ya aprobaste esta evaluación.</div>}
      {error && <div className={styles.error}>{error}</div>}
      {blocked ? (
        <div className={styles.error}>Ya usaste todos tus intentos. Contacta al equipo si necesitas ayuda.</div>
      ) : (
        <div>
          <button type="button" className={styles.primary} onClick={start} disabled={busy}>
            {quiz.has_open_attempt ? "Retomar intento" : quiz.attempts_used ? "Nuevo intento" : "Comenzar evaluación"}
          </button>
        </div>
      )}
      {quiz.attempts.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Intento</th><th>Fecha</th><th>Nota</th><th>Resultado</th></tr>
            </thead>
            <tbody>
              {quiz.attempts.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{formatDate(item.submitted_at)}</td>
                  <td>{Math.round(item.score_percent)}%</td>
                  <td>{item.passed ? "Aprobado" : "No aprobado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
