import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUser } from "../../types";
import { apiRequest } from "../../services/api";
import styles from "./AdminForms.module.css";

type Role = "administrator" | "editor" | "custom";
interface UserForm {
  username: string;
  display_name: string;
  password: string;
  role: Role;
  is_active: boolean;
  manage_articles: boolean;
  manage_milestones: boolean;
  manage_volunteers: boolean;
  manage_users: boolean;
}

const emptyUser = (): UserForm => ({
  username: "", display_name: "", password: "", role: "editor", is_active: true,
  manage_articles: true, manage_milestones: true, manage_volunteers: true, manage_users: false,
});

export function UsersManager({ token, currentUserId }: { token: string; currentUserId: number }) {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyUser());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setItems(await apiRequest<AdminUser[]>("/admin-users", {}, { token, redirectOnUnauthorized: true }));
  }, [token]);
  useEffect(() => {
    let cancelled = false;

    void apiRequest<AdminUser[]>("/admin-users", {}, { token, redirectOnUnauthorized: true })
      .then((data) => {
        if (!cancelled) setItems(data);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = useMemo(() => items.filter((item) => `${item.display_name} ${item.username}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const select = (item: AdminUser) => {
    setSelectedId(item.id);
    setForm({
      username: item.username,
      display_name: item.display_name,
      password: "",
      role: (item.role as Role) || "custom",
      is_active: item.is_active,
      manage_articles: item.manage_articles,
      manage_milestones: item.manage_milestones,
      manage_volunteers: item.manage_volunteers,
      manage_users: item.manage_users,
    });
    setMessage("");
  };

  const setRole = (role: Role) => {
    if (role === "administrator") setForm({ ...form, role, manage_articles: true, manage_milestones: true, manage_volunteers: true, manage_users: true });
    else if (role === "editor") setForm({ ...form, role, manage_articles: true, manage_milestones: true, manage_volunteers: true, manage_users: false });
    else setForm({ ...form, role });
  };

  const save = async () => {
    try {
      const payload = selectedId
        ? {
            display_name: form.display_name,
            role: form.role,
            is_active: form.is_active,
            manage_articles: form.manage_articles,
            manage_milestones: form.manage_milestones,
            manage_volunteers: form.manage_volunteers,
            manage_users: form.manage_users,
            ...(form.password ? { password: form.password } : {}),
          }
        : form;
      const result = await apiRequest<AdminUser>(
        selectedId ? `/admin-users/${selectedId}` : "/admin-users",
        { method: selectedId ? "PUT" : "POST", body: JSON.stringify(payload) },
        { token, redirectOnUnauthorized: true },
      );
      select(result); await load(); setMessage(selectedId ? "Acceso actualizado. Las sesiones anteriores fueron invalidadas si cambiaste permisos o contraseña." : "Acceso creado. Comparte la contraseña por un canal seguro.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar"); }
  };

  const generatePassword = () => {
    const groups = [
      "ABCDEFGHJKLMNPQRSTUVWXYZ",
      "abcdefghijkmnopqrstuvwxyz",
      "23456789",
      "!@#$%*-_",
    ];
    const all = groups.join("");
    const randomIndex = (length: number) => {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return value[0] % length;
    };
    const chars = groups.map((group) => group[randomIndex(group.length)]);
    while (chars.length < 16) chars.push(all[randomIndex(all.length)]);
    for (let index = chars.length - 1; index > 0; index -= 1) {
      const swapIndex = randomIndex(index + 1);
      [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
    }
    setForm({ ...form, password: chars.join("") });
    setMessage("Contraseña segura generada. Cópiala antes de guardar el acceso.");
  };

  const copyPassword = async () => {
    if (!form.password) return;
    try {
      await navigator.clipboard.writeText(form.password);
      setMessage("Contraseña copiada al portapapeles.");
    } catch {
      setMessage("No se pudo copiar automáticamente. Selecciona la contraseña y cópiala manualmente.");
    }
  };

  return (
    <div className={styles.manager}>
      <aside className={styles.listPanel}>
        <div className={styles.listHeader}><h2>Accesos</h2><p>Cuentas individuales, permisos y estado.</p><button className={styles.newButton} onClick={() => { setSelectedId(null); setForm(emptyUser()); }}>+ Crear acceso</button></div>
        <input className={styles.search} placeholder="Buscar persona o usuario…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className={styles.itemList}>
          {filtered.map((item) => <button key={item.id} className={`${styles.listItem} ${selectedId === item.id ? styles.listItemActive : ""}`} onClick={() => select(item)}><strong>{item.display_name}{item.id === currentUserId ? " · tú" : ""}</strong><span>@{item.username}</span><small className={`${styles.userBadge} ${!item.is_active ? styles.userBadgeOff : ""}`}>{item.is_active ? roleLabel(item.role) : "Desactivado"}</small></button>)}
          {!filtered.length && <div className={styles.empty}>No hay accesos registrados.</div>}
        </div>
      </aside>

      <section className={styles.editor}>
        <div className={styles.editorHeader}><div><h2>{selectedId ? "Editar acceso" : "Crear acceso"}</h2><p>Cada voluntario debe usar su propia cuenta; evita compartir una contraseña general.</p></div><div className={styles.actions}><button className={styles.primaryButton} onClick={save}>Guardar acceso</button></div></div>
        <div className={styles.formGrid}>
          {message && <div className={styles.status}>{message}</div>}
          <div className={styles.twoColumns}>
            <Field label="Nombre visible" value={form.display_name} onChange={(display_name) => setForm({ ...form, display_name })} />
            <Field label="Nombre de usuario" value={form.username} onChange={(username) => setForm({ ...form, username })} disabled={Boolean(selectedId)} placeholder="nombre.apellido" />
          </div>
          <div className={styles.field}>
            <label>{selectedId ? "Nueva contraseña (opcional)" : "Contraseña temporal"}</label>
            <div className={styles.imageRow}>
              <input type="text" value={form.password} placeholder="Mínimo 10 caracteres" onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <button type="button" className={styles.secondaryButton} onClick={generatePassword}>Generar</button>
              {form.password && <button type="button" className={styles.secondaryButton} onClick={copyPassword}>Copiar</button>}
            </div>
            <small>La contraseña solo se muestra aquí; después se almacena como hash.</small>
          </div>
          <div className={styles.field}><label>Perfil base</label><select value={form.role} onChange={(e) => setRole(e.target.value as Role)}><option value="editor">Editor de contenidos</option><option value="administrator">Administrador completo</option><option value="custom">Permisos personalizados</option></select><small>Los permisos pueden ajustarse individualmente con el perfil personalizado.</small></div>
          <div className={styles.permissions}>
            <Check label="Gestionar artículos" checked={form.manage_articles} onChange={(manage_articles) => setForm({ ...form, role: "custom", manage_articles })} />
            <Check label="Gestionar hitos" checked={form.manage_milestones} onChange={(manage_milestones) => setForm({ ...form, role: "custom", manage_milestones })} />
            <Check label="Gestionar voluntarios" checked={form.manage_volunteers} onChange={(manage_volunteers) => setForm({ ...form, role: "custom", manage_volunteers })} />
            <Check label="Crear y modificar accesos" checked={form.manage_users} onChange={(manage_users) => setForm({ ...form, role: "custom", manage_users })} />
          </div>
          <div className={styles.checkboxRow}><Check label="Cuenta activa" checked={form.is_active} onChange={(is_active) => setForm({ ...form, is_active })} /></div>
          {selectedId === currentUserId && <small>No puedes desactivar tu propia cuenta ni retirarte el permiso de gestionar accesos.</small>}
        </div>
      </section>
    </div>
  );
}

function roleLabel(role: string): string { if (role === "administrator") return "Administrador"; if (role === "editor") return "Editor"; return "Personalizado"; }
function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; disabled?: boolean }) { return <div className={styles.field}><label>{label}</label><input type={type} value={value} placeholder={placeholder} disabled={disabled} onChange={(e) => onChange(e.target.value)} /></div>; }
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className={styles.checkboxField}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><label>{label}</label></div>; }
