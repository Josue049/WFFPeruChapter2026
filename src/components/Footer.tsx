export function Footer() {
  return (
    <div
      className="footer-max container-fluid text-white-50 py-5 px-sm-3 px-lg-5"
      style={{ marginTop: "90px" }}
    >
      <div className="footerwff">
        <div className="footer-sub">
          {/* Logo Desktop */}
          <a href="/" className="desktop">
            <img className="logoWFF" src="/img/WFFPeru.webp" alt="Logo WFF Perú" />
          </a>

          {/* Logo Mobile */}
          <a href="/" className="movil">
            <img className="logoWFF" src="/img/logoWFFPeru.webp" alt="Logo WFF Perú" />
          </a>

          {/* Redes */}
          <div className="redes">
            <h6 className="text-dark text-uppercase" style={{ letterSpacing: "5px" }}>
              Síguenos
            </h6>
            <div className="d-flex justify-content-start">
              <a
                className="btn btn-outline-primary btn-redes mr-2"
                href="https://www.facebook.com/WFFPeruChapter"
                title="Facebook WFF Perú Chapter"
                aria-label="Facebook WFF Perú Chapter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f"></i>
              </a>

              <a
                className="btn btn-outline-primary btn-redes mr-2"
                href="https://www.linkedin.com/company/wffperuchapter/posts/?feedView=all"
                title="LinkedIn WFF Perú Chapter"
                aria-label="LinkedIn WFF Perú Chapter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>

              <a
                className="btn btn-outline-primary btn-redes"
                href="https://www.instagram.com/wff_peru_chapter/"
                title="Instagram WFF Perú Chapter"
                aria-label="Instagram WFF Perú Chapter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
