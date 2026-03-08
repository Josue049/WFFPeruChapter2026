type Member = {
  name: string;
  role: string;
  image: string;
  instagram?: string;
  linkedin?: string;
};

export default function CommiteSection() {
  const members: Member[] = [
    {
      name: "Ana Paula Guillén",
      role: "Educación y Cultura",
      image: "img/AnaPaula.jpg",
      instagram: "https://www.instagram.com/anapaulaguillen_/",
      linkedin:
        "https://www.linkedin.com/in/ana-paula-guillen-yangali-a866881a2/",
    },
    {
      name: "Ronald Guevara",
      role: "Educación y Cultura",
      image: "img/Ronal.jpg",
      instagram: "https://www.instagram.com/ronalguevarag/",
      linkedin: "https://www.linkedin.com/in/ronal-guevara-guevara-9045172a1/",
    },
    {
      name: "Isabella Chancahuana",
      role: "Ciencia e Innovación",
      image: "img/Isabella.jpg",
      instagram: "https://www.instagram.com/isabllanicole/",
      linkedin: "https://www.linkedin.com/in/isabella-chancahuana-castillo/",
    },
    {
      name: "Josué Gutiérrez Cuéllar",
      role: "Ciencia e Innovación",
      image: "img/Josue.jpg",
      instagram: "https://www.instagram.com/josue_gcuellar/",
      linkedin: "https://www.linkedin.com/in/josuegutierrezcuellar/",
    },
    {
      name: "Lizet Mejía",
      role: "Políticas y Gobernanza",
      image: "img/Lizet.jpg",
      instagram: "https://www.instagram.com/lizmejiape/",
      linkedin: "https://www.linkedin.com/in/lizet-mejia-penadillo-2a654b142/",
    },
    {
      name: "Kristel Leiva",
      role: "Políticas y Gobernanza",
      image: "img/Kristel.png",
      instagram: "https://www.instagram.com/kleiva.12/",
      linkedin: "https://www.linkedin.com/in/kristelleivamoreano/",
    },
    {
      name: "Olga Lopez",
      role: "Gestión de\nlas Comunicaciones",
      image: "img/Olga.png",
      instagram: "https://www.instagram.com/olgalopez0202/",
      linkedin: "https://www.linkedin.com/in/olga-lopez-c/",
    },
    {
      name: "María Paz Ferrand",
      role: "Gestión de\nlas Comunicaciones",
      image: "img/MariaPaz.jpg",
      instagram: "https://www.instagram.com/pzferr/",
      linkedin: "https://www.linkedin.com/in/maria-paz-ferrand-gordillo/",
    },
    {
      name: "Piero Contreras",
      role: "Relacionamiento y\nGestión de Recursos",
      image: "img/Piero.jpg",
      instagram: "https://www.instagram.com/pierojcr/",
      linkedin: "https://www.linkedin.com/in/piero-contreras-ruiz/",
    },
    {
      name: "GianMarco Quintanilla",
      role: "Relacionamiento y\nGestión de Recursos",
      image: "img/GianMarco.jpg",
      instagram: "https://www.instagram.com/meninugian/",
      linkedin: "https://www.linkedin.com/in/gianmarcoq/",
    },
  ];

  return (
    <div className="container-fluid py-5">
      <div className="container pt-5 pb-3">
        <div className="text-center mb-3 pb-3">
          <h1>Integrantes del Comité</h1>
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
                  <p className="m-0">
                    {member.role.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
