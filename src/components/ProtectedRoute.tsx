import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  clearAuthToken,
  getAuthToken,
  hasUsableAuthToken,
} from "../auth/session";
import { ApiError, apiRequest } from "../services/api";
import styles from "./ProtectedRoute.module.css";

interface ProtectedRouteProps {
  children: ReactNode;
}

type AuthStatus = "checking" | "authorized" | "unauthorized" | "error";

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = getAuthToken();
  const locallyValid = Boolean(token && hasUsableAuthToken());
  const [status, setStatus] = useState<AuthStatus>(
    locallyValid ? "checking" : "unauthorized",
  );

  useEffect(() => {
    if (!token || !locallyValid) return;

    let active = true;

    apiRequest<{ valid: boolean }>(
      "/auth/verify",
      {},
      { token },
    )
      .then(() => {
        if (active) setStatus("authorized");
      })
      .catch((error: unknown) => {
        if (!active) return;

        if (error instanceof ApiError && error.status === 401) {
          clearAuthToken();
          setStatus("unauthorized");
          return;
        }

        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [locallyValid, token]);

  if (status === "unauthorized") {
    return (
      <Navigate
        to="/loginadmin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (status === "checking") {
    return (
      <main className={styles.statusPage} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Validando sesión…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className={styles.statusPage}>
        <h1>No se pudo validar la sesión</h1>
        <p>Comprueba la conexión con la API e inténtalo nuevamente.</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              window.location.replace("/loginadmin");
            }}
          >
            Ir al acceso
          </button>
        </div>
      </main>
    );
  }

  return children;
}
