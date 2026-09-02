import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SubNav } from "./SubNav";
// import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../../i18n/LanguageContext";

export function NavBarFixed() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const location = useLocation();
  const areasMenuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!areasMenuRef.current) return;
      if (!areasMenuRef.current.contains(event.target as Node)) {
        setAreasOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="container-fluid position-relative nav-bar p-0">
      <div
        className="container-lg-fixed position-relative p-0 "
        style={{ zIndex: 9 }}
      >
        <nav className="navbar navbar-expand-lg bg-light navbar-light shadow-lg py-3 py-lg-0 pl-3 pl-lg-5">
          <NavLink to="/" className="desktop" onClick={closeMenu}>
            <img
              className="logoWFF"
              src="/img/WFFPeru.webp"
              alt="Logo WFF Perú"
            />
          </NavLink>

          <NavLink to="/" className="movil" onClick={closeMenu}>
            <img
              className="logoWFF"
              src="/img/logoWFFPeru.webp"
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
                {t("nav.home")}
              </NavLink>

              <NavLink
                to="/nosotros"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-item nav-link ${isActive ? "active" : ""}`
                }
              >
                {t("nav.about")}
              </NavLink>

              <div className="nav-item dropdown" ref={areasMenuRef}>
                <button
                  className={`nav-link dropdown-toggle btn btn-link ${
                    isAreasActive ? "active" : ""
                  }`}
                  style={{ textDecoration: "none" }}
                  type="button"
                  onClick={toggleAreas}
                >
                  {t("nav.areas")}
                </button>

                <div
                  className={`dropdown-menu areas-dropdown-menu border-0 rounded-0 m-0 ${
                    areasOpen ? "show" : ""
                  }`}
                >
                  <NavLink
                    to="/educacionycultura"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {t("nav.education")}
                  </NavLink>

                  <NavLink
                    to="/cienciaeinnovacion"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {t("nav.science")}
                  </NavLink>

                  <NavLink
                    to="/politicasygobernanza"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {t("nav.policies")}
                  </NavLink>

                  <NavLink
                    to="/comunicaciones"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {t("nav.communications")}
                  </NavLink>

                  <NavLink
                    to="/relacionamiento"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    {t("nav.relations")}
                  </NavLink>

                  {/* <NavLink
                    to="/womensEmpowerment"
                    className="dropdown-item"
                    onClick={closeMenu}
                  >
                    Empoderamiento
                    <br /> Femenino
                  </NavLink> */}
                </div>
              </div>

              {/* <div className="nav-language-slot">
                <LanguageSwitcher />
              </div> */}

              <div className="flex-start vertical-align nav-join-slot">
                <a
                  className="btn btn-unirse join"
                  href="https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl"
                  aria-label={t("nav.joinAria")}
                >
                  {t("nav.join")}
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
