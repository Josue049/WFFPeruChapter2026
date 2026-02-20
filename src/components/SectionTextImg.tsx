type SectionTextImgProps = {
  imageSrc: string;
  badge: string;
  title: string;
  description: string;
};

export function SectionTextImg({
  imageSrc,
  badge,
  title,
  description,
}: SectionTextImgProps) {
  return (
    <div className="container-fluid">
      <div className="container pt-5">
        <div className="row nuevo">
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src={imageSrc}
                alt={title}
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6
                className="text-primary text-uppercase"
                style={{ letterSpacing: "5px" }}
              >
                {badge}
              </h6>

              <h1 className="mb-3">{title}</h1>

              <p>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
