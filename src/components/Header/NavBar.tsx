import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SubNav } from "./SubNav";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const location = useLocation();

  const areasRoutes = [
    "/educacionycultura",
    "/cienciaeinnovacion",
    "/politicasygobernanza",
    "/comunicaciones",
    "/relacionamiento",
  ];

  const isAreasActive = areasRoutes.includes(location.pathname);

  const closeMenu = () => {
    setOpen(false);
    setAreasOpen(false);
  };

  const toggleAreas = () => {
    setAreasOpen(!areasOpen);
  };

  return (
    <div className="container-fluid position-relative nav-bar p-0">
      <div
        className="container-lg position-relative p-0 px-lg-3"
        style={{ zIndex: 9 }}
      >
        <nav className="navbar navbar-expand-lg bg-light navbar-light shadow-lg py-3 py-lg-0 pl-3 pl-lg-5">
          <NavLink to="/" className="desktop" onClick={closeMenu}>
            <img
              className="logoWFF"
              src="https://www.wffperuchapter.page/img/WFFPeru.webp"
              alt="Logo WFF Perú"
            />
          </NavLink>

          <NavLink to="/" className="movil" onClick={closeMenu}>
            <img
              className="logoWFF"
              src="https://www.wffperuchapter.page/img/logoWFFPeru.webp"
              alt="Logo WFF Perú"
            />
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse justify-content-between px-3 ${
              open ? "show" : ""
            }`}
          >
            <div className="navbar-nav ml-auto py-0">
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Inicio
              </NavLink>

              <NavLink
                to="/nosotros"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Nosotros
              </NavLink>

              <div className="nav-item dropdown">
                <button
                  className={`nav-link dropdown-toggle btn btn-link ${
                    isAreasActive ? "active" : ""
                  }`}
                  style={{ textDecoration: "none" }}
                  type="button"
                  onClick={toggleAreas}
                >
                  Áreas
                </button>

                <div
                  className={`dropdown-menu border-0 rounded-0 m-0 ${
                    areasOpen ? "show" : ""
                  }`}
                >
                  <NavLink
                    to="/educacionycultura"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Educación y Cultura
                  </NavLink>

                  <NavLink
                    to="/cienciaeinnovacion"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Ciencia e Innovación
                  </NavLink>

                  <NavLink
                    to="/politicasygobernanza"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Políticas y Gobernanza
                  </NavLink>

                  <NavLink
                    to="/comunicaciones"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Gestión de las
                    <br />
                    Comunicaciones
                  </NavLink>

                  <NavLink
                    to="/relacionamiento"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Relacionamiento y<br />
                    Gestión de Recursos
                  </NavLink>

                  <NavLink
                    to="/womensEmpowerment"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Empoderamiento
                    <br /> Femenino
                  </NavLink>
                </div>
              </div>

              <div className="flex-start vertical-align col-lg-6">
                <a
                  className="btn btn-unirse join"
                  href="https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl"
                  aria-label="Facebook WFF Perú Chapter"
                >
                  Únete al Capítulo
                </a>
              </div>

              {/* <NavLink
                to="/womensEmpowerment"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Women&apos;s Empowerment
              </NavLink> */}
            </div>
          </div>
        </nav>

        <SubNav />
      </div>
    </div>
  );
}
