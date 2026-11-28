import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuthToken, getAuthToken } from "../auth/session";
import { ArticlesManager } from "../components/admin/ArticlesManager";
import { AdminSidebarNav } from "../components/admin/AdminSidebarNav";
import { AuditLogsManager } from "../components/admin/AuditLogsManager";
import { BannersManager } from "../components/admin/BannersManager";
import { MuroManager } from "../components/admin/MuroManager";
import { SectionsManager } from "../components/admin/SectionsManager";
import { MilestonesManager } from "../components/admin/MilestonesManager";
import { UsersManager } from "../components/admin/UsersManager";
import { VolunteersManager } from "../components/admin/VolunteersManager";
import { apiRequest } from "../services/api";
import type { AdminSection, AdminUser } from "../types";
import styles from "./AdminDashboard.module.css";

const CertificatesManager = lazy(() => import("../components/admin/certificates/CertificatesManager"));
const CERTIFICATES_PATH = "/admin/certificados";

const sectionInfo: Record<AdminSection, { label: string; title: string; description: string }> = {
  articles: { label: "Voces", title: "Artículos y voces", description: "Publica y actualiza las columnas del capítulo." },
  muro: { label: "Muro", title: "Muro de reflexiones", description: "Gestiona las reflexiones publicadas, las postulaciones de la comunidad y las etiquetas." },
  milestones: { label: "Hitos", title: "Hitos del capítulo", description: "Gestiona la memoria visual y su línea mensual." },
  volunteers: { label: "Voluntarios", title: "Voluntarios destacados", description: "Cuenta historias, logros e impacto de la comunidad." },
  banners: { label: "Banner de inicio", title: "Banner de la pantalla principal", description: "Cambia las imágenes, textos y botones del carrusel de inicio." },
  sections: { label: "Secciones", title: "Secciones del sitio", description: "Activa o desactiva cada espacio público: Voces, Muro, Hitos y Voluntarios." },
  users: { label: "Accesos", title: "Usuarios y permisos", description: "Crea cuentas individuales y limita sus funciones." },
  certificates: { label: "Certificados", title: "Certificados", description: "Emite, administra y verifica los certificados del capítulo." },
  audit: { label: "Actividad", title: "Registro de actividad", description: "Revisa quién cambió qué y cuándo dentro del centro de contenidos." },
};

export default function Admin() {
  const token = getAuthToken();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [section, setSection] = useState<AdminSection>("articles");
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [pending, setPending] = useState<Partial<Record<AdminSection, number>>>({});

  useEffect(() => {
    if (!token) return;
    apiRequest<AdminUser>("/auth/verify", {}, { token, redirectOnUnauthorized: true })
      .then(setUser)
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "No se pudo cargar el panel"));
  }, [token]);

  const userId = user?.id;
  useEffect(() => {
    if (!token || !userId) return;
    let active = true;
    const refresh = () =>
      apiRequest<Record<string, number>>("/admin/pending-counts", {}, { token })
        .then((counts) => active && setPending({ articles: counts.articles, muro: counts.muro }))
        .catch(() => undefined); // las insignias son opcionales: si falla, simplemente no se muestran
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token, userId, section]);

  const canManageMedia = !!user && (user.manage_articles || user.manage_milestones || user.manage_volunteers);

  const sections = useMemo(() => user ? [
    user.manage_articles && "articles",
    user.manage_muro && "muro",
    user.manage_milestones && "milestones",
    user.manage_volunteers && "volunteers",
    user.manage_certificates && "certificates",
    canManageMedia && "banners",
    user.manage_users && "sections",
    user.manage_users && "users",
    user.manage_users && "audit",
  ].filter(Boolean) as AdminSection[] : [], [user, canManageMedia]);

  // Certificados tiene ruta propia; la URL manda sobre la sección elegida.
  const requested: AdminSection = pathname.replace(/\/+$/, "") === CERTIFICATES_PATH
    ? "certificates"
    : section === "certificates" ? "articles" : section;
  const activeSection: AdminSection = sections.includes(requested)
    ? requested
    : (sections[0] ?? "articles");

  if (loadError) return <main className={styles.loading}>{loadError}</main>;
  if (!token || !user) return <main className={styles.loading}>Cargando panel…</main>;

  const logout = () => { clearAuthToken(); navigate("/loginadmin", { replace: true }); };
  const choose = (next: AdminSection) => {
    setSection(next);
    setMenuOpen(false);
    const path = next === "certificates" ? CERTIFICATES_PATH : "/admin";
    if (pathname !== path) navigate(path);
  };

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.brand}><img src="/img/WFFPeru.webp" alt="WFF Perú" /><p>Centro de contenidos</p></div>
        <AdminSidebarNav
          sections={sections}
          active={activeSection}
          labels={Object.fromEntries(Object.entries(sectionInfo).map(([key, info]) => [key, info.label])) as Record<AdminSection, string>}
          badges={pending}
          onChoose={choose}
        />
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
            {activeSection === "articles" && <ArticlesManager token={token} currentUsername={user.username} />}
            {activeSection === "muro" && <MuroManager token={token} currentUsername={user.username} />}
            {activeSection === "banners" && <BannersManager token={token} />}
            {activeSection === "milestones" && <MilestonesManager token={token} />}
            {activeSection === "volunteers" && <VolunteersManager token={token} />}
            {activeSection === "certificates" && (
              <Suspense fallback={<p role="status">Cargando…</p>}>
                <CertificatesManager token={token} />
              </Suspense>
            )}
            {activeSection === "sections" && <SectionsManager token={token} />}
            {activeSection === "users" && <UsersManager token={token} currentUserId={user.id} />}
            {activeSection === "audit" && <AuditLogsManager token={token} />}
          </>
        )}
      </main>
    </div>
  );
}
