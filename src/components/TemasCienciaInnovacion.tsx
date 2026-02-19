type Tema = {
  texto: string;
  color: "Azul" | "Verde" | "Amarillo" | "Rosa";
};

type TemasCienciaInnovacionProps = {
  temas: Tema[];
};

export function TemasCienciaInnovacion({ temas }: TemasCienciaInnovacionProps) {
  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="bg-white sombreadoBloque mb-3 clearfix p-4">
          <div className="d-flex mb-3">
            <span className="text-primary text-uppercase">
              CONÓCENOS
            </span>
          </div>

          <h2 className="mb-3">
            LO QUE HACEMOS EN CIENCIA E INNOVACIÓN
          </h2>

          <p>
            Existe una brecha global: La tecnología avanza, pero no llega
            a los territorios vulnerables.
          </p>

          <h5 className="text-uppercase text-center pt-5">
            <b>Nuestros temas de interés y el rol de la ciencia</b>
          </h5>

          <div className="grid">
            {temas.map((tema, index) => (
              <div
                key={index}
                className={`bloque ${tema.color}`}
              >
                {tema.texto}
              </div>
            ))}
          </div>

          <h5 className="text-uppercase text-center mt-5">
            <b>La ciencia es uno de los aceleradores clave para los ODS</b>
          </h5>
        </div>
      </div>
    </div>
  );
}