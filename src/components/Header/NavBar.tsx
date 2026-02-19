import { NavLink } from "react-router-dom";
import { useNavbarDropdowns } from "../../hooks/useNavbarDropdowns";
import { SubNav } from "./SubNav";

export function NavBar() {
  useNavbarDropdowns();

  return (
    <div className="container-fluid position-relative nav-bar p-0">
      <div
        className="container-lg position-relative p-0 px-lg-3"
        style={{ zIndex: 9 }}
      >
        <nav className="navbar navbar-expand-lg bg-light navbar-light shadow-lg py-3 py-lg-0 pl-3 pl-lg-5">
          
          <NavLink to="/" className="desktop">
            <img className="logoWFF" src="https://www.wffperuchapter.page/img/WFFPeru.png" alt="Logo WFF Perú" />
          </NavLink>

          <NavLink to="/" className="movil">
            <img className="logoWFF" src="https://www.wffperuchapter.page/img/logoWFFPeru.png" alt="Logo WFF Perú" />
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarCollapse"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className="collapse navbar-collapse justify-content-between px-3"
            id="navbarCollapse"
          >
            <div className="navbar-nav ml-auto py-0">
              
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Inicio
              </NavLink>

              <NavLink
                to="/nosotros"
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Nosotros
              </NavLink>

              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-toggle="dropdown">
                  Áreas
                </a>
                <div className="dropdown-menu border-0 rounded-0 m-0">
                  <NavLink to="/educacionycultura" className="dropdown-item">
                    Educación y Cultura
                  </NavLink>
                  <NavLink to="/cienciaeinnovacion" className="dropdown-item">
                    Ciencia e Innovación
                  </NavLink>
                  <NavLink to="/politicasygobernanza" className="dropdown-item">
                    Políticas y Gobernanza
                  </NavLink>
                  <NavLink to="/comunicaciones" className="dropdown-item">
                    Gestión de las<br />Comunicaciones
                  </NavLink>
                  <NavLink to="/relacionamiento" className="dropdown-item">
                    Relacionamiento y<br />Gestión de Recursos
                  </NavLink>
                </div>
              </div>

              <NavLink
                to="/womensEmpowerment"
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Women&apos;s Empowerment
              </NavLink>

              
              {/* <NavLink
                to="/voces"
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                Voces
              </NavLink> */}
            </div>
          </div>
        </nav>

        <SubNav />
      </div>
    </div>
  );
}
