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
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/cienciaeinnovacion" element={<Cienciaeinnovacion />} />
        <Route path="/educacionycultura" element={<Educacionycultura />} />
        <Route
          path="/politicasygobernanza"
          element={<Politicasygobernanza />}
        />
        <Route path="/comunicaciones" element={<Comunicaciones />} />
        <Route path="/relacionamiento" element={<Relacionamiento />} />
        <Route path="/womensEmpowerment" element={<WomensEmpowerment />} />
        <Route path="/voces" element={<Voces />} />
        <Route path="/voces/:slug" element={<Articulo />} />
      </Routes>
    </Router>
  );
}

export default App;
