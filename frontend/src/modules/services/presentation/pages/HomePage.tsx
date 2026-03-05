import { motion } from 'framer-motion';
import { ServicesList } from '../components/ServicesList';
import { useFeaturedServices } from '../hooks/useFeaturedServices';

export function HomePage() {
  const { services, loading } = useFeaturedServices();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-10"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="app-card space-y-5">
          <p className="app-chip">Experiencia premium</p>
          <h1 className="text-4xl font-semibold">ESSENCE SOFTWARE FACTORY</h1>
          <p className="text-sm text-zinc-300">
            Gestiona turnos, profesionales y clientes con una experiencia moderna, rapida y lista para escalar.
          </p>
          <div className="flex flex-wrap gap-3">
            <a className="btn-primary" href="/appointments">
              Reservar cita
            </a>
            <a className="btn-secondary" href="/register">
              Crear cuenta
            </a>
          </div>
        </div>
        <div className="app-card-soft space-y-4">
          <h2 className="section-title">Control en tiempo real</h2>
          <p className="section-subtitle">
            Paneles por rol, aprobaciones GOD y notificaciones por WhatsApp. Todo listo para produccion.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Agenda clara</p>
              <p className="text-xs text-zinc-400">Vista semanal, filtros y acciones rapidas.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">WhatsApp inteligente</p>
              <p className="text-xs text-zinc-400">Recordatorios con debounce y horarios silenciosos.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Seguridad por rol</p>
              <p className="text-xs text-zinc-400">GOD, Admin, Staff y Cliente con permisos claros.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Operacion sin friccion</p>
              <p className="text-xs text-zinc-400">Flujos de citas listos para equipos grandes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Servicios destacados</h2>
            <p className="section-subtitle">Selecciona el estilo perfecto para tus clientes.</p>
          </div>
          <span className="status-pill">Actualizado hoy</span>
        </header>
        {loading ? <p className="text-zinc-400">Cargando servicios...</p> : <ServicesList services={services} />}
      </div>
    </motion.section>
  );
}
