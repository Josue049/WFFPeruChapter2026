import { useLanguage } from "../i18n/LanguageContext";
import type { Language } from "../i18n/translations";

type Tema = { texto: string; color: "Azul" | "Verde" | "Amarillo" | "Rosa" };
type TemasCienciaInnovacionProps = { temas: Tema[] };

const COPY: Record<Language, { know: string; title: string; gap: string; topics: string; ods: string }> = {
  es: { know: "CONÓCENOS", title: "LO QUE HACEMOS EN CIENCIA E INNOVACIÓN", gap: "Existe una brecha global: la tecnología avanza, pero no llega a los territorios vulnerables.", topics: "Nuestros temas de interés y el rol de la ciencia", ods: "La ciencia es uno de los aceleradores clave para los ODS" },
  en: { know: "GET TO KNOW US", title: "WHAT WE DO IN SCIENCE AND INNOVATION", gap: "There is a global gap: technology advances, but it does not always reach vulnerable territories.", topics: "Our priority topics and the role of science", ods: "Science is one of the key accelerators for the SDGs" },
  it: { know: "CONOSCICI", title: "COSA FACCIAMO IN SCIENZA E INNOVAZIONE", gap: "Esiste un divario globale: la tecnologia avanza, ma non sempre raggiunge i territori vulnerabili.", topics: "I nostri temi prioritari e il ruolo della scienza", ods: "La scienza è uno degli acceleratori chiave per gli SDG" },
  pt: { know: "CONHEÇA-NOS", title: "O QUE FAZEMOS EM CIÊNCIA E INOVAÇÃO", gap: "Existe uma lacuna global: a tecnologia avança, mas nem sempre chega aos territórios vulneráveis.", topics: "Nossos temas prioritários e o papel da ciência", ods: "A ciência é um dos principais aceleradores dos ODS" },
};

export function TemasCienciaInnovacion({ temas }: TemasCienciaInnovacionProps) {
  const { language } = useLanguage();
  const copy = COPY[language];

  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="bg-white sombreadoBloque mb-3 clearfix p-4">
          <div className="d-flex mb-3"><span className="text-primary text-uppercase">{copy.know}</span></div>
          <h2 className="mb-3">{copy.title}</h2>
          <p>{copy.gap}</p>
          <h5 className="text-uppercase text-center pt-5"><b>{copy.topics}</b></h5>
          <div className="grid">
            {temas.map((tema, index) => <div key={index} className={`bloque ${tema.color}`}>{tema.texto}</div>)}
          </div>
          <h5 className="text-uppercase text-center mt-5"><b>{copy.ods}</b></h5>
        </div>
      </div>
    </div>
  );
}
