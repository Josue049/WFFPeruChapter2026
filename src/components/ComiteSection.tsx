import { useLanguage } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

type Member = {
  name: string;
  roleKey: TranslationKey;
  image: string;
  instagram?: string;
  linkedin?: string;
};

export default function CommiteSection() {
  const { t } = useLanguage();
  const members: Member[] = [
    {
      name: "Ana Paula Guillén",
      roleKey: "nav.education",
      image: "img/AnaPaula.webp",
      instagram: "https://www.instagram.com/anapaulaguillen_/",
      linkedin:
        "https://www.linkedin.com/in/ana-paula-guillen-yangali-a866881a2/",
    },
    {
      name: "Ronal Guevara",
      roleKey: "nav.education",
      image: "img/Ronal.webp",
      instagram: "https://www.instagram.com/ronalguevarag/",
      linkedin: "https://www.linkedin.com/in/ronal-guevara-guevara-9045172a1/",
    },
    {
      name: "Isabella Chancahuana",
      roleKey: "nav.science",
      image: "img/Isabella.webp",
      instagram: "https://www.instagram.com/isabllanicole/",
      linkedin: "https://www.linkedin.com/in/isabella-chancahuana-castillo/",
    },
    {
      name: "Josué Gutiérrez Cuéllar",
      roleKey: "nav.science",
      image: "img/Josue.webp",
      instagram: "https://www.instagram.com/josue_gcuellar/",
      linkedin: "https://www.linkedin.com/in/josuegutierrezcuellar/",
    },
    {
      name: "Lizet Mejía",
      roleKey: "nav.policies",
      image: "img/Lizet.webp",
      instagram: "https://www.instagram.com/lizmejiape/",
      linkedin: "https://www.linkedin.com/in/lizet-mejia-penadillo-2a654b142/",
    },
    {
      name: "Kristel Leiva",
      roleKey: "nav.policies",
      image: "img/Kristel.webp",
      instagram: "https://www.instagram.com/kleiva.12/",
      linkedin: "https://www.linkedin.com/in/kristelleivamoreano/",
    },
    {
      name: "Olga Lopez",
      roleKey: "nav.communications",
      image: "img/Olga.webp",
      instagram: "https://www.instagram.com/olgalopez0202/",
      linkedin: "https://www.linkedin.com/in/olga-lopez-c/",
    },
    {
      name: "María Paz Ferrand",
      roleKey: "nav.communications",
      image: "img/MariaPaz.webp",
      instagram: "https://www.instagram.com/pzferr/",
      linkedin: "https://www.linkedin.com/in/maria-paz-ferrand-gordillo/",
    },
    {
      name: "Piero Contreras",
      roleKey: "nav.relations",
      image: "img/Piero.webp",
      instagram: "https://www.instagram.com/pierojcr/",
      linkedin: "https://www.linkedin.com/in/piero-contreras-ruiz/",
    },
    {
      name: "GianMarco Quintanilla",
      roleKey: "nav.relations",
      image: "img/GianMarco.webp",
      instagram: "https://www.instagram.com/meninugian/",
      linkedin: "https://www.linkedin.com/in/gianmarcoq/",
    },
  ];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1>{t("committee.title")}</h1>
        </div>

        <div className="row">
          {members.map((member) => (
            <div key={member.name} className="col-lg-3 col-md-4 col-sm-6 pb-2">
              <div className="perfil bg-white mb-4">
                <div className="perfil-img position-relative overflow-hidden">
                  <img
                    className="img-fluid w-100"
                    src={member.image}
                    alt={member.name}
                  />

                  <div className="red">
                    {member.instagram && (
                      <a
                        className="btn btn-outline-primary"
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Instagram de ${member.name}`}
                        title={`Instagram de ${member.name}`}
                      >
                        <i className="fab fa-instagram"></i>
                      </a>
                    )}

                    {member.linkedin && (
                      <a
                        className="btn btn-outline-primary"
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${member.name}`}
                        title={`LinkedIn de ${member.name}`}
                      >
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-center py-4">
                  <h5 className="text-truncate">{member.name}</h5>

                  <p className="m-0 perfil-cargo">{t(member.roleKey)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
