import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: Promise<{ tenantSlug: string }>;
};

// Generación de SEO dinámico (White-Label)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.tenantSlug;
  
  // Aquí se haría el fetch al backend: GET /api/public/tenant/:slug
  // const tenant = await getTenantPublicProfile(slug);
  
  return {
    title: `Bienvenido a ${slug} | Reservas y Catálogo`,
    description: `Landing pública B2C de ${slug}. Conoce nuestros servicios, productos y reserva tu cita online.`
  };
}

export default async function TenantPublicLandingPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.tenantSlug;
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto text-center border border-white/10 rounded-2xl p-12 bg-zinc-900 shadow-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
          Landing Pública B2C
        </h1>
        <h2 className="text-2xl font-semibold mb-8 text-white">Negocio: {slug}</h2>
        
        <p className="text-zinc-400 mb-12 text-lg max-w-2xl mx-auto">
          Esta es la página pública indexable por Google. Aquí se renderizará el logo, la descripción
          y los colores dinámicos (White-Label) configurados por el administrador en su Panel.
        </p>

        <div className="bg-zinc-800 p-8 rounded-xl border border-white/5 inline-block">
          <p className="text-zinc-500 mb-6">Explora nuestros productos y servicios:</p>
          <Link 
            href={`/${slug}/catalog`} 
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-3 rounded-full font-medium transition-colors"
          >
            Ver Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
