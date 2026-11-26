import { useSiteSections } from "../../hooks/useSiteSections";

export function TopBar() {
  const { christmas } = useSiteSections();
  return (
    <div className="container-fluid position-relative pt-3 d-none d-lg-block bg-light top-bar">
      {christmas && (
        <div className="navidad-deco" aria-hidden="true">
          <div className="navidad-focos" />
          <img className="navidad-rama navidad-rama--izquierda" src="/img/navidad/rama-izquierda.webp" alt="" />
          <img className="navidad-rama navidad-rama--derecha" src="/img/navidad/rama-derecha.webp" alt="" />
        </div>
      )}
      <div className="container">
        <div className="row">
          {/* <div className="flex-start vertical-align col-lg-6">
            <a
              className="btn btn-outline-primary join"
              href="https://forms.office.com/pages/responsepage.aspx?id=aMQ6Frir0ESB_dnbFeOvlnq8OrflyhZOrnoT41c-u6BUMFpMWjk3WlFJUVVIN0k2OVpHNEpBN0FUMC4u&route=shorturl"
              aria-label="Facebook WFF Perú Chapter"
            >
              Únete al Capítulo
            </a>
          </div> */}
          <div className="flex-end">
            <div className="d-flex justify-content-end">
              <a
                className="btn btn-outline-primary btn-redes mr-2"
                href="https://www.facebook.com/WFFPeruChapter"
                aria-label="Facebook WFF Perú Chapter"
              >
                <i className="fab fa-facebook-f"></i>
              </a>

              <a
                className="btn btn-outline-primary btn-redes mr-2"
                href="https://www.linkedin.com/company/wffperuchapter/posts/?feedView=all"
                aria-label="LinkedIn WFF Perú Chapter"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>

              <a
                className="btn btn-outline-primary btn-redes"
                href="https://www.instagram.com/wff_peru_chapter/"
                aria-label="Instagram WFF Perú Chapter"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
