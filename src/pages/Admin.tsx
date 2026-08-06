import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../auth/session";
import { ArticlesManager } from "../components/admin/ArticlesManager";
import { MilestonesManager } from "../components/admin/MilestonesManager";
import { UsersManager } from "../components/admin/UsersManager";
import { VolunteersManager } from "../components/admin/VolunteersManager";
import { apiRequest } from "../services/api";
import type { AdminSection, AdminUser } from "../types";
import styles from "./AdminDashboard.module.css";

const sectionInfo: Record<AdminSection, { label: string; title: string; description: string }> = {
  articles: { label: "Voces", title: "Artículos y voces", description: "Publica y actualiza las columnas del capítulo." },
  milestones: { label: "Hitos", title: "Hitos del capítulo", description: "Gestiona la memoria visual y su línea mensual." },
  volunteers: { label: "Voluntarios", title: "Voluntarios destacados", description: "Cuenta historias, logros e impacto de la comunidad." },
  users: { label: "Accesos", title: "Usuarios y permisos", description: "Crea cuentas individuales y limita sus funciones." },
};

export default function Admin() {
  const token = getAuthToken();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [section, setSection] = useState<AdminSection>("articles");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest<AdminUser>("/auth/verify", {}, { token, redirectOnUnauthorized: true })
      .then(setUser)
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "No se pudo cargar el panel"));
  }, [token]);

  const sections = useMemo(() => user ? [
    user.manage_articles && "articles",
    user.manage_milestones && "milestones",
    user.manage_volunteers && "volunteers",
    user.manage_users && "users",
  ].filter(Boolean) as AdminSection[] : [], [user]);

  const activeSection: AdminSection = sections.includes(section)
    ? section
    : (sections[0] ?? "articles");

  if (loadError) return <main className={styles.loading}>{loadError}</main>;
  if (!token || !user) return <main className={styles.loading}>Cargando panel…</main>;

  const logout = () => { clearAuthToken(); navigate("/loginadmin", { replace: true }); };
  const choose = (next: AdminSection) => { setSection(next); setMenuOpen(false); };

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}><img src="/img/WFFPeru.webp" alt="WFF Perú" /><p>Centro de contenidos</p></div>
        <nav className={styles.nav} aria-label="Secciones administrativas">
          {sections.map((item) => <button key={item} className={activeSection === item ? styles.active : ""} onClick={() => choose(item)}>{sectionInfo[item].label}</button>)}
        </nav>
        <div className={styles.userArea}><strong>{user.display_name}</strong><span>@{user.username}</span><button className={styles.logout} onClick={logout}>Cerrar sesión</button></div>
      </aside>
      {menuOpen && <button className={styles.overlay} aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div><button className={styles.menuButton} onClick={() => setMenuOpen(true)}>Menú</button><div><h1>{sectionInfo[activeSection].title}</h1><p>{sectionInfo[activeSection].description}</p></div></div>
          <a className={styles.siteLink} href="/" target="_blank" rel="noreferrer">Ver sitio ↗</a>
        </header>
        {!sections.length ? <div className={styles.noPermissions}>Tu cuenta no tiene módulos asignados. Contacta a un gestor de accesos.</div> : (
          <>
            {activeSection === "articles" && <ArticlesManager token={token} />}
            {activeSection === "milestones" && <MilestonesManager token={token} />}
            {activeSection === "volunteers" && <VolunteersManager token={token} />}
            {activeSection === "users" && <UsersManager token={token} currentUserId={user.id} />}
          </>
        )}
      </main>
    </div>
  );
}
