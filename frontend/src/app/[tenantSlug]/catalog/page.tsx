'use client';

import { use } from 'react';

type Props = {
  params: Promise<{ tenantSlug: string }>;
};

export default function TenantCatalogPage({ params }: Props) {
  // `use` from React unwraps the params promise in Client Components
  const resolvedParams = use(params);
  const slug = resolvedParams.tenantSlug;

  const handleDownloadPDF = () => {
    // TODO: Implement with jspdf or html2canvas in future phases
    console.log(`[White-Label] Preparando PDF del catálogo para ${slug}...`);
    alert(`Descarga de Catálogo PDF iniciada para ${slug}. (Función en desarrollo)`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-zinc-500 font-normal">Catálogo de </span>
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                {slug}
              </span>
            </h1>
            <p className="text-zinc-400">Descubre todos nuestros productos y servicios.</p>
          </div>
          
          <button 
            onClick={handleDownloadPDF}
            className="mt-6 md:mt-0 flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-red-600/20 transition-all font-mono"
            title="Exportar catálogo a PDF"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
        </header>
        
        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {/* Esqueletos de productos para visualizar la maqueta */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden shadow-xl">
                <div className="h-48 bg-zinc-800 animate-pulse flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">Imagen de Producto</span>
                </div>
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-zinc-800 rounded mb-4 animate-pulse"></div>
                  <div className="h-4 w-full bg-zinc-800/50 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-zinc-800/50 rounded mb-6 animate-pulse"></div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-8 w-1/3 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="h-10 w-10 bg-zinc-700 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
