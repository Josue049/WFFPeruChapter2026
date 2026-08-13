// src/components/LoQueHacemos.tsx
import type { FC } from "react";

const LoQueHacemos: FC = () => {
  return (
    <div className="container-fluid">
      <div className="container">
        <div className="row">
          <div className="cuadro-completo">
            <div className="cuadro-flotante shadow bg-white">
              <div className="cuadro">
                <div className="imagen">
                  <img src="img/comu1.webp" className="img-fluid decor-img-comu" alt="" />
                </div>
                <div className="cuadro-text">
                  <h2 className="">Lo que hacemos:</h2>

                  <h4>1. Estrategia de contenido</h4>
                  <ul>
                    <li>Narrativa clara</li>
                    <li>Plan editorial</li>
                  </ul>

                  <h4>2. Redes sociales</h4>
                  <ul>
                    <li>Gestión y diseño</li>
                    <li>Imagen visual del Capítulo</li>
                  </ul>

                  <h4>3. Comunicación interna y medios</h4>
                  <ul>
                    <li>Flujo interno</li>
                    <li>Relaciones públicas</li>
                  </ul>

                  <h4>4. Difusión de eventos</h4>
                  <ul>
                    <li>Promoción</li>
                    <li>Campañas y llamados a la acción</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoQueHacemos;
