import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCampus } from "../../campus/CampusContext";
import { campusFileUrl } from "../../campus/files";
import { useCampusData } from "../../campus/useCampusData";
import { formatBytes, formatDuration, KIND_ICON, KIND_LABEL } from "../../components/campus/format";
import { ProgressBar } from "../../components/campus/ProgressBar";
import { QuizRunner } from "../../components/campus/QuizRunner";
import { VideoPlayer } from "../../components/campus/VideoPlayer";
import { ApiError } from "../../services/api";
import type { CampusCourseDetail, CampusLesson } from "../../types/campus";
import styles from "./Campus.module.css";

function Syllabus({ course, currentId }: { course: CampusCourseDetail; currentId: number }) {
  return (
    <aside className={styles.sidebar} aria-label="Temario del curso">
      <div className={styles.sidebarHead}>
        <strong>{course.title}</strong>
        <ProgressBar value={course.percent} label="Avance del curso" />
      </div>
      {course.modules.map((module, index) => (
        <section key={module.id} className={styles.module}>
          <h3>Módulo {index + 1}: {module.title}</h3>
          {module.lessons.map((lesson) => {
            const locked = lesson.state === "locked";
            const content = (
              <>
                <span className={`${styles.lessonIcon} ${lesson.state === "completed" ? styles.lessonIconDone : lesson.id === currentId ? styles.lessonIconNow : ""}`} aria-hidden="true">
                  {lesson.state === "completed" ? "✓" : locked ? "🔒" : KIND_ICON[lesson.kind]}
                </span>
                <span className={styles.lessonInfo}>
                  <strong>{lesson.title}</strong>
                  <small>{KIND_LABEL[lesson.kind]}{lesson.duration_seconds ? ` · ${formatDuration(lesson.duration_seconds)}` : ""}</small>
                </span>
              </>
            );
            return locked ? (
              <div key={lesson.id} className={`${styles.lessonRow} ${styles.lessonRowLocked}`} aria-disabled="true">{content}</div>
            ) : (
              <Link
                key={lesson.id}
                to={`/clases/leccion/${lesson.id}`}
                className={`${styles.lessonRow} ${lesson.id === currentId ? styles.currentRow : ""}`}
                aria-current={lesson.id === currentId ? "page" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </section>
      ))}
    </aside>
  );
}

export default function CampusLessonPage() {
  const { lessonId } = useParams();
  const id = Number(lessonId);
  const { request } = useCampus();
  const lesson = useCampusData<CampusLesson>(`/campus/lessons/${id}`);
  const courseId = lesson.data?.course_id;
  const course = useCampusData<CampusCourseDetail>(courseId ? `/campus/courses/${courseId}` : null);
  const [actionError, setActionError] = useState("");

  const { reload: reloadLesson } = lesson;
  const { reload: reloadCourse } = course;
  const refresh = useCallback(() => {
    void reloadLesson();
    void reloadCourse();
  }, [reloadLesson, reloadCourse]);

  const markRead = async () => {
    setActionError("");
    try {
      await request(`/campus/lessons/${id}/complete`, { method: "POST" });
      refresh();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "No se pudo marcar como leída");
    }
  };

  if (lesson.loading) return <p className={styles.status} role="status">Cargando lección…</p>;
  if (lesson.error || !lesson.data) {
    return (
      <div className={`${styles.wrap} ${styles.section}`}>
        <div className={styles.error} role="alert">{lesson.error || "Lección no disponible"}</div>
        <Link to="/clases" className={styles.ghost}>← Mis cursos</Link>
      </div>
    );
  }

  const data = lesson.data;
  const nextLocked = data.next_id !== null && data.next_state === "locked";

  return (
    <div className={`${styles.wrap} ${styles.section}`}>
      <Link to={`/clases/curso/${data.course_id}`} className={styles.back}>← {data.course_title}</Link>
      <div className={styles.lessonLayout}>
        <article>
          {data.kind === "video" && data.media_url && (
            <VideoPlayer
              key={data.id}
              lessonId={data.id}
              src={data.media_url}
              resumePosition={data.resume_position}
              initialPercent={data.watched_percent}
              threshold={data.threshold_percent}
              completed={data.completed}
              onCompleted={refresh}
            />
          )}
          {data.kind === "document" && data.media_url && (
            <>
              <iframe
                className={styles.docFrame}
                src={campusFileUrl(data.media_url)}
                title={data.title}
                onLoad={() => { if (!data.can_mark_complete && !data.completed) void reloadLesson(); }}
              />
              <div className={styles.panel}>
                {data.completed ? (
                  <div className={styles.success}>Documento marcado como leído.</div>
                ) : (
                  <button type="button" className={styles.primary} onClick={markRead} disabled={!data.can_mark_complete}>
                    Marcar como leído
                  </button>
                )}
              </div>
            </>
          )}
          {data.kind === "quiz" && data.quiz && (
            <div className={styles.panel} style={{ marginTop: 0 }}>
              <QuizRunner key={data.id} lessonId={data.id} quiz={data.quiz} onFinished={refresh} />
            </div>
          )}

          <p className={styles.crumbs} style={{ marginTop: 20 }}>{data.module_title} · {KIND_LABEL[data.kind]}</p>
          <h1 className={styles.lessonTitle} style={{ marginTop: 4 }}>{data.title}</h1>
          {data.description && <p className={styles.prose}>{data.description}</p>}
          {actionError && <div className={styles.error} role="alert">{actionError}</div>}

          {data.materials.length > 0 && (
            <div className={styles.panel}>
              <h3>Materiales de apoyo</h3>
              {data.materials.map((material) => (
                <a key={material.id} className={styles.materialLink} href={campusFileUrl(material.url)} download>
                  <span aria-hidden="true">⬇</span> {material.title}
                  <small style={{ color: "#6b726d", marginLeft: "auto" }}>{formatBytes(material.size)}</small>
                </a>
              ))}
            </div>
          )}

          <div className={styles.lessonNav}>
            {data.previous_id ? (
              <Link className={styles.ghost} to={`/clases/leccion/${data.previous_id}`}>← Anterior</Link>
            ) : <span />}
            {data.next_id && (
              nextLocked ? (
                <span className={styles.hint} role="status">
                  Completa esta lección para desbloquear la siguiente
                </span>
              ) : (
                <Link className={styles.primary} to={`/clases/leccion/${data.next_id}`}>Siguiente →</Link>
              )
            )}
          </div>
        </article>

        {course.data && <Syllabus course={course.data} currentId={data.id} />}
      </div>
    </div>
  );
}
