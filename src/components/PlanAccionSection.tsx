type PlanAccionItem = {
  title?: string; // ahora opcional
  items: string[];
  allies?: string; // ahora opcional
  image?: string;
};

type PlanAccionSectionProps = {
  title?: string; // ahora opcional
  blocks: PlanAccionItem[];
};

export function PlanAccionSection({ title, blocks }: PlanAccionSectionProps) {
  return (
    <>
      {title && (
        <div className="container-fluid">
          <div className="container">
            <div className="text-center mb-3 pb-3">
              <h1 className="text-pink text-uppercase">{title}</h1>
            </div>
          </div>
        </div>
      )}

      {blocks.map((block, index) => {
        const reverse = index % 2 !== 0;

        return (
          <div className="container-fluid py-5" key={index}>
            <div className="container">
              <div className="row">
                <div className={`col-lg-10 ${reverse ? "ml-auto" : ""}`}>
                  <div className="cuadro-flotante shadow bg-white">
                    <div
                      className="cuadro"
                      style={{
                        display: "flex",
                        flexDirection: reverse ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <div className="cuadro-text">
                        {block.title && <h3 className="mb-3">{block.title}</h3>}

                        <ul>
                          {block.items.map((item, i) => {
                            const colonIndex = item.indexOf(":");

                            if (colonIndex !== -1) {
                              const before = item.slice(0, colonIndex + 1); // incluye :
                              const after = item.slice(colonIndex + 1);

                              return (
                                <li key={i}>
                                  <strong>{before}</strong>
                                  {after}
                                </li>
                              );
                            }

                            return <li key={i}>{item}</li>;
                          })}
                        </ul>

                        {block.allies && <b>Aliados: {block.allies}</b>}
                      </div>

                      <div>
                        <img
                          src={block.image || "/img/deco.webp"}
                          className="decor-img img-fluid"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
