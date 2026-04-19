// src/components/Cultura.tsx
import React from "react";

export const Cultura: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row nuevo">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src="/img/AboutCultura.webp"
                style={{ objectFit: "cover" }}
                alt="Cultura"
              />
            </div>
          </div>
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>
                Lo que hacemos en ...
              </h6>
              <h1 className="mb-3">CULTURA</h1>
              <p>
                Impulsamos a la gastronomía, cine, música y arte como lenguajes
                universales para movilizar a la juventud y acelerar la
                transformación de los sistemas agroalimentarios hacia un futuro
                más sostenible.
              </p>
              <div className="row mb-4">
                <div className="col-6">
                  <img className="img-fluid" src="/img/CineEcologico.webp" alt="Cine Ecológico" />
                </div>
                <div className="col-6">
                  <img className="img-fluid" src="/img/FestiFAO.webp" alt="Festi FAO" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
