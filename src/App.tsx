import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicShell } from "./components/PublicShell";
import Admin from "./pages/Admin";
import Articulo from "./pages/Articulo";
import Cienciaeinnovacion from "./pages/cienciaeinnovacion";
import Comunicaciones from "./pages/comunicaciones";
import Educacionycultura from "./pages/educacionycultura";
import EmpoderamientoFemenino from "./pages/empoderamientoFemenino";
import Inicio from "./pages/inicio";
import Hitos from "./pages/Hitos";
import HitoDetalle from "./pages/HitoDetalle";
import VoluntariosDestacados from "./pages/VoluntariosDestacados";
import VoluntarioDetalle from "./pages/VoluntarioDetalle";
import LoginAdmin from "./pages/LoginAdmin";
import Nosotros from "./pages/nosotros";
import NotFound from "./pages/NotFound";
import Politicasygobernanza from "./pages/politicasygobernanza";
import Relacionamiento from "./pages/relacionamiento";
import Voces from "./pages/Voces";
import { SectionGate } from "./components/SectionGate";
import EnviarArticulo from "./pages/EnviarArticulo";

// Muro se carga bajo demanda para no aumentar el peso del sitio principal.
const Muro = lazy(() => import("./pages/Muro"));
const MuroDetalle = lazy(() => import("./pages/MuroDetalle"));
const MuroEnviar = lazy(() => import("./pages/MuroEnviar"));
const MuroMiReflexion = lazy(() => import("./pages/MuroMiReflexion"));

function PageFallback() {
  return <p className="page-status" role="status">Cargando…</p>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicShell />}>
          <Route index element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/cienciaeinnovacion" element={<Cienciaeinnovacion />} />
          <Route path="/educacionycultura" element={<Educacionycultura />} />
          <Route path="/politicasygobernanza" element={<Politicasygobernanza />} />
          <Route path="/comunicaciones" element={<Comunicaciones />} />
          <Route path="/relacionamiento" element={<Relacionamiento />} />
          <Route path="/empoderamiento-femenino" element={<EmpoderamientoFemenino />} />
          <Route element={<SectionGate name="voces" />}>
            <Route path="/voces" element={<Voces />} />
            <Route path="/voces/enviar" element={<EnviarArticulo />} />
            <Route path="/voces/:slug" element={<Articulo />} />
          </Route>
          <Route element={<SectionGate name="muro" />}>
            <Route path="/muro" element={<Muro />} />
            <Route path="/muro/enviar" element={<MuroEnviar />} />
            <Route path="/muro/mi-reflexion/:token" element={<MuroMiReflexion />} />
            <Route path="/muro/:slug" element={<MuroDetalle />} />
          </Route>
          <Route element={<SectionGate name="hitos" />}>
            <Route path="/hitos" element={<Hitos />} />
            <Route path="/hitos/:slug" element={<HitoDetalle />} />
          </Route>
          <Route element={<SectionGate name="voluntarios" />}>
            <Route path="/voluntarios-destacados" element={<VoluntariosDestacados />} />
            <Route path="/voluntarios-destacados/:slug" element={<VoluntarioDetalle />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        
        <Route path="/loginadmin" element={<LoginAdmin />} />

        <Route path="/Admin" element={<Navigate to="/admin" replace />} />
        <Route path="/LoginAdmin" element={<Navigate to="/loginadmin" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
