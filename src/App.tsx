import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Nosotros from "./pages/nosotros";
import Cienciaeinnovacion from "./pages/cienciaeinnovacion";
import Educacionycultura from "./pages/educacionycultura";
import Politicasygobernanza from "./pages/politicasygobernanza";
import Relacionamiento from "./pages/relacionamiento";
import Comunicaciones from "./pages/comunicaciones";
import EmpoderamientoFemenino from "./pages/empoderamientoFemenino";
import Voces from "./pages/Voces";
import Articulo from "./pages/Articulo";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import LoginAdmin from "./pages/LoginAdmin";
import { NavBarFixed } from "./components/Header/NavBarFixed";

import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";

function App() {
  const [showScrollDiv, setShowScrollDiv] = useState(false);

  useEffect(() => {
    const container = document.getElementById("main-scroll");

    const handleScroll = () => {
      console.log("scroll:", container?.scrollTop); // verifica que funciona
      setShowScrollDiv((container?.scrollTop ?? 0) > 150);
    };

    container?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />

      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          width: "100%",
          opacity: showScrollDiv ? 1 : 0,
          transform: showScrollDiv ? "translateY(0)" : "translateY(-100%)",
          transition: "all 0.3s ease",
          // ✅ Evita que bloquee clics cuando está oculto
          pointerEvents: showScrollDiv ? "auto" : "none",
        }}
      >
        <NavBarFixed />
      </div>

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/cienciaeinnovacion" element={<Cienciaeinnovacion />} />
          <Route path="/educacionycultura" element={<Educacionycultura />} />
          <Route
            path="/politicasygobernanza"
            element={<Politicasygobernanza />}
          />
          <Route path="/comunicaciones" element={<Comunicaciones />} />
          <Route path="/relacionamiento" element={<Relacionamiento />} />
          <Route
            path="/empoderamiento-femenino"
            element={<EmpoderamientoFemenino />}
          />
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
