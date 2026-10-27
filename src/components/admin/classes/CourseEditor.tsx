import { useRef, useState } from "react";
import type { AdminCourse, AdminLesson, AdminModule } from "../../../types/campus";
import { formatBytes, formatDuration, KIND_LABEL } from "../../campus/format";
import { mediaUrl } from "../../../utils/mediaUrl";
import styles from "../AdminForms.module.css";
import { adminRequest, errorMessage, jsonBody, uploadWithProgress } from "./adminApi";
import { QuizEditor } from "./QuizEditor";

interface Props {
  token: string;
  course: AdminCourse;
  onChange: (course: AdminCourse) => void;
  onDeleted: () => void;
  onListChanged: () => void;
}

const STATUS_LABEL = { draft: "Borrador", published: "Publicado", archived: "Archivado" } as const;

export function CourseEditor({ token, course, onChange, onDeleted, onListChanged }: Props) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    cover_image: course.cover_image,
    completion_percent: course.completion_percent,
    sequential: course.sequential,
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const say = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const run = async <T,>(action: () => Promise<T>, ok?: string): Promise<T | undefined> => {
    setBusy(true);
    setProblems([]);
    try {
      const result = await action();
      if (ok) say(ok);
      return result;
    } catch (error) {
      const detail = (error as { message?: string }).message ?? "";
      say(errorMessage(error), true);
      if (detail.includes(" · ") || detail.startsWith("«")) setProblems(detail.split(" · "));
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  const apply = (next: AdminCourse | undefined) => {
    if (next) {
      onChange(next);
      onListChanged();
    }
  };

  const save = () =>
    run(async () => apply(await adminRequest<AdminCourse>(token, `/courses/${course.id}`, { method: "PUT", body: jsonBody(form) })), "Curso guardado.");

  const lifecycle = (action: "publish" | "archive" | "unpublish", ok: string) =>
    run(async () => apply(await adminRequest<AdminCourse>(token, `/courses/${course.id}/${action}`, { method: "POST" })), ok);

  const remove = async () => {
    if (!window.confirm(`¿Eliminar el curso «${course.title}»? Solo es posible si no tiene estudiantes asignados.`)) return;
    const done = await run(() => adminRequest(token, `/courses/${course.id}`, { method: "DELETE" }));
    if (done) onDeleted();
  };

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    await run(async () => {
      const data = await uploadWithProgress<{ url: string }>(token, "/media/cover", body, () => undefined);
      setForm((current) => ({ ...current, cover_image: data.url }));
    }, "Portada subida. Guarda el curso para aplicarla.");
  };

  const modules = course.modules ?? [];

  const addModule = () => {
    const title = window.prompt("Nombre del módulo");
    if (title && title.trim().length >= 2)
      void run(async () => apply(await adminRequest<AdminCourse>(token, `/courses/${course.id}/modules`, { method: "POST", body: jsonBody({ title: title.trim() }) })));
  };

  const renameModule = (module: AdminModule) => {
    const title = window.prompt("Nuevo nombre del módulo", module.title);
    if (title && title.trim().length >= 2)
      void run(async () => apply(await adminRequest<AdminCourse>(token, `/modules/${module.id}`, { method: "PUT", body: jsonBody({ title: title.trim(), description: module.description }) })));
  };

  const deleteModule = (module: AdminModule) => {
    if (window.confirm(`¿Eliminar el módulo «${module.title}» y todas sus lecciones?`))
      void run(async () => apply(await adminRequest<AdminCourse>(token, `/modules/${module.id}`, { method: "DELETE" })));
  };

  const reorder = (path: string, ids: number[]) =>
    run(async () => apply(await adminRequest<AdminCourse>(token, path, { method: "POST", body: jsonBody({ ids }) })));

  const moveModule = (index: number, delta: number) => {
    const ids = modules.map((m) => m.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void reorder(`/courses/${course.id}/modules/reorder`, ids);
  };

  const moveLesson = (module: AdminModule, index: number, delta: number) => {
    const ids = module.lessons.map((l) => l.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void reorder(`/modules/${module.id}/lessons/reorder`, ids);
  };

  const addLesson = (module: AdminModule) => {
    const title = window.prompt("Título de la lección");
    if (!title || title.trim().length < 2) return;
    const kindInput = window.prompt("Tipo de lección: video, documento o evaluación", "video")?.trim().toLowerCase();
    const kind = kindInput?.startsWith("doc") ? "document" : kindInput?.startsWith("eva") || kindInput === "quiz" ? "quiz" : "video";
    void run(async () => apply(await adminRequest<AdminCourse>(token, `/modules/${module.id}/lessons`, { method: "POST", body: jsonBody({ title: title.trim(), kind }) })));
  };

  const deleteLesson = (lesson: AdminLesson) => {
    if (window.confirm(`¿Eliminar la lección «${lesson.title}»?`))
      void run(async () => apply(await adminRequest<AdminCourse>(token, `/lessons/${lesson.id}`, { method: "DELETE" })));
  };

  return (
    <section className={styles.editor}>
      <div className={styles.editorHeader}>
        <div>
          <h2>{course.title}</h2>
          <p>
            {STATUS_LABEL[course.status]} · {course.lesson_count} lecciones · {course.enrolled_count} estudiantes asignados
          </p>
        </div>
        <div className={styles.actions}>
          {course.status !== "published" && <button className={styles.primaryButton} disabled={busy} onClick={() => lifecycle("publish", "Curso publicado.")}>Publicar</button>}
          {course.status === "published" && <button className={styles.secondaryButton} disabled={busy} onClick={() => lifecycle("unpublish", "Curso devuelto a borrador.")}>Despublicar</button>}
          {course.status !== "archived" && <button className={styles.secondaryButton} disabled={busy} onClick={() => lifecycle("archive", "Curso archivado.")}>Archivar</button>}
          <button className={styles.dangerButton} disabled={busy} onClick={remove}>Eliminar</button>
        </div>
      </div>

      <div className={styles.formGrid}>
        {message && <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>}
        {problems.length > 0 && (
          <ul className={styles.statusError} style={{ borderRadius: 12, padding: "10px 14px 10px 30px" }}>
            {problems.map((problem) => <li key={problem}>{problem}</li>)}
          </ul>
        )}

        <div className={styles.field}>
          <label htmlFor="c-title">Título</label>
          <input id="c-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} />
        </div>
        <div className={styles.field}>
          <label htmlFor="c-desc">Descripción</label>
          <textarea id="c-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={10000} />
        </div>
        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor="c-pct">% de video a ver para completar una lección</label>
            <input id="c-pct" type="number" min={50} max={100} value={form.completion_percent} onChange={(e) => setForm({ ...form, completion_percent: Math.min(100, Math.max(50, Number(e.target.value) || 95)) })} />
            <small>Predeterminado 95%. Cada lección puede tener su propio valor.</small>
          </div>
          <div className={styles.field}>
            <label htmlFor="c-cover">Portada</label>
            <input id="c-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadCover(e.target.files?.[0])} />
            {form.cover_image && <img src={mediaUrl(form.cover_image)} alt="Portada del curso" style={{ maxWidth: 220, borderRadius: 12 }} />}
          </div>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.sequential} onChange={(e) => setForm({ ...form, sequential: e.target.checked })} />
          Contenido secuencial: cada lección obligatoria se desbloquea al completar la anterior
        </label>
        <div><button className={styles.primaryButton} disabled={busy} onClick={save}>Guardar curso</button></div>

        <h3 style={{ marginTop: 18 }}>Contenido</h3>
        {modules.map((module, mi) => (
          <div key={module.id} className={styles.settingCard} style={{ margin: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ flex: 1, minWidth: 180 }}>Módulo {mi + 1}: {module.title}</strong>
              <button className={styles.secondaryButton} onClick={() => moveModule(mi, -1)} disabled={busy || mi === 0} aria-label="Subir módulo">↑</button>
              <button className={styles.secondaryButton} onClick={() => moveModule(mi, 1)} disabled={busy || mi === modules.length - 1} aria-label="Bajar módulo">↓</button>
              <button className={styles.secondaryButton} onClick={() => renameModule(module)} disabled={busy}>Renombrar</button>
              <button className={styles.dangerButton} onClick={() => deleteModule(module)} disabled={busy}>Eliminar</button>
            </div>
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              {module.lessons.map((lesson, li) => (
                <div key={lesson.id} style={{ border: "1px solid #eee7de", borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ flex: 1, minWidth: 180 }}>
                      <strong>{li + 1}. {lesson.title}</strong>
                      <br />
                      <small>
                        {KIND_LABEL[lesson.kind]}
                        {!lesson.required && " · opcional"}
                        {lesson.kind === "video" && (lesson.has_file ? ` · ${formatDuration(lesson.duration_seconds) || "duración pendiente"}` : " · sin video")}
                        {lesson.kind === "document" && (lesson.has_file ? " · PDF cargado" : " · sin PDF")}
                        {lesson.kind === "quiz" && ` · ${lesson.question_count} preguntas`}
                      </small>
                    </span>
                    <button className={styles.secondaryButton} onClick={() => moveLesson(module, li, -1)} disabled={busy || li === 0} aria-label="Subir lección">↑</button>
                    <button className={styles.secondaryButton} onClick={() => moveLesson(module, li, 1)} disabled={busy || li === module.lessons.length - 1} aria-label="Bajar lección">↓</button>
                    <button className={styles.secondaryButton} onClick={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)}>
                      {openLesson === lesson.id ? "Cerrar" : "Editar"}
                    </button>
                    <button className={styles.dangerButton} onClick={() => deleteLesson(lesson)} disabled={busy}>Eliminar</button>
                  </div>
                  {openLesson === lesson.id && (
                    <LessonPanel token={token} lesson={lesson} onCourse={apply} run={run} say={say} />
                  )}
                </div>
              ))}
              <div><button className={styles.secondaryButton} onClick={() => addLesson(module)} disabled={busy}>+ Agregar lección</button></div>
            </div>
          </div>
        ))}
        <div><button className={styles.secondaryButton} onClick={addModule} disabled={busy}>+ Agregar módulo</button></div>
      </div>
    </section>
  );
}

interface LessonPanelProps {
  token: string;
  lesson: AdminLesson;
  onCourse: (course: AdminCourse | undefined) => void;
  run: <T>(action: () => Promise<T>, ok?: string) => Promise<T | undefined>;
  say: (text: string, error?: boolean) => void;
}

function LessonPanel({ token, lesson, onCourse, run, say }: LessonPanelProps) {
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description ?? "",
    required: lesson.required,
    duration_seconds: lesson.duration_seconds ?? 0,
    completion_percent: lesson.completion_percent ?? 0,
    quiz_passing_score: lesson.quiz_passing_score,
    quiz_max_attempts: lesson.quiz_max_attempts ?? 0,
    quiz_shuffle: lesson.quiz_shuffle,
    quiz_show_feedback: lesson.quiz_show_feedback,
  });
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const materialRef = useRef<HTMLInputElement | null>(null);

  const save = () => {
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      required: form.required,
    };
    if (lesson.kind === "video") {
      if (form.duration_seconds > 0) payload.duration_seconds = form.duration_seconds;
      if (form.completion_percent >= 50) payload.completion_percent = form.completion_percent;
      else payload.clear_completion_percent = true;
    }
    if (lesson.kind === "quiz") {
      payload.quiz_passing_score = form.quiz_passing_score;
      payload.quiz_shuffle = form.quiz_shuffle;
      payload.quiz_show_feedback = form.quiz_show_feedback;
      if (form.quiz_max_attempts > 0) payload.quiz_max_attempts = form.quiz_max_attempts;
      else payload.quiz_unlimited_attempts = true;
    }
    void run(async () => onCourse(await adminRequest<AdminCourse>(token, `/lessons/${lesson.id}`, { method: "PUT", body: jsonBody(payload) })), "Lección guardada.");
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    if (lesson.kind === "video" && form.duration_seconds > 0) body.append("duration_seconds", String(form.duration_seconds));
    setProgress(0);
    void run(async () => {
      try {
        const result = await uploadWithProgress<AdminCourse>(token, `/lessons/${lesson.id}/file`, body, setProgress);
        onCourse(result);
        if (result.warning) say(result.warning, true);
      } finally {
        setProgress(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    }, "Archivo cargado.");
  };

  const uploadMaterial = (file: File | undefined) => {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    body.append("title", file.name);
    void run(async () => {
      onCourse(await uploadWithProgress<AdminCourse>(token, `/lessons/${lesson.id}/materials`, body, () => undefined));
      if (materialRef.current) materialRef.current.value = "";
    }, "Material agregado.");
  };

  const deleteMaterial = (id: number) =>
    void run(async () => onCourse(await adminRequest<AdminCourse>(token, `/materials/${id}`, { method: "DELETE" })), "Material eliminado.");

  return (
    <div className={styles.formGrid} style={{ marginTop: 14 }}>
      <div className={styles.twoColumns}>
        <div className={styles.field}>
          <label htmlFor={`l-title-${lesson.id}`}>Título</label>
          <input id={`l-title-${lesson.id}`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={200} />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", alignSelf: "end" }}>
          <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
          Obligatoria para completar el curso
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor={`l-desc-${lesson.id}`}>Descripción</label>
        <textarea id={`l-desc-${lesson.id}`} style={{ minHeight: 80 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={5000} />
      </div>

      {(lesson.kind === "video" || lesson.kind === "document") && (
        <div className={styles.field}>
          <label htmlFor={`l-file-${lesson.id}`}>{lesson.kind === "video" ? "Video (MP4 o WebM)" : "Documento (PDF)"}</label>
          <input
            id={`l-file-${lesson.id}`}
            ref={fileRef}
            type="file"
            accept={lesson.kind === "video" ? "video/mp4,video/webm" : "application/pdf"}
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {progress !== null && <progress max={100} value={progress}>{progress}%</progress>}
          {lesson.has_file && <small>Actual: {lesson.file_original_name} ({formatBytes(lesson.file_size ?? 0)}). Subir otro lo reemplaza.</small>}
        </div>
      )}

      {lesson.kind === "video" && (
        <div className={styles.twoColumns}>
          <div className={styles.field}>
            <label htmlFor={`l-dur-${lesson.id}`}>Duración en segundos</label>
            <input id={`l-dur-${lesson.id}`} type="number" min={0} value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) || 0 })} />
            <small>Se detecta sola en MP4. Indícala manualmente si el sistema no la detecta (p. ej. WebM).</small>
          </div>
          <div className={styles.field}>
            <label htmlFor={`l-pct-${lesson.id}`}>% a ver (vacío = el del curso)</label>
            <input id={`l-pct-${lesson.id}`} type="number" min={0} max={100} value={form.completion_percent} onChange={(e) => setForm({ ...form, completion_percent: Number(e.target.value) || 0 })} />
          </div>
        </div>
      )}

      {lesson.kind === "quiz" && (
        <>
          <div className={styles.threeColumns}>
            <div className={styles.field}>
              <label htmlFor={`l-pass-${lesson.id}`}>Nota mínima (%)</label>
              <input id={`l-pass-${lesson.id}`} type="number" min={1} max={100} value={form.quiz_passing_score} onChange={(e) => setForm({ ...form, quiz_passing_score: Math.min(100, Math.max(1, Number(e.target.value) || 70)) })} />
            </div>
            <div className={styles.field}>
              <label htmlFor={`l-att-${lesson.id}`}>Intentos máximos (0 = ilimitados)</label>
              <input id={`l-att-${lesson.id}`} type="number" min={0} max={100} value={form.quiz_max_attempts} onChange={(e) => setForm({ ...form, quiz_max_attempts: Math.max(0, Number(e.target.value) || 0) })} />
            </div>
            <div style={{ display: "grid", gap: 8, alignContent: "end" }}>
              <label><input type="checkbox" checked={form.quiz_shuffle} onChange={(e) => setForm({ ...form, quiz_shuffle: e.target.checked })} /> Mezclar preguntas</label>
              <label><input type="checkbox" checked={form.quiz_show_feedback} onChange={(e) => setForm({ ...form, quiz_show_feedback: e.target.checked })} /> Mostrar acierto/error por pregunta</label>
            </div>
          </div>
        </>
      )}

      <div><button className={styles.primaryButton} onClick={save}>Guardar lección</button></div>

      <div className={styles.field}>
        <label htmlFor={`l-mat-${lesson.id}`}>Materiales de apoyo (PDF, imágenes, DOCX, XLSX, PPTX, ZIP)</label>
        <input id={`l-mat-${lesson.id}`} ref={materialRef} type="file" onChange={(e) => uploadMaterial(e.target.files?.[0])} />
        {lesson.materials.map((material) => (
          <div key={material.id} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ flex: 1 }}>{material.original_name} <small>({formatBytes(material.size)})</small></span>
            <button className={styles.dangerButton} onClick={() => deleteMaterial(material.id)}>Quitar</button>
          </div>
        ))}
      </div>

      {lesson.kind === "quiz" && (
        <div>
          <h4>Preguntas</h4>
          <QuizEditor
            token={token}
            lessonId={lesson.id}
            onSaved={() => void adminRequest<AdminCourse>(token, `/lessons/${lesson.id}`, { method: "PUT", body: jsonBody({}) }).then(onCourse)}
          />
        </div>
      )}
    </div>
  );
}
