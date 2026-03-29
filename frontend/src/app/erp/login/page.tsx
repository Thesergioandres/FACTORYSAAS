export default function ERPLoginPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login ERP</h1>
        <p className="text-zinc-400 text-center mb-6 text-sm">
          Accede al panel de tu negocio. Si tu cuenta está PENDING, se mostrará "Esperando aprobación del administrador".
        </p>
        <div className="space-y-4 opacity-50">
          <input type="email" placeholder="Correo electrónico" className="w-full p-3 rounded bg-zinc-800 border-none" disabled />
          <input type="password" placeholder="Contraseña" className="w-full p-3 rounded bg-zinc-800 border-none" disabled />
          <button className="w-full bg-blue-600 p-3 rounded text-white font-medium hover:bg-blue-500" disabled>Iniciar Sesión</button>
        </div>
      </div>
    </div>
  );
}
