export default function AreasSection() {
  const areas = [
    {
      title: "Educación y Cultura",
      image: "img/FondoFAO4.webp",
      href: "/educacionycultura",
    },
    {
      title: "Ciencia e Innovación",
      image: "img/FondoFAO4.webp",
      href: "/cienciaeinnovacion",
    },
    {
      title: "Políticas y Gobernanza",
      image: "img/FondoFAO4.webp",
      href: "/politicasygobernanza",
    },
    {
      title: "Gestión de las comunicaciones",
      image: "img/FondoFAO4.webp",
      href: "/comunicaciones",
    },
    {
      title: "Relacionamiento y Gestión de Recursos",
      image: "img/FondoFAO4.webp",
      href: "/relacionamiento",
    },
    {
      title: "Empoderamiento Femenino",
      image: "img/FondoFAO5.webp",
      href: "/empoderamiento-femenino",
    },
  ]

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        {/* Header */}
        <div className="text-center mb-3 pb-3">
          <h6
            className="text-primary text-uppercase"
            style={{ letterSpacing: "5px" }}
          >
            Conoce las
          </h6>

          <h1>Áreas del Capítulo Nacional</h1>

          <h6
            className="text-uppercase text-extra desktop270"
            style={{ letterSpacing: "5px" }}
          >
            + empoderamiento femenino
          </h6>

          <h6
            className="text-uppercase text-extra movil270"
            style={{ letterSpacing: "5px" }}
          >
            + EF
          </h6>
        </div>

        {/* Grid de áreas */}
        <div className="row">
          {areas.map((area) => (
            <div
              key={area.title}
              className="col-lg-4 col-md-6 mb-4"
            >
              <div className="areas position-relative overflow-hidden mb-2">
                <img
                  className="img-fluid"
                  src={area.image}
                  alt={area.title}
                />

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
  )
}
