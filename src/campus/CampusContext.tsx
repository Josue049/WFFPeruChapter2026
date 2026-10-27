import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ApiError, apiRequest } from "../services/api";
import type { CampusStudent } from "../types/campus";
import { clearCampusToken, getCampusToken, setCampusToken } from "./session";

interface TokenResponse {
  access_token: string;
  student: CampusStudent;
}

interface CampusContextValue {
  student: CampusStudent | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  logout: () => void;
  /** Petición autenticada; cierra la sesión si la API responde 401. */
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<CampusStudent | null>(null);
  const [token, setToken] = useState<string | null>(() => getCampusToken());
  const [loading, setLoading] = useState<boolean>(() => Boolean(getCampusToken()));
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const logout = useCallback(() => {
    clearCampusToken();
    setToken(null);
    setStudent(null);
  }, []);

  const request = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      try {
        return await apiRequest<T>(path, init, { token: tokenRef.current ?? undefined });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401 && tokenRef.current) logout();
        throw error;
      }
    },
    [logout],
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<CampusStudent>("/campus/me", {}, { token })
      .then((data) => {
        if (active) setStudent(data);
      })
      .catch((error: unknown) => {
        if (active && error instanceof ApiError && error.status === 401) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, logout]);

  const accept = useCallback((data: TokenResponse) => {
    setCampusToken(data.access_token);
    setToken(data.access_token);
    setStudent(data.student);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await apiRequest<TokenResponse>("/campus/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      accept(data);
    },
    [accept],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      const data = await request<TokenResponse>("/campus/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      accept(data);
    },
    [accept, request],
  );

  const value = useMemo(
    () => ({ student, loading: Boolean(token) && loading, login, changePassword, logout, request }),
    [student, token, loading, login, changePassword, logout, request],
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) throw new Error("useCampus debe usarse dentro de CampusProvider");
  return context;
}
