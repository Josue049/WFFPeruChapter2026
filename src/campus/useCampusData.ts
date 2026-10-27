import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/api";
import { useCampus } from "./CampusContext";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

/** Carga un recurso del campus y permite recargarlo sin parpadeos. */
export function useCampusData<T>(path: string | null) {
  const { request } = useCampus();
  const [state, setState] = useState<State<T>>({ data: null, loading: Boolean(path), error: "" });

  const load = useCallback(
    async (silent = false) => {
      if (!path) return;
      if (!silent) setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const data = await request<T>(path);
        setState({ data, loading: false, error: "" });
      } catch (e) {
        setState((s) => ({
          data: silent ? s.data : null,
          loading: false,
          error: e instanceof ApiError ? e.message : "No se pudo cargar la información",
        }));
      }
    },
    [path, request],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const reload = useCallback(() => load(true), [load]);
  return { ...state, reload };
}
