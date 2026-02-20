// src/components/Informacion.tsx
import React from "react";

const Informacion: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="row">
          <div className="bloque-completo">
            <div className="pb-3" style={{ width: "100%" }}>
              <div className="bg-white sombreadoBloque mb-3 clearfix" style={{ padding: "30px" }}>
                <div className="d-flex mb-3">
                  <a className="text-primary text-uppercase text-decoration-none" href="">
                    INFORMACIÓN
                  </a>
                </div>
                <img className="img-fluid img-w float-right mr-4 mb-2" src="img/Jovenes.png" alt="Jóvenes" />
                <h2 className="mb-3">¿QUIÉNES SOMOS?</h2>
                <ul>
                  <li>Somos la voz y el puente visual del Capítulo Juvenil.</li>
                  <li>Conectamos juventud, alimentación, agricultura y clima.</li>
                  <li>Informamos, inspiramos y movilizamos.</li>
                  <li>Amplificamos el impacto de todas las áreas.</li>
                </ul>
                <h2 className="mb-3">NUESTRO OBJETIVO</h2>
                <ul>
                  <li>Dar coherencia y claridad al mensaje del Capítulo</li>
                  <li>Posicionar al WFF Perú en redes y medios</li>
                  <li>Contar historias que inspiren acción juvenil</li>
                  <li>Visibilizar proyectos, alianzas y logros</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informacion;
