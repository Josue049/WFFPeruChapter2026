import { Link } from "react-router-dom";
import "../styles/footer.css";
import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

const sentence = (text: string) => {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const COPY: Record<Language, { description: string; chapter: string; explore: string; rights: string; follow: string }> = {
  es: {
    description:
      "Capítulo Nacional de Juventud del World Food Forum en Perú. Impulsamos la participación juvenil para transformar los sistemas agroalimentarios hacia modelos más sostenibles.",
    chapter: "El Capítulo",
    explore: "Explora",
    rights: "Todos los derechos reservados.",
    follow: "Síguenos",
  },
  en: {
    description:
      "National Youth Chapter of the World Food Forum in Peru. We promote youth participation to transform agrifood systems towards more sustainable models.",
    chapter: "The Chapter",
    explore: "Explore",
    rights: "All rights reserved.",
    follow: "Follow us",
  },
  it: {
    description:
      "Capitolo Nazionale Giovanile del World Food Forum in Perù. Promuoviamo la partecipazione giovanile per trasformare i sistemi agroalimentari verso modelli più sostenibili.",
    chapter: "Il Capitolo",
    explore: "Esplora",
    rights: "Tutti i diritti riservati.",
    follow: "Seguici",
  },
  pt: {
    description:
      "Capítulo Nacional de Juventude do World Food Forum no Peru. Promovemos a participação juvenil para transformar os sistemas agroalimentares em direção a modelos mais sustentáveis.",
    chapter: "O Capítulo",
    explore: "Explore",
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
  const copy = COPY[language] ?? COPY.es;

  // Enlaces a las secciones principales: navegación real y rastreable en todas las páginas.
  const chapterLinks: Array<{ to: string; label: string }> = [
    { to: "/nosotros", label: t("nav.about") },
    { to: "/politicasygobernanza", label: t("nav.policies") },
    { to: "/relacionamiento", label: t("nav.relations") },
  ];
  const exploreLinks: Array<{ to: string; label: string }> = [
    { to: "/voces", label: sentence(t("subnav.voices")) },
    { to: "/hitos", label: sentence(t("subnav.milestones")) },
    { to: "/educacionycultura", label: t("nav.education") },
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

          <nav className="wff-footer__group" aria-label={copy.chapter}>
            <h2>{copy.chapter}</h2>
            <ul>
              {chapterLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="wff-footer__group" aria-label={copy.explore}>
            <h2>{copy.explore}</h2>
            <ul>
              {exploreLinks.map((link) => (
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
