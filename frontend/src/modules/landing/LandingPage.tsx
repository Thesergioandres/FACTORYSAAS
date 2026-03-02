import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <section className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="app-card">
          <p className="app-chip">White-label core</p>
          <h2 className="mt-4 text-4xl font-semibold">La fabrica SaaS que se adapta a cada negocio.</h2>
          <p className="mt-4 text-sm text-muted">
            Inyecta marca, rutas y permisos en tiempo real. Opera multiples negocios con una sola plataforma.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" to="/onboarding">
              Crear mi negocio
            </Link>
            <Link className="btn-secondary" to="/login">
              Entrar al panel
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="app-card">
            <h3 className="text-lg font-semibold">Micro-Frontends Logicos</h3>
            <p className="mt-2 text-sm text-muted">
              Booking, Admin, Staff y Control Global separados para escalar sin fricciones.
            </p>
          </div>
          <div className="app-card">
            <h3 className="text-lg font-semibold">Control por Plan</h3>
            <p className="mt-2 text-sm text-muted">
              Activa features segun plan, con estados de upgrade claros y medibles.
            </p>
          </div>
          <div className="app-card">
            <h3 className="text-lg font-semibold">Sincronizacion viva</h3>
            <p className="mt-2 text-sm text-muted">
              Agenda con refresco automatico y experiencias instantaneas con skeletons.
            </p>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Servicios por industria</h3>
            <p className="mt-2 text-sm text-muted">
              Flujos y configuraciones listas para cada vertical.
            </p>
          </div>
          <button className="btn-secondary" type="button">Ver todos</button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Barberias', detail: 'Reservas por especialista y turnos.' },
            { title: 'Salones de belleza', detail: 'Servicios combinados y upsell.' },
            { title: 'Veterinarias', detail: 'Citas por mascota y recordatorios.' },
            { title: 'Fisioterapeutas', detail: 'Sesiones recurrentes y planes.' }
          ].map((item) => (
            <div key={item.title} className="app-card-soft">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Servicio</p>
              <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
