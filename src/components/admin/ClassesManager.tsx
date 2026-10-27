import { useCallback, useEffect, useState } from "react";
import type { AdminCourse } from "../../types/campus";
import styles from "./AdminForms.module.css";
import { adminRequest, errorMessage, jsonBody } from "./classes/adminApi";
import { CourseEditor } from "./classes/CourseEditor";
import { ProgressPanel } from "./classes/ProgressPanel";
import { StudentsPanel } from "./classes/StudentsPanel";

type Tab = "courses" | "students" | "progress";

const STATUS_LABEL = { draft: "Borrador", published: "Publicado", archived: "Archivado" } as const;

function CoursesPanel({ token }: { token: string }) {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [selected, setSelected] = useState<AdminCourse | null>(null);
  const [filter, setFilter] = useState<"all" | AdminCourse["status"]>("all");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setCourses(await adminRequest<AdminCourse[]>(token, "/courses"));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const open = async (id: number) => {
    try {
      setSelected(await adminRequest<AdminCourse>(token, `/courses/${id}`));
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const create = async () => {
    const title = window.prompt("Título del nuevo curso");
    if (!title || title.trim().length < 3) return;
    try {
      const course = await adminRequest<AdminCourse>(token, "/courses", { method: "POST", body: jsonBody({ title: title.trim() }) });
      await load();
      setSelected(course);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };

  const visible = courses.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}>
          <h2>Cursos</h2>
          <button className={styles.newButton} onClick={create}>+ Nuevo curso</button>
        </div>
        <div className={styles.submissionFilters}>
          {(["all", "draft", "published", "archived"] as const).map((key) => (
            <button key={key} className={filter === key ? styles.filterActive : ""} onClick={() => setFilter(key)}>
              {key === "all" ? "Todos" : STATUS_LABEL[key]}
            </button>
          ))}
        </div>
        {message && <div className={`${styles.status} ${styles.statusError}`} style={{ margin: "0 16px 12px" }} role="alert">{message}</div>}
        <div className={styles.itemList}>
          {visible.map((course) => (
            <button key={course.id} className={`${styles.listItem} ${selected?.id === course.id ? styles.listItemActive : ""}`} onClick={() => void open(course.id)}>
              <strong>{course.title}</strong>
              <span>{STATUS_LABEL[course.status]} · {course.lesson_count} lecciones</span>
              <small>{course.enrolled_count} estudiantes</small>
            </button>
          ))}
          {visible.length === 0 && <p className={styles.empty}>No hay cursos todavía.</p>}
        </div>
      </aside>
      {selected ? (
        <CourseEditor
          key={selected.id}
          token={token}
          course={selected}
          onChange={setSelected}
          onListChanged={() => void load()}
          onDeleted={() => {
            setSelected(null);
            void load();
          }}
        />
      ) : (
        <section className={styles.editor}>
          <div className={styles.emptyEditor}>
            <strong>Gestiona tus cursos</strong>
            <p>Crea un curso, agrega módulos y lecciones (video, PDF o evaluación), publícalo y asígnalo a tus estudiantes.</p>
          </div>
        </section>
      )}
    </div>
  );
}

export function ClassesManager({ token }: { token: string }) {
  const [tab, setTab] = useState<Tab>("courses");
  const tabs: [Tab, string][] = [["courses", "Cursos"], ["students", "Estudiantes"], ["progress", "Seguimiento"]];
  return (
    <>
      <div className={styles.managerTabs} role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? styles.managerTabActive : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "courses" && <CoursesPanel token={token} />}
      {tab === "students" && <StudentsPanel token={token} />}
      {tab === "progress" && <ProgressPanel token={token} />}
    </>
  );
}
