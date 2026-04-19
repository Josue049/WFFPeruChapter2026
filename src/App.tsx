import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Nosotros from "./pages/nosotros";
import Cienciaeinnovacion from "./pages/cienciaeinnovacion";
import Educacionycultura from "./pages/educacionycultura";
import Politicasygobernanza from "./pages/politicasygobernanza";
import Relacionamiento from "./pages/relacionamiento";
import Comunicaciones from "./pages/comunicaciones";
import WomensEmpowerment from "./pages/womensEmpowerment";
import Voces from "./pages/Voces";
import Articulo from "./pages/Articulo";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import LoginAdmin from "./pages/LoginAdmin";

import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Layout con footer fijo abajo */}
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/cienciaeinnovacion" element={<Cienciaeinnovacion />} />
          <Route path="/educacionycultura" element={<Educacionycultura />} />
          <Route path="/politicasygobernanza" element={<Politicasygobernanza />} />
          <Route path="/comunicaciones" element={<Comunicaciones />} />
          <Route path="/relacionamiento" element={<Relacionamiento />} />
          <Route path="/womensEmpowerment" element={<WomensEmpowerment />} />
          <Route path="/voces" element={<Voces />} />
          <Route path="/voces/:slug" element={<Articulo />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/LoginAdmin" element={<LoginAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;