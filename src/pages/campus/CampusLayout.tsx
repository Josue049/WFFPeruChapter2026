import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CampusProvider, useCampus } from "../../campus/CampusContext";
import { NavBar } from "../../components/Header/NavBar";
import { TopBar } from "../../components/Header/TopBar";
import { ScrollTopButton } from "../../components/ScrollTopButton";
import { ChangePasswordForm, LoginForm } from "./CampusAuth";
import styles from "./Campus.module.css";

function Gate() {
  const { student, loading, logout } = useCampus();
  const location = useLocation();

  if (location.pathname.startsWith("/clases/restablecer")) return <Outlet />;
  if (loading) return <p className={styles.status} role="status">Cargando campus…</p>;
  if (!student) return <LoginForm />;
  if (student.must_change_password) return <ChangePasswordForm forced />;

  return (
    <>
      <div className={styles.campusBar}>
        <div className={`${styles.wrap} ${styles.campusBarInner}`}>
          <h1 className={styles.campusBrand}>
            <small>Campus virtual</small>
            WFF Perú Chapter
          </h1>
          <nav className={styles.campusNav} aria-label="Campus">
            <NavLink to="/clases" end className={({ isActive }) => (isActive ? styles.active : "")}>Mis cursos</NavLink>
            <NavLink to="/clases/notas" className={({ isActive }) => (isActive ? styles.active : "")}>Mis notas</NavLink>
            <NavLink to="/clases/cuenta" className={({ isActive }) => (isActive ? styles.active : "")}>Mi cuenta</NavLink>
            <span className={styles.userChip}>{student.full_name}</span>
            <button type="button" onClick={logout}>Cerrar sesión</button>
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default function CampusLayout() {
  return (
    <>
      <TopBar />
      <NavBar />
      <CampusProvider>
        <main className={styles.page}>
          <Gate />
        </main>
      </CampusProvider>
      <ScrollTopButton />
    </>
  );
}
