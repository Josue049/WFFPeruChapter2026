type ImageCardsBlockProps = {
  eyebrow: string
  title: string
  description: string
  mainImage: string
  cards: {
    image: string
    alt?: string
  }[]
}

export function ImageCardsBlock({
  eyebrow,
  title,
  description,
  mainImage,
  cards,
}: ImageCardsBlockProps) {
  return (
    <div className="container-fluid py-5">
      <div className="container pt-5">
        <div className="row nuevo">
          {/* Imagen principal */}
          <div className="col-lg-6" style={{ minHeight: "500px" }}>
            <div className="position-relative h-100">
              <img
                className="position-absolute w-100 h-100"
                src={mainImage}
                alt={title}
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Texto + tarjetas */}
          <div className="col-lg-6 pt-5 pb-lg-5">
            <div className="about-text-right bg-white p-4 p-lg-5 my-lg-5">
              <h6
                className="text-primary text-uppercase"
                style={{ letterSpacing: "5px" }}
              >
                {eyebrow}
              </h6>

              <h1 className="mb-3">{title}</h1>

              <p>{description}</p>

              <div className="row mb-4">
                {cards.map((card, index) => (
                  <div className="col-6" key={index}>
                    <img
                      className="img-fluid"
                      src={card.image}
                      alt={card.alt ?? `Card ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageCardsBlock
