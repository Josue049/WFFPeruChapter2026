import { NavLink } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useSiteSections } from "../../hooks/useSiteSections";

export function SubNav() {
  const { t } = useLanguage();
  const { sections } = useSiteSections();

  return (
    <div className="nav-2">
      <ul>
        {sections.voces && <li><NavLink to="/voces">{t("subnav.voices")}</NavLink></li>}
        {sections.muro && <li><NavLink to="/muro">{t("subnav.muro")}</NavLink></li>}
        {sections.hitos && <li><NavLink to="/hitos">{t("subnav.milestones")}</NavLink></li>}
        {sections.voluntarios && <li><NavLink to="/voluntarios-destacados">{t("subnav.volunteers")}</NavLink></li>}
      </ul>
    </div>
  );
}
