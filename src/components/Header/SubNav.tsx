import { NavLink } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { FEATURES } from "../../config/features";

export function SubNav() {
  const { t } = useLanguage();

  return (
    <div className="nav-2">
      <ul>
        <li><NavLink to="/voces">{t("subnav.voices")}</NavLink></li>
        {FEATURES.muro && <li><NavLink to="/muro">{t("subnav.muro")}</NavLink></li>}
        <li><NavLink to="/hitos">{t("subnav.milestones")}</NavLink></li>
        {FEATURES.clases && <li><NavLink to="/clases">{t("subnav.classes")}</NavLink></li>}
        {/* <li><NavLink to="/voluntarios-destacados">{t("subnav.volunteers")}</NavLink></li> */}
        <li><NavLink to="/empoderamiento-femenino">{t("subnav.women").toUpperCase()}</NavLink></li>
      </ul>
    </div>
  );
}
