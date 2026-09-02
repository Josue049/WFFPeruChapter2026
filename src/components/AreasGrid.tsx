import { useLanguage } from "../i18n/LanguageContext";

export default function AreasSection() {
  const { t } = useLanguage();

  const areas = [
    {
      title: t("nav.education"),
      image: "img/FondoFAO4.webp",
      href: "/educacionycultura",
    },
    {
      title: t("nav.science"),
      image: "img/FondoFAO4.webp",
      href: "/cienciaeinnovacion",
    },
    {
      title: t("nav.policies"),
      image: "img/FondoFAO4.webp",
      href: "/politicasygobernanza",
    },
    { title: t("nav.areas"), image: "img/FondoFAO4.webp", href: "/comunicaciones" },
    {
      title: t("nav.relations"),
      image: "img/FondoFAO4.webp",
      href: "/relacionamiento",
    },
    {
      title: t("subnav.women"),
      image: "img/FondoFAO5.webp",
      href: "/empoderamiento-femenino",
    },
  ];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h6
            className="text-primary text-uppercase"
            style={{ letterSpacing: "5px" }}
          >
            {t("areas.know")}
          </h6>
          <h1>{t("areas.title")}</h1>
          <h6
            className="text-uppercase text-extra desktop270"
            style={{ letterSpacing: "5px" }}
          >
            {t("areas.women")}
          </h6>
          <h6
            className="text-uppercase text-extra movil270"
            style={{ letterSpacing: "5px" }}
          >
            {t("areas.womenShort")}
          </h6>
        </div>

        <div className="row">
          {areas.map((area) => (
            <div key={area.href} className="col-lg-4 col-md-6 mb-4">
              <div className="areas position-relative overflow-hidden mb-2">
                <img className="img-fluid" src={area.image} alt={area.title} />
                <a
                  className="area-a text-white text-decoration-none"
                  href={area.href}
                >
                  <h5 className="text-white">{area.title}</h5>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
