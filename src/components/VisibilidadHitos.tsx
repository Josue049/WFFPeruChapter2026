import React from "react";

const VisibilidadHitos: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1 className="text-pink text-uppercase">
            Visibilidad y próximos hitos
          </h1>
        </div>

        <div className="row bloque-dual">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="hitos bg-white mb-2">
              <h4>CSW 70 - ONU Mujeres Marzo 2026, Nueva York</h4>
              <div className="p-4">
                <div className="border-top pt-4">
                  <span>
                    Presentación de experiencia piloto peruana sobre
                    empoderamiento económico de jóvenes rurales
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <div className="hitos bg-white mb-2">
              <h4>Año Internacional de la Mujer Agricultora</h4>
              <div className="p-4">
                <div className="border-top pt-4">
                  <span>
                    Publicación del informe regional “From Policy to Action –
                    Latin America” con participación activa del Capítulo Perú
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

export default VisibilidadHitos;
