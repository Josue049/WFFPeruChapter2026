import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { hasUsableAuthToken, setAuthToken } from "../auth/session";
import { ApiError, apiRequest } from "../services/api";
import styles from "./LoginAdmin.module.css";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface LocationState {
  from?: string;
}

export default function LoginAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (hasUsableAuthToken()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ username: user, password }),
      });

      setAuthToken(data.access_token);
      const destination = (location.state as LocationState | null)?.from || "/admin";
      navigate(destination, { replace: true });
    } catch (requestError) {
      const message =
        requestError instanceof ApiError && requestError.status === 401
          ? "Usuario o contraseña incorrectos."
          : "No se pudo conectar con el servidor.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.accentBar} />

        <div className={styles.logoWrap}>
          <img
            src="/img/WFFPeru.webp"
            alt="WFF Perú"
            className={styles.logo}
          />
        </div>

        <h1 className={styles.title}>Administración</h1>

        <label className={styles.label} htmlFor="username">
          Usuario
        </label>
        <div className={styles.inputWrap}>
          <EmailIcon />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={user}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setUser(event.target.value)}
            className={styles.input}
            required
          />
        </div>

        <label className={styles.label} htmlFor="password">
          Contraseña
        </label>
        <div className={styles.inputWrap}>
          <LockIcon />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            className={styles.input}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={submitting}>
          {submitting ? "Verificando…" : "Iniciar sesión"}
        </button>
      </form>
    </main>
  );
}

function EmailIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" stroke="#BA7517" strokeWidth="1.5">
      <path d="M2.5 5.5h15v10h-15V5.5z" strokeLinejoin="round" />
      <path d="M2.5 5.5l7.5 6 7.5-6" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 20 20" fill="none" stroke="#BA7517" strokeWidth="1.5">
      <rect x="4" y="9" width="12" height="8" rx="2" />
      <path d="M7 9V6a3 3 0 016 0v3" strokeLinecap="round" />
    </svg>
  );
}
