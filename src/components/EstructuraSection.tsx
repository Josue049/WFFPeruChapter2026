export function EstructuraSection() {
  return (
    <div className="container-fluid ">
      <div className="container">
        <div className="row">
          <div>
            <div className="pb-3">
              {/* <div className="bloque-texto">
                <div className="position-relative">
                  <img
                    className="img-fluid w-100"
                    src={imageSrc}
                    alt="Estructura organizacional"
                  />
                </div>
              </div> */}

              <div className="mb-3 clearfix" style={{ padding: 30 }}>
                <div className="marcado Rosa">ESTRUCTURA</div>

                <ol>
                  <li>
                    <b>03 Áreas Estratégicas (Enfoque Táctico):</b>
                    <ul>
                      <li>Ciencia e Innovación</li>
                      <li>Educación y Cultura</li>
                      <li>Políticas y Gobernanza (o Gobernanza e Incidencia)</li>
                    </ul>
                  </li>

                  <li>
                    <b>02 Áreas de Soporte (Operacionales):</b>
                    <ul>
                      <li>
                        Gestión de las Comunicaciones: Responsable de la
                        visibilidad, contenidos y vocerías.
                      </li>
                      <li>
                        Relacionamiento y Gestión de Recursos: Enfocada en
                        alianzas, sostenibilidad y cooperación técnica y
                        financiera.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <b>Comité Asesor:</b>
                    <ul>
                      <li>
                        Instancia consultiva que brinda orientación técnica,
                        metodológica y estratégica al Comité de Coordinación
                        Nacional.
                      </li>
                      <li>
                        Integrado por entidades clave como la Secretaría
                        Nacional de Juventud (Senaju) del Ministerio de
                        Educación del Perú y la FAO Perú.
                      </li>
                    </ul>
                  </li>
                </ol>

                <div className="marcado VerdeLimon">
                  MODELO DE GESTIÓN Y GOBERNANZA
                </div>

                <ol>
                  <li>
                    <b>Comité de Coordinación Nacional (CCN):</b>
                    <ul>
                      <li>
                        La instancia de más alto nivel del Capítulo Nacional.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <b>Composición:</b>
                    <ul>
                      <li>
                        Integrado por un/a Coordinador/a General y los Titulares
                        de las 05 Áreas (3 estratégicas y 2 de soporte).
                      </li>
                      <li>
                        Los miembros del Comité fueron instalados oficialmente
                        el 22 de septiembre de 2025.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <b>Liderazgo por Área:</b>
                    <ul>
                      <li>
                        Cada una de las 05 áreas está liderada por un dúo de
                        Titular y Alterno.
                      </li>
                      <li>
                        Esto asegura la continuidad de la gestión y el soporte
                        operativo.
                      </li>
                    </ul>
                  </li>

                  <li>
                    <b>Funciones Clave:</b>
                    <ul>
                      <li>Definir la dirección estratégica del Capítulo.</li>
                      <li>
                        Emitir lineamientos nacionales para su funcionamiento
                        articulado.
                      </li>
                      <li>Aprobar alianzas clave y rutas de intervención.</li>
                      <li>
                        Supervisar el desempeño e impacto de las intervenciones.
                      </li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
