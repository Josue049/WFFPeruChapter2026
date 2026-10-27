import { useCallback, useEffect, useState } from "react";
import type { AdminCourse, AdminStudent, CourseProgressRow } from "../../../types/campus";
import { formatDate } from "../../campus/format";
import styles from "../AdminForms.module.css";
import { adminRequest, downloadFile, errorMessage } from "./adminApi";

export function ProgressPanel({ token }: { token: string }) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [rows, setRows] = useState<CourseProgressRow[]>([]);
  const [detail, setDetail] = useState<{ student: AdminStudent; courses: CourseProgressRow[] } | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminRequest<AdminCourse[]>(token, "/courses")
      .then((data) => {
        setCourses(data);
        if (data.length) setCourseId((current) => current ?? data[0].id);
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [token]);

  const loadRows = useCallback(async () => {
    if (!courseId) return;
    try {
      setRows(await adminRequest<CourseProgressRow[]>(token, `/courses/${courseId}/enrollments`));
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [token, courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRows();
    setDetail(null);
  }, [loadRows]);

  const openStudent = async (student: AdminStudent) => {
    try {
      setDetail(await adminRequest(token, `/students/${student.id}/progress`));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const revoke = async (row: CourseProgressRow) => {
    if (!window.confirm("¿Retirar el acceso a este curso? El historial se conserva.")) return;
    try {
      await adminRequest(token, `/enrollments/${row.enrollment_id}`, { method: "DELETE" });
      await loadRows();
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const course = courses.find((c) => c.id === courseId);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {message && <div className={`${styles.status} ${styles.statusError}`} role="alert">{message}</div>}
      <section className={styles.settingCard}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
          <div className={styles.field} style={{ flex: 1, minWidth: 220 }}>
            <label htmlFor="pr-course">Curso</label>
            <select id="pr-course" value={courseId ?? ""} onChange={(e) => setCourseId(Number(e.target.value))}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {course && (
            <button className={styles.secondaryButton} onClick={() => void downloadFile(token, `/courses/${course.id}/progress.csv`, `progreso-${course.slug}.csv`).catch((e) => setMessage(errorMessage(e)))}>
              Exportar CSV
            </button>
          )}
        </div>
      </section>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: 12 }}>Estudiante</th><th>Avance</th><th>Obligatorias</th><th>Nota promedio</th><th>Última actividad</th><th>Estado</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.enrollment_id} style={{ borderTop: "1px solid #eee7de", opacity: row.enrollment_status === "active" ? 1 : 0.55 }}>
                <td style={{ padding: 12 }}>
                  <button className={styles.listItem} style={{ padding: 0, width: "auto" }} onClick={() => row.student && void openStudent(row.student)}>
                    <strong>{row.student?.full_name}</strong><small>@{row.student?.username}</small>
                  </button>
                </td>
                <td style={{ minWidth: 140 }}>
                  <progress max={100} value={row.percent} aria-label={`Avance ${row.percent}%`} /> {row.percent}%
                </td>
                <td>{row.completed_required}/{row.total_required}</td>
                <td>{row.average_quiz_score !== null ? `${row.average_quiz_score}%` : "—"}</td>
                <td>{formatDate(row.last_activity)}</td>
                <td>{row.enrollment_status !== "active" ? "Acceso retirado" : row.completed_at ? "Completado" : "En curso"}</td>
                <td>{row.enrollment_status === "active" && <button className={styles.dangerButton} onClick={() => void revoke(row)}>Retirar acceso</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className={styles.empty}>Este curso aún no tiene estudiantes asignados.</p>}
      </div>

      {detail && (
        <section className={styles.settingCard}>
          <h3>{detail.student.full_name} <small>@{detail.student.username}</small></h3>
          {detail.courses.map((item) => (
            <div key={item.enrollment_id} style={{ marginTop: 16 }}>
              <strong>{item.course_title}</strong> — {item.percent}% ({item.completed_required}/{item.total_required} obligatorias)
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                  <thead><tr style={{ textAlign: "left" }}><th>Lección</th><th>Tipo</th><th>Visto</th><th>Intentos</th><th>Mejor nota</th><th>Completada</th></tr></thead>
                  <tbody>
                    {item.lessons?.map((lesson) => (
                      <tr key={lesson.id} style={{ borderTop: "1px solid #eee7de" }}>
                        <td style={{ padding: "8px 0" }}>{lesson.title}{!lesson.required && " (opcional)"}</td>
                        <td>{lesson.kind === "video" ? "Video" : lesson.kind === "quiz" ? "Evaluación" : "Documento"}</td>
                        <td>{lesson.watched_percent !== null ? `${lesson.watched_percent}%` : "—"}</td>
                        <td>{lesson.kind === "quiz" ? lesson.attempts : "—"}</td>
                        <td>{lesson.best_score !== null ? `${Math.round(lesson.best_score)}%${lesson.passed ? " ✓" : ""}` : "—"}</td>
                        <td>{lesson.completed ? formatDate(lesson.completed_at) : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
