import { useEffect } from "react";

export function useNavbarDropdowns() {
  useEffect(() => {
    const handleDropdowns = () => {
      const isDesktop = window.matchMedia("(hover: hover)").matches;
      const dropdowns = document.querySelectorAll(".navbar .dropdown");

      dropdowns.forEach((dropdown) => {
        const el = dropdown as HTMLElement; // casteamos a HTMLElement
        const menu = el.querySelector(".dropdown-menu") as HTMLElement | null;

        // Limpia cualquier listener previo
        el.onmouseenter = null;
        el.onmouseleave = null;

        if (isDesktop) {
          const handleMouseEnter = () => {
            el.classList.add("show");
            if (menu) menu.classList.add("show");
          };

          const handleMouseLeave = () => {
            el.classList.remove("show");
            if (menu) menu.classList.remove("show");
          };

          el.addEventListener("mouseenter", handleMouseEnter);
          el.addEventListener("mouseleave", handleMouseLeave);

          // Para limpiar correctamente, guardamos referencias
          // (en React esto se puede mejorar con useRef, pero funciona así)
        }
      });
    };

    // Inicial
    handleDropdowns();

    // Escucha resize para re-evaluar
    window.addEventListener("resize", handleDropdowns);

    // Cleanup
    return () => window.removeEventListener("resize", handleDropdowns);
  }, []);
}
