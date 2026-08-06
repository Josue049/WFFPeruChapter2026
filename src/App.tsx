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

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/voces" element={<Voces />} />
          <Route path="/voces/:slug" element={<Articulo />} />
          <Route path="/hitos" element={<Hitos />} />
          <Route path="/hitos/:slug" element={<HitoDetalle />} />
          <Route path="/voluntarios-destacados" element={<VoluntariosDestacados />} />
          <Route path="/voluntarios-destacados/:slug" element={<VoluntarioDetalle />} />
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
    </BrowserRouter>
  );
}

export default App;
