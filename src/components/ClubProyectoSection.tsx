type ClubProyectosSectionProps = {
  imageSrc: string;
};

export function ClubProyectosSection({
  imageSrc,
}: ClubProyectosSectionProps) {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src={imageSrc}
                alt="Club de Proyectos"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text bg-white p-4 p-lg-5 my-lg-5">
              <h6
                className="text-primary text-uppercase"
                style={{ letterSpacing: "5px" }}
              >
                Lo que hacemos en ...
              </h6>

              <h1 className="mb-3">CLUB DE PROYECTOS</h1>

              <p>
                Espacio juvenil que impulsa la creación y desarrollo de
                proyectos agroalimentarios mediante formación en habilidades
                blandas, innovación y trabajo colaborativo. Reúne a jóvenes con
                perfiles técnicos diversos{" "}
                <b>
                  (programación, agricultura, IA, robótica, física, GIS y más)
                </b>{" "}
                para acompañarlos en el proceso de formular, mejorar y
                presentar soluciones que transformen los sistemas
                agroalimentarios del país.
                <br />
                <br />
                Convocatoria permanente para jóvenes con ideas o interés en
                sumarse a un equipo. Ejecución del Ciclo de Pitch, con talleres
                clave: Sesiones de networking “Forma tu equipo”, que conectan a
                jóvenes con habilidades complementarias.
                <br />
                <br />
                <b>
                  Conexión con cursos de FAO Academy con certificación
                  vinculados con agricultura sostenible e innovación.
                </b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}