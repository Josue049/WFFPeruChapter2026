import { Link, useParams } from "react-router-dom";
import { useCampusData } from "../../campus/useCampusData";
import { formatDuration, KIND_ICON, KIND_LABEL } from "../../components/campus/format";
import { ProgressBar } from "../../components/campus/ProgressBar";
import type { CampusCourseDetail } from "../../types/campus";
import styles from "./Campus.module.css";

export default function CampusCourse() {
  const { courseId } = useParams();
  const { data, loading, error } = useCampusData<CampusCourseDetail>(`/campus/courses/${Number(courseId)}`);

  if (loading) return <p className={styles.status} role="status">Cargando curso…</p>;
  if (error || !data) {
    return (
      <div className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.error} role="alert">{error || "Curso no encontrado"}</div>
        <Link to="/clases" className={styles.ghost}>← Mis cursos</Link>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} ${styles.section}`}>
      <Link to="/clases" className={styles.back}>← Mis cursos</Link>
      <div className={styles.courseHero}>
        <h1>{data.title}</h1>
        {data.description && <p>{data.description}</p>}
        <ProgressBar value={data.percent} label="Avance del curso" />
        <div className={styles.meta}>
          <span>{data.percent}% completado</span>
          {data.completed_at && <span className={`${styles.badge} ${styles.badgeDone}`}>Curso completado</span>}
        </div>
        {data.continue_lesson_id && (
          <div>
            <Link className={styles.primary} to={`/clases/leccion/${data.continue_lesson_id}`}>
              {data.percent ? "Continuar" : "Comenzar curso"} →
            </Link>
          </div>
        )}
      </div>

      {data.modules.map((module, index) => (
        <section key={module.id} className={styles.module}>
          <h3>
            <span>Módulo {index + 1}: {module.title}</span>
            <span>{module.lessons.filter((l) => l.state === "completed").length}/{module.lessons.length}</span>
          </h3>
          {module.lessons.map((lesson) => {
            const locked = lesson.state === "locked";
            const content = (
              <>
                <span className={`${styles.lessonIcon} ${lesson.state === "completed" ? styles.lessonIconDone : ""}`} aria-hidden="true">
                  {lesson.state === "completed" ? "✓" : locked ? "🔒" : KIND_ICON[lesson.kind]}
                </span>
                <span className={styles.lessonInfo}>
                  <strong>{lesson.title}</strong>
                  <small>
                    {KIND_LABEL[lesson.kind]}
                    {lesson.duration_seconds ? ` · ${formatDuration(lesson.duration_seconds)}` : ""}
                    {!lesson.required ? " · Opcional" : ""}
                    {lesson.best_score !== null ? ` · Mejor nota ${Math.round(lesson.best_score)}%` : ""}
                    {locked ? " · Se desbloquea al completar la lección anterior" : ""}
                  </small>
                </span>
                {lesson.kind === "video" && lesson.state !== "completed" && lesson.watched_percent > 0 && (
                  <span className={styles.badge}>{lesson.watched_percent}%</span>
                )}
              </>
            );
            return locked ? (
              <div key={lesson.id} className={`${styles.lessonRow} ${styles.lessonRowLocked}`} aria-disabled="true">{content}</div>
            ) : (
              <Link key={lesson.id} to={`/clases/leccion/${lesson.id}`} className={styles.lessonRow}>{content}</Link>
            );
          })}
        </section>
      ))}
    </div>
  );
}
