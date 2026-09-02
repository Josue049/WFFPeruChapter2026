import { NavLink } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";

export function SubNav() {
  const { t } = useLanguage();

  return (
    <div className="nav-2">
      <ul>
        <li><NavLink to="/voces">{t("subnav.voices")}</NavLink></li>
        <li><NavLink to="/hitos">{t("subnav.milestones")}</NavLink></li>
        {/* <li><NavLink to="/voluntarios-destacados">{t("subnav.volunteers")}</NavLink></li> */}
        <li><NavLink to="/empoderamiento-femenino">{t("subnav.women").toUpperCase()}</NavLink></li>
      </ul>
    </div>
  );
}
