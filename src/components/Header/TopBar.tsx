export function TopBar() {
  return (
    <div className="container-fluid pt-3 d-none d-lg-block bg-light">
      <div className="container">
        <div className="row">
          <div className="col-lg-6" />
          <div className="col-lg-6 text-center text-lg-right">
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
  )
}