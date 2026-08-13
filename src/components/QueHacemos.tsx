// src/components/QueHacemos.tsx
import type { FC } from "react";

interface Bloque {
  texto: string;
  color: "Rosa" | "Amarillo" | "Verde";
}

interface PoliticasProps {
  titulo: string;
  linkText: string;
  descripcion: string;
  imgSrc: string;
  bloques: Bloque[];
}

export const QueHacemos: FC<PoliticasProps> = ({
  titulo,
  linkText,
  descripcion,
  imgSrc,
  bloques,
}) => {
  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="pb-3">
              <div className="bg-white sombreadoBloque mb-3 clearfix" style={{ padding: "30px" }}>
                <div className="d-flex mb-3">
                  <a className="text-primary text-uppercase text-decoration-none" href="">
                    {linkText}
                  </a>
                </div>
                <h2 className="mb-3">{titulo}</h2>
                <img className="img-fluid img-w float-left mr-4 mb-2" src={imgSrc} alt={titulo} />
                <p>{descripcion}</p>
                {bloques.map((b, idx) => (
                  <div key={idx} className={`bloque ${b.color}`}>
                    {b.texto}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
