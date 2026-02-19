type ProyectoSectionProps = {
  imageSrc: string;
};

export function ProyectoSection({ imageSrc }: ProyectoSectionProps) {
  return (
    <div className="container-fluid">
      <div className="container pt-5">
        <div className="row nuevo">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src={imageSrc}
                alt="Agricultura 5.0"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6
                className="text-primary text-uppercase"
                style={{ letterSpacing: "5px" }}
              >
                Proyecto en marcha
              </h6>

              <h1 className="mb-3">DATA AGRO 5.0</h1>

              <b>PROBLEMÁTICA IDENTIFICADA:</b>
              <p>
                La agricultura peruana enfrenta un riesgo estructural: la
                adopción tecnológica avanza, pero lo hace de manera
                profundamente desigual. Aunque la agricultura familiar
                representa el 97 % de las unidades agropecuarias del país y
                concentra más del 83 % de la fuerza laboral agrícola.
              </p>

              <b>PROYECTO:</b>
              <p>
                La propuesta plantea desarrollar un modelo de Agricultura 5.0
                inclusiva. El proyecto inicia con la recolección de información
                directa en territorio —sensores, observación de campo y
                decisiones técnicas humanas— para entrenar modelos de IA
                ligeros y replicables, enfocados principalmente en la
                optimización del riego. Una vez validados, estos modelos se
                integrarán en una plataforma accesible y se transferirán
                mediante procesos de capacitación a agricultores y jóvenes
                locales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}