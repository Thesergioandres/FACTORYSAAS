import Link from 'next/link';

export default function FactoryLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Landing Principal de la Factory
        </h1>
        <Link 
          href="/admin-login" 
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded shadow-lg shadow-black/50 transition-colors"
        >
          Login del Administrador
        </Link>
      </header>
      <main>
        <p className="text-zinc-400 text-lg mb-8">
          Bienvenido a la Software Factory. Selecciona el servicio B2B2C que deseas explorar:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/erp" className="block p-6 bg-zinc-900 border border-white/10 rounded hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-2 text-blue-400">Servicio ERP</h2>
            <p className="text-zinc-500">Gestión de inventario y punto de venta para negocios retail.</p>
          </Link>
          <div className="block p-6 bg-zinc-900 border border-white/5 opacity-50 rounded cursor-not-allowed">
            <h2 className="text-xl font-semibold mb-2">Barberías (Próximamente)</h2>
            <p className="text-zinc-500">Plataforma integral de reservas y POS para barberías.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
