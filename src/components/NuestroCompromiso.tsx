import React from "react";

const NuestroCompromiso: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1 className="text-pink text-uppercase">Nuestro compromiso</h1>
          <h6 className="text-uppercase" style={{ letterSpacing: "5px" }}>
            Empoderar a las mujeres en los Sistemas Agroalimentarios
          </h6>
        </div>

        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="bloque-info bg-white mb-2">
              <img className="img-fluid" src="img/ODS4.webp" alt="ODS 4" />
              <div className="p-4">
                <div className="border-top pt-4">
                  <span>
                    <b className="text-uppercase">Educación de calidad:</b>
                    <br />
                    Desarrollar habilidades técnicas y digitales para el trabajo
                    decente en el sector agroalimentario.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="bloque-info bg-white mb-2">
              <img className="img-fluid" src="img/ODS5.webp" alt="ODS 5" />
              <div className="p-4">
                <div className="border-top pt-4">
                  <span>
                    <b className="text-uppercase">Igualdad de género:</b>
                    <br />
                    Promover la economía del cuidado y eliminar barreras de
                    género en las zonas rurales.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="bloque-info bg-white mb-2">
              <img className="img-fluid" src="img/ODS8.webp" alt="ODS 8" />
              <div className="p-4">
                <div className="border-top pt-4">
                  <span>
                    <b className="text-uppercase">Trabajo decente:</b>
                    <br />
                    Impulsar el emprendimiento juvenil y el empleo digno en
                    comunidades agrícolas.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuestroCompromiso;
