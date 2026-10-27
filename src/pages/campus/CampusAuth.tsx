import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCampus } from "../../campus/CampusContext";
import { ApiError, apiRequest } from "../../services/api";
import styles from "./Campus.module.css";

const errorText = (error: unknown, fallback: string) => (error instanceof ApiError ? error.message : fallback);

export function LoginForm() {
  const { login } = useCampus();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(username.trim(), password);
    } catch (e) {
      setError(errorText(e, "No se pudo iniciar sesión. Inténtalo nuevamente."));
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await apiRequest<{ message: string }>("/campus/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage(data.message);
    } catch (e) {
      setError(errorText(e, "No se pudo enviar la solicitud."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <div className={styles.authCard}>
        {mode === "login" ? (
          <form onSubmit={submitLogin} noValidate>
            <h1>Campus virtual</h1>
            <p>Ingresa con el usuario y la contraseña que te entregó el equipo del WFF Perú Chapter.</p>
            {error && <div className={styles.error} role="alert">{error}</div>}
            <div className={styles.field}>
              <label htmlFor="campus-user">Usuario</label>
              <input id="campus-user" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="campus-pass">Contraseña</label>
              <input id="campus-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            <button type="submit" className={`${styles.primary} ${styles.block}`} disabled={busy || !username || !password}>
              {busy ? "Ingresando…" : "Ingresar"}
            </button>
            <p className={styles.notice}>
              <button type="button" className={styles.linkButton} onClick={() => { setMode("forgot"); setError(""); }}>
                Olvidé mi contraseña
              </button>
              <br />
              Este campus es privado: las cuentas las crea el equipo. No hay registro público.
            </p>
          </form>
        ) : (
          <form onSubmit={submitForgot}>
            <h1>Restablecer contraseña</h1>
            <p>Escribe el correo asociado a tu cuenta y te enviaremos un enlace.</p>
            {error && <div className={styles.error} role="alert">{error}</div>}
            {message && <div className={styles.success} role="status">{message}</div>}
            <div className={styles.field}>
              <label htmlFor="campus-email">Correo electrónico</label>
              <input id="campus-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <button type="submit" className={`${styles.primary} ${styles.block}`} disabled={busy || !email}>
              {busy ? "Enviando…" : "Enviar enlace"}
            </button>
            <p className={styles.notice}>
              <button type="button" className={styles.linkButton} onClick={() => { setMode("login"); setMessage(""); }}>
                Volver a iniciar sesión
              </button>
              <br />
              Si no recibes el correo, pide a un administrador que restablezca tu clave.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export function ChangePasswordForm({ forced = false }: { forced?: boolean }) {
  const { changePassword, logout } = useCampus();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (next !== repeat) return setError("Las contraseñas nuevas no coinciden.");
    if (next.length < 10) return setError("La nueva contraseña debe tener al menos 10 caracteres.");
    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent("");
      setNext("");
      setRepeat("");
      if (!forced) navigate("/clases");
    } catch (e) {
      setError(errorText(e, "No se pudo cambiar la contraseña."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <form className={styles.authCard} onSubmit={submit}>
        <h1>{forced ? "Crea tu contraseña" : "Cambiar contraseña"}</h1>
        <p>
          {forced
            ? "Por seguridad debes reemplazar la contraseña temporal antes de continuar."
            : "Elige una contraseña nueva. Se cerrarán tus otras sesiones."}
        </p>
        {error && <div className={styles.error} role="alert">{error}</div>}
        {done && !forced && <div className={styles.success}>Contraseña actualizada.</div>}
        <div className={styles.field}>
          <label htmlFor="cp-current">{forced ? "Contraseña temporal" : "Contraseña actual"}</label>
          <input id="cp-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="cp-new">Nueva contraseña</label>
          <input id="cp-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required minLength={10} />
          <span className={styles.hint}>Mínimo 10 caracteres, con mayúsculas, minúsculas y un número.</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="cp-repeat">Repite la nueva contraseña</label>
          <input id="cp-repeat" type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" required />
        </div>
        <button type="submit" className={`${styles.primary} ${styles.block}`} disabled={busy || !current || !next}>
          {busy ? "Guardando…" : "Guardar contraseña"}
        </button>
        {forced && (
          <p className={styles.notice}>
            <button type="button" className={styles.linkButton} onClick={logout}>Cerrar sesión</button>
          </p>
        )}
      </form>
    </div>
  );
}

export function ResetPasswordPage() {
  const { token = "" } = useParams();
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (next !== repeat) return setError("Las contraseñas no coinciden.");
    setBusy(true);
    try {
      await apiRequest("/campus/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({ token, new_password: next }),
      });
      setDone(true);
    } catch (e) {
      setError(errorText(e, "No se pudo restablecer la contraseña."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authShell}>
      <form className={styles.authCard} onSubmit={submit}>
        <h1>Nueva contraseña</h1>
        {done ? (
          <>
            <div className={styles.success} role="status">Contraseña actualizada. Ya puedes iniciar sesión.</div>
            <Link to="/clases" className={`${styles.primary} ${styles.block}`}>Ir al campus</Link>
          </>
        ) : (
          <>
            <p>Elige una contraseña nueva de al menos 10 caracteres.</p>
            {error && <div className={styles.error} role="alert">{error}</div>}
            <div className={styles.field}>
              <label htmlFor="rp-new">Nueva contraseña</label>
              <input id="rp-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={10} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="rp-repeat">Repite la contraseña</label>
              <input id="rp-repeat" type="password" value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" required />
            </div>
            <button type="submit" className={`${styles.primary} ${styles.block}`} disabled={busy || !next}>
              {busy ? "Guardando…" : "Restablecer"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
