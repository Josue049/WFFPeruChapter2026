// src/components/Proyectos.tsx
import React from "react";

interface Proyecto {
  img: string;
  descripcion: string;
}

const proyectos: Proyecto[] = [
  {
    img: "/img/CineEcologico.png",
    descripcion: `Evento cultural que promueve la conciencia ambiental mediante cine y diálogo juvenil. Incluye proyección de cortometrajes sobre cambio climático, sostenibilidad y economía circular. Culmina con un conversatorio de jóvenes líderes y un llamado a la acción por el planeta en la región Amazonas. Fecha tentativa: 6 DE DICIEMBRE DEL 2025`,
  },
  {
    img: "/img/FestiFAO.png",
    descripcion: `Festi FAO es un festival juvenil que celebra la cultura peruana y la creatividad para transformar los sistemas alimentarios. Incluye cocina con insumos locales, cine, arte, música y apoyo a emprendimientos regionales. Fecha tentativa: 9 DE ABRIL DEL 2026`,
  },
  {
    img: "/img/SemillasDeFuerza.png",
    descripcion: `Trabajaremos con colegios públicos cercanos, aliados especializados y una metodología propia para desarrollar talleres educativos (4 en total) en inicial. También se elaborarán materiales didácticos y se mapearán organizaciones de apoyo.`,
  },
  {
    img: "/img/ProyectosJovenes.png",
    descripcion: `Implementaremos un encuentro/taller con agricultores de Campo Alegre, con apoyo de MIDAGRI y actores locales, para documentar saberes sostenibles y difundirlos con contenido audiovisual.`,
  },
];

export const Proyectos: React.FC = () => {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h6 className="text-primary text-uppercase" style={{ letterSpacing: "5px" }}>
            Conoce más sobre
          </h6>
          <h1>Nuestros Proyectos</h1>
        </div>
        <div className="row">
          {proyectos.map((p, idx) => (
            <div className="col-lg-4 col-md-6 mb-4" key={idx}>
              <div className="bloque-info bg-white mb-2">
                <img className="img-fluid" src={p.img} alt="" />
                <div className="p-4">
                  <div className="border-top pt-4">
                    <span>{p.descripcion}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
