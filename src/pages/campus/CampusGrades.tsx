import { Link } from "react-router-dom";
import { useCampusData } from "../../campus/useCampusData";
import { formatDate } from "../../components/campus/format";
import type { GradeItem } from "../../types/campus";
import styles from "./Campus.module.css";

export default function CampusGrades() {
  const { data, loading, error } = useCampusData<GradeItem[]>("/campus/grades");

  return (
    <div className={`${styles.wrap} ${styles.section}`}>
      <div className={styles.sectionHead}>
        <div>
          <h1>Mis notas</h1>
          <p>Resultados de tus evaluaciones y número de intentos.</p>
        </div>
      </div>
      {loading && <p className={styles.status} role="status">Cargando notas…</p>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {!loading && !error && data?.length === 0 && (
        <p className={styles.status}>Todavía no has rendido evaluaciones.</p>
      )}
      {data && data.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Evaluación</th>
                <th>Mejor nota</th>
                <th>Nota mínima</th>
                <th>Intentos</th>
                <th>Último intento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.lesson_id}>
                  <td><Link to={`/clases/curso/${item.course_id}`}>{item.course_title}</Link></td>
                  <td><Link to={`/clases/leccion/${item.lesson_id}`}>{item.lesson_title}</Link></td>
                  <td><strong>{Math.round(item.best_score)}%</strong></td>
                  <td>{item.passing_score}%</td>
                  <td>{item.attempts.length}</td>
                  <td>{formatDate(item.attempts[item.attempts.length - 1]?.submitted_at)}</td>
                  <td>
                    <span className={`${styles.badge} ${item.passed ? styles.badgeDone : ""}`}>
                      {item.passed ? "Aprobado" : "No aprobado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
