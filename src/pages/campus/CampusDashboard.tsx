import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCampusData } from "../../campus/useCampusData";
import { ProgressBar } from "../../components/campus/ProgressBar";
import { mediaUrl } from "../../utils/mediaUrl";
import type { CampusCourseSummary } from "../../types/campus";
import styles from "./Campus.module.css";

type Filter = "all" | "in_progress" | "completed";

export default function CampusDashboard() {
  const { data, loading, error } = useCampusData<CampusCourseSummary[]>("/campus/courses");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (!data) return [];
    if (filter === "completed") return data.filter((c) => c.state === "completed");
    if (filter === "in_progress") return data.filter((c) => c.state !== "completed");
    return data;
  }, [data, filter]);

  const resume = data?.find((c) => c.state === "in_progress" && c.continue_lesson_id) ??
    data?.find((c) => c.state === "not_started" && c.continue_lesson_id);

  return (
    <div className={`${styles.wrap} ${styles.section}`}>
      <div className={styles.sectionHead}>
        <div>
          <h1>Mis cursos</h1>
          <p>Continúa donde lo dejaste y revisa tu avance.</p>
        </div>
        <div className={styles.tabs} role="group" aria-label="Filtrar cursos">
          {([["all", "Todos"], ["in_progress", "En curso"], ["completed", "Completados"]] as const).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>

      {loading && <p className={styles.status} role="status">Cargando tus cursos…</p>}
      {error && <div className={styles.error} role="alert">{error}</div>}

      {resume && filter !== "completed" && (
        <div className={styles.resume}>
          <div className={styles.grow}>
            <small>Continuar donde quedaste</small>
            <h2>{resume.title}</h2>
            <ProgressBar value={resume.percent} label={`Avance de ${resume.title}`} />
          </div>
          <Link className={styles.primary} to={`/clases/leccion/${resume.continue_lesson_id}`}>
            {resume.state === "not_started" ? "Comenzar" : "Continuar"} →
          </Link>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <p className={styles.status}>
          {data?.length ? "No hay cursos en esta categoría." : "Aún no tienes cursos asignados. El equipo del WFF te los asignará pronto."}
        </p>
      )}

      <div className={styles.grid}>
        {visible.map((course) => (
          <Link key={course.id} to={`/clases/curso/${course.id}`} className={styles.card}>
            {course.cover_image ? (
              <img className={styles.cover} src={mediaUrl(course.cover_image)} alt="" loading="lazy" />
            ) : (
              <div className={styles.coverFallback} aria-hidden="true">{course.title.slice(0, 1)}</div>
            )}
            <div className={styles.cardBody}>
              <span className={`${styles.badge} ${course.state === "completed" ? styles.badgeDone : ""}`} style={{ justifySelf: "start" }}>
                {course.state === "completed" ? "Completado" : course.state === "in_progress" ? "En curso" : "Nuevo"}
              </span>
              <h3>{course.title}</h3>
              {course.description && <p>{course.description}</p>}
              <ProgressBar value={course.percent} label={`Avance de ${course.title}`} />
              <div className={styles.meta}>
                <span>{course.percent}% completado</span>
                <span>{course.completed_lessons}/{course.total_lessons} lecciones</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
