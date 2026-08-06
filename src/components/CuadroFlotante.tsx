// src/components/CuadroFlotante.tsx
import type { FC } from "react";

interface CuadroFlotanteProps {
  titulo: string;
  objetivo: string;
  producto: string;
  color: "Rosa" | "Amarillo" | "Verde";
  decorImg: string;
  // Opción para invertir la posición de la imagen
  invert?: boolean;
}

export const CuadroFlotante: FC<CuadroFlotanteProps> = ({
  titulo,
  objetivo,
  producto,
  color,
  decorImg,
  invert = false,
}) => {
  return (
    <div className="container-fluid py-3">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className={`cuadro-flotante boxShadow${color} bg-white`}>
              <div className="cuadro d-flex flex-wrap align-items-center">
                {!invert && (
                  <div className="cuadro-text">
                    <h3 className="mb-3">{titulo}</h3>
                    <ul>
                      <li>
                        <b>Objetivo:</b> {objetivo}
                      </li>
                      <li>
                        <b>Producto:</b> {producto}
                      </li>
                    </ul>
                  </div>
                )}

                <div className="decor-img-container mx-3 my-2">
                  <img src={decorImg} className="decor-img" alt="" />
                </div>

                {invert && (
                  <div className="cuadro-text">
                    <h3 className="mb-3">{titulo}</h3>
                    <ul>
                      <li>
                        <b>Objetivo:</b> {objetivo}
                      </li>
                      <li>
                        <b>Producto:</b> {producto}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
