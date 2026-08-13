import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Intenta desplazar el contenedor principal si existe (por ejemplo, layout con overflow)
    const container = document.getElementById("main-scroll");

    if (container) {
      // algunos navegadores no animan scrollTo en elementos; usar scrollTop directo
      try {
        container.scrollTo({ top: 0, left: 0 });
      } catch {
        container.scrollTop = 0;
      }
      // además asegurar que el documento también quede en 0 por si acaso
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      return;
    }

    // fallback: desplazar la ventana
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
