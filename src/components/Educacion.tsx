// src/components/Educacion.tsx
import React from "react";

export const Educacion: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src="/img/AboutEducacion.webp"
                style={{ objectFit: "cover" }}
                alt="Educación"
              />
            </div>
          </div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>
                Lo que hacemos en ...
              </h6>
              <h1 className="mb-3">EDUCACIÓN</h1>
              <p>
                La educación en sistemas alimentarios es clave para construir un
                futuro más saludable y sostenible. El Programa de educación
                juvenil del WFF busca cerrar brechas territoriales y de
                educación, brindando herramientas, recursos y oportunidades para
                que jóvenes, educadores y profesionales lideren el cambio a
                nivel local y global.
              </p>
              <div className="row mb-4">
                <div className="col-6">
                  <img className="img-fluid" src="/img/SemillasDeFuerza.webp" alt="Semillas de Fuerza" />
                </div>
                <div className="col-6">
                  <img className="img-fluid" src="/img/ProyectosJovenes.webp" alt="Proyectos Jóvenes" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
