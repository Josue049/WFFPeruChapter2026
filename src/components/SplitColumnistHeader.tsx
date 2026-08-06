
interface SplitColumnistHeaderProps {
  imageSrc?: string;
  name?: string;
  title?: string;
  subtitle?: string;
}

export default function SplitColumnistHeader({
  imageSrc = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
  name = 'Ariana Maita',
  title = 'La regulación emocional en la nutrición',
  subtitle = '"La educación en nutrición debe incluir el aspecto psicológico".',
}: SplitColumnistHeaderProps) {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Categoría superior */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] text-gray-500 uppercase">
            COLUMNISTAS / Opinión
          </p>
        </div>

        {/* Grid de dos columnas - SPLIT 50/50 */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* COLUMNA IZQUIERDA: 50% FOTO GIGANTE */}
          <div className="relative">
            {/* Foto cuadrada grande */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
              <img 
                src={imageSrc} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Tarjeta blanca flotante - esquina inferior derecha */}
            <div className="absolute -bottom-6 -right-6 bg-white px-6 py-4 shadow-lg rounded-lg border border-gray-100">
              <h2 className="text-xl font-normal text-gray-900">
                {name}
              </h2>
            </div>
          </div>

          {/* COLUMNA DERECHA: 50% CONTENIDO */}
          <div className="flex flex-col justify-center space-y-8">
            {/* Título grande */}
            <h1 className="text-5xl md:text-6xl font-normal text-gray-900 leading-tight">
              {title}
            </h1>

            {/* Subtítulo con barra lateral negra */}
            <div className="border-l-4 border-gray-900 pl-6">
              <p className="text-lg md:text-xl text-gray-700 font-light italic leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}