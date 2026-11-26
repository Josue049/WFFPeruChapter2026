import { Outlet } from "react-router-dom";
import type { SectionKey } from "../config/siteSections";
import { useSiteSections } from "../hooks/useSiteSections";
import NotFound from "../pages/NotFound";

/** Muestra las rutas hijas solo si la sección está activa; si no, responde como una página inexistente. */
export function SectionGate({ name }: { name: SectionKey }) {
  const { sections, loaded } = useSiteSections();
  if (!loaded) return <p className="page-status" role="status">Cargando…</p>;
  if (!sections[name]) return <NotFound />;
  return <Outlet />;
}
