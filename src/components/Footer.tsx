import { Link } from "react-router-dom";
import "../styles/footer.css";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";
import { useSiteSections } from "../hooks/useSiteSections";

const sentence = (text: string) => {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const COPY: Record<Language, { description: string; sections: string; areas: string; rights: string; follow: string }> = {
  es: {
    description:
      "Capítulo Nacional de Juventud del World Food Forum en Perú. Impulsamos la participación juvenil para transformar los sistemas agroalimentarios hacia modelos más sostenibles.",
    sections: "Secciones",
    areas: "Áreas",
    rights: "Todos los derechos reservados.",
    follow: "Síguenos",
  },
  en: {
    description:
      "National Youth Chapter of the World Food Forum in Peru. We promote youth participation to transform agrifood systems towards more sustainable models.",
    sections: "Sections",
    areas: "Areas",
    rights: "All rights reserved.",
    follow: "Follow us",
  },
  it: {
    description:
      "Capitolo Nazionale Giovanile del World Food Forum in Perù. Promuoviamo la partecipazione giovanile per trasformare i sistemi agroalimentari verso modelli più sostenibili.",
    sections: "Sezioni",
    areas: "Aree",
    rights: "Tutti i diritti riservati.",
    follow: "Seguici",
  },
  pt: {
    description:
      "Capítulo Nacional de Juventude do World Food Forum no Peru. Promovemos a participação juvenil para transformar os sistemas agroalimentares em direção a modelos mais sustentáveis.",
    sections: "Seções",
    areas: "Áreas",
    rights: "Todos os direitos reservados.",
    follow: "Siga-nos",
  },
};

const SOCIAL = [
  { href: "https://www.facebook.com/WFFPeruChapter", label: "Facebook WFF Perú Chapter", icon: "fab fa-facebook-f" },
  { href: "https://www.linkedin.com/company/wffperuchapter/posts/?feedView=all", label: "LinkedIn WFF Perú Chapter", icon: "fab fa-linkedin-in" },
  { href: "https://www.instagram.com/wff_peru_chapter/", label: "Instagram WFF Perú Chapter", icon: "fab fa-instagram" },
];

export function Footer() {
  const { t, language } = useLanguage();
  const { sections } = useSiteSections();
  const copy = COPY[language] ?? COPY.es;

  // Enlaces rastreables (<a href>) a las secciones y áreas principales.
  // Las secciones que se desactiven desde el panel de administración no se muestran.
  const sectionLinks: Array<{ to: string; label: string }> = [
    { to: "/nosotros", label: t("nav.about") },
    ...(sections.hitos ? [{ to: "/hitos", label: sentence(t("subnav.milestones")) }] : []),
    ...(sections.voces ? [{ to: "/voces", label: sentence(t("subnav.voices")) }] : []),
  ];
  const areaLinks: Array<{ to: string; label: string }> = [
    { to: "/educacionycultura", label: t("nav.education") },
    { to: "/politicasygobernanza", label: t("nav.policies") },
    { to: "/relacionamiento", label: t("nav.relations") },
    { to: "/cienciaeinnovacion", label: t("nav.science") },
    { to: "/comunicaciones", label: t("nav.communications") },
    { to: "/empoderamiento-femenino", label: t("subnav.women") },
  ];

  return (
    <footer className="wff-footer">
      <div className="wff-footer__inner">
        <div className="wff-footer__main">
          <div className="wff-footer__brand">
            <Link to="/" className="wff-footer__logo" aria-label="WFF Perú Chapter">
              <img src="/img/WFFPeru.webp" alt="WFF Perú Chapter" />
            </Link>
            <p>{copy.description}</p>
          </div>

          <nav className="wff-footer__group" aria-label={copy.sections}>
            <h2>{copy.sections}</h2>
            <ul>
              {sectionLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="wff-footer__group" aria-label={copy.areas}>
            <h2>{copy.areas}</h2>
            <ul>
              {areaLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="wff-footer__bottom">
          <p>
            © {new Date().getFullYear()} WFF Perú Chapter. {copy.rights}
          </p>
          <ul className="wff-footer__social" aria-label={copy.follow}>
            {SOCIAL.map((item) => (
              <li key={item.href}>
                <a href={item.href} title={item.label} aria-label={item.label} target="_blank" rel="noopener noreferrer">
                  <i className={item.icon} aria-hidden="true"></i>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
