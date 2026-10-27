import { useCallback, useEffect, useState } from "react";
import type { AdminCourse, AdminStudent } from "../../../types/campus";
import { formatDate } from "../../campus/format";
import styles from "../AdminForms.module.css";
import { adminRequest, errorMessage, jsonBody } from "./adminApi";

interface Credential {
  full_name: string;
  username?: string;
  email?: string | null;
  temporary_password?: string;
  error?: string;
}

/** Evita que Excel interprete una celda como fórmula al abrir el CSV. */
const csvCell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;

function parseCsv(text: string): { full_name: string; email?: string; username?: string }[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const split = (line: string) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = header.some((h) => ["nombre", "name", "full_name", "correo", "email", "usuario", "username"].includes(h));
  const index = (names: string[]) => header.findIndex((h) => names.includes(h));
  const nameIdx = hasHeader ? index(["nombre", "name", "full_name", "nombre completo"]) : 0;
  const emailIdx = hasHeader ? index(["correo", "email", "mail"]) : 1;
  const userIdx = hasHeader ? index(["usuario", "username", "user"]) : 2;
  return lines.slice(hasHeader ? 1 : 0).map((line) => {
    const cells = split(line);
    return {
      full_name: cells[nameIdx] ?? "",
      email: (emailIdx >= 0 && cells[emailIdx]) || undefined,
      username: (userIdx >= 0 && cells[userIdx]) || undefined,
    };
  }).filter((row) => row.full_name);
}

export function StudentsPanel({ token }: { token: string }) {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [credentials, setCredentials] = useState<Credential[] | null>(null);
  const [mode, setMode] = useState<"none" | "create" | "import">("none");
  const [form, setForm] = useState({ full_name: "", username: "", email: "", course_ids: [] as number[] });
  const [csvText, setCsvText] = useState("");
  const [importCourses, setImportCourses] = useState<number[]>([]);
  const [assignFor, setAssignFor] = useState<AdminStudent | null>(null);
  const [assignIds, setAssignIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);

  const say = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    try {
      setStudents(await adminRequest<AdminStudent[]>(token, `/students?${params.toString()}`));
    } catch (error) {
      say(errorMessage(error), true);
    }
  }, [token, search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    adminRequest<AdminCourse[]>(token, "/courses").then((data) => setCourses(data.filter((c) => c.status !== "archived"))).catch(() => undefined);
  }, [token]);

  const toggleId = (list: number[], id: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const act = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      say(errorMessage(error), true);
    } finally {
      setBusy(false);
    }
  };

  const create = () =>
    act(async () => {
      const created = await adminRequest<AdminStudent>(token, "/students", {
        method: "POST",
        body: jsonBody({ ...form, email: form.email.trim() || null }),
      });
      setCredentials([{ full_name: created.full_name, username: created.username, email: created.email, temporary_password: created.temporary_password }]);
      setForm({ full_name: "", username: "", email: "", course_ids: [] });
      setMode("none");
      say("Cuenta creada. Entrega las credenciales al estudiante; la contraseña no se vuelve a mostrar.");
      await load();
    });

  const importRows = () =>
    act(async () => {
      const rows = parseCsv(csvText);
      if (!rows.length) return say("No se encontraron filas válidas. Usa columnas: nombre, correo, usuario (opcional).", true);
      const result = await adminRequest<{ created: number; credentials: Credential[] }>(token, "/students/import", {
        method: "POST",
        body: jsonBody({ rows, course_ids: importCourses }),
      });
      setCredentials(result.credentials);
      setCsvText("");
      setMode("none");
      say(`${result.created} cuentas creadas.`);
      await load();
    });

  const resetPassword = (student: AdminStudent) =>
    act(async () => {
      if (!window.confirm(`¿Restablecer la contraseña de ${student.full_name}? Se cerrará su sesión.`)) return;
      const result = await adminRequest<{ username: string; temporary_password: string }>(token, `/students/${student.id}/reset-password`, { method: "POST" });
      setCredentials([{ full_name: student.full_name, username: result.username, email: student.email, temporary_password: result.temporary_password }]);
      say("Contraseña restablecida.");
      await load();
    });

  const setActive = (student: AdminStudent, is_active: boolean) =>
    act(async () => {
      await adminRequest(token, `/students/${student.id}`, { method: "PUT", body: jsonBody({ is_active }) });
      say(is_active ? "Cuenta reactivada." : "Cuenta suspendida y sesiones cerradas.");
      await load();
    });

  const assign = () =>
    act(async () => {
      if (!assignFor) return;
      for (const courseId of assignIds) {
        await adminRequest(token, `/courses/${courseId}/enrollments`, { method: "POST", body: jsonBody({ student_ids: [assignFor.id] }) });
      }
      say("Cursos asignados.");
      setAssignFor(null);
      setAssignIds([]);
      await load();
    });

  const downloadCredentials = () => {
    if (!credentials) return;
    const rows = [["Nombre", "Usuario", "Correo", "Contraseña temporal", "Observación"], ...credentials.map((c) => [c.full_name, c.username ?? "", c.email ?? "", c.temporary_password ?? "", c.error ?? ""])];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "credenciales-campus.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const CoursePicker = ({ value, onToggle }: { value: number[]; onToggle: (id: number) => void }) => (
    <div className={styles.field}>
      <label>Asignar a cursos</label>
      {courses.length === 0 && <small>Aún no hay cursos.</small>}
      {courses.map((course) => (
        <label key={course.id} style={{ display: "flex", gap: 8, fontWeight: 400 }}>
          <input type="checkbox" checked={value.includes(course.id)} onChange={() => onToggle(course.id)} />
          {course.title} <small>({course.status === "published" ? "publicado" : "borrador"})</small>
        </label>
      ))}
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {message && <div className={`${styles.status} ${isError ? styles.statusError : ""}`} role="status">{message}</div>}

      {credentials && (
        <section className={styles.settingCard} aria-live="polite">
          <h3>Credenciales generadas</h3>
          <p>Guárdalas ahora: las contraseñas temporales <strong>no se vuelven a mostrar</strong>. Cada estudiante deberá cambiarla en su primer ingreso.</p>
          <div className={styles.tableWrap ?? ""} style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th align="left">Nombre</th><th align="left">Usuario</th><th align="left">Contraseña temporal</th></tr></thead>
              <tbody>
                {credentials.map((c, i) => (
                  <tr key={i}>
                    <td>{c.full_name}</td>
                    <td>{c.username ?? "—"}</td>
                    <td><code>{c.temporary_password ?? c.error}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.actions} style={{ justifyContent: "flex-start", marginTop: 12 }}>
            <button className={styles.primaryButton} onClick={downloadCredentials}>Descargar CSV</button>
            <button className={styles.secondaryButton} onClick={() => setCredentials(null)}>Ya las guardé</button>
          </div>
        </section>
      )}

      <section className={styles.settingCard}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input className={styles.search} style={{ flex: 1, minWidth: 200, margin: 0, width: "auto" }} placeholder="Buscar por nombre, usuario o correo" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select aria-label="Estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="suspended">Suspendidos</option>
          </select>
          <button className={styles.primaryButton} onClick={() => setMode(mode === "create" ? "none" : "create")}>+ Nuevo estudiante</button>
          <button className={styles.secondaryButton} onClick={() => setMode(mode === "import" ? "none" : "import")}>Importar CSV</button>
        </div>

        {mode === "create" && (
          <div className={styles.formGrid}>
            <div className={styles.twoColumns}>
              <div className={styles.field}>
                <label htmlFor="s-name">Nombre completo</label>
                <input id="s-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={160} />
              </div>
              <div className={styles.field}>
                <label htmlFor="s-user">Usuario</label>
                <input id="s-user" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.replace(/[^A-Za-z0-9._-]/g, "") })} maxLength={100} />
                <small>Letras, números, punto, guion y guion bajo (mínimo 3).</small>
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="s-email">Correo (opcional, necesario para recuperar la contraseña)</label>
              <input id="s-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={320} />
            </div>
            <CoursePicker value={form.course_ids} onToggle={(id) => setForm({ ...form, course_ids: toggleId(form.course_ids, id) })} />
            <div><button className={styles.primaryButton} disabled={busy || form.full_name.trim().length < 2 || form.username.length < 3} onClick={create}>Crear y generar contraseña temporal</button></div>
          </div>
        )}

        {mode === "import" && (
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="s-csv">Pega el contenido del CSV (nombre, correo, usuario opcional)</label>
              <textarea id="s-csv" value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder={"nombre,correo\nMaría Quispe,maria@correo.com"} />
              <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => e.target.files?.[0]?.text().then(setCsvText)} />
              <small>{parseCsv(csvText).length} filas detectadas (máximo 500).</small>
            </div>
            <CoursePicker value={importCourses} onToggle={(id) => setImportCourses(toggleId(importCourses, id))} />
            <div><button className={styles.primaryButton} disabled={busy || !csvText.trim()} onClick={importRows}>Importar y generar credenciales</button></div>
          </div>
        )}
      </section>

      {assignFor && (
        <section className={styles.settingCard}>
          <h3>Asignar cursos a {assignFor.full_name}</h3>
          <CoursePicker value={assignIds} onToggle={(id) => setAssignIds(toggleId(assignIds, id))} />
          <div className={styles.actions} style={{ justifyContent: "flex-start" }}>
            <button className={styles.primaryButton} disabled={busy || !assignIds.length} onClick={assign}>Asignar</button>
            <button className={styles.secondaryButton} onClick={() => setAssignFor(null)}>Cancelar</button>
          </div>
        </section>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 14 }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={{ padding: 12 }}>Estudiante</th><th>Usuario</th><th>Cursos</th><th>Último ingreso</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderTop: "1px solid #eee7de" }}>
                <td style={{ padding: 12 }}><strong>{student.full_name}</strong><br /><small>{student.email ?? "sin correo"}</small></td>
                <td>{student.username}</td>
                <td>{student.course_count}</td>
                <td>{formatDate(student.last_login_at)}</td>
                <td>
                  <span className={styles.userBadge + " " + (student.is_active ? "" : styles.userBadgeOff)}>
                    {student.is_active ? (student.locked ? "Bloqueado" : student.must_change_password ? "Pendiente de activar" : "Activo") : "Suspendido"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions} style={{ justifyContent: "flex-start" }}>
                    <button className={styles.secondaryButton} onClick={() => { setAssignFor(student); setAssignIds([]); }}>Asignar</button>
                    <button className={styles.secondaryButton} disabled={busy} onClick={() => resetPassword(student)}>Restablecer clave</button>
                    {student.is_active
                      ? <button className={styles.dangerButton} disabled={busy} onClick={() => setActive(student, false)}>Suspender</button>
                      : <button className={styles.secondaryButton} disabled={busy} onClick={() => setActive(student, true)}>Reactivar</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className={styles.empty}>No hay estudiantes con esos filtros.</p>}
      </div>
    </div>
  );
}
