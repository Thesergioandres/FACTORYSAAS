import { Link } from 'react-router-dom';
import { DynamicBackground } from '../../shared/components/DynamicBackground';

export function VerticalNotFoundPage() {
  return (
    <section className="relative space-y-6">
      <DynamicBackground type="NEBULA" />
      <div className="app-card relative overflow-hidden">
        <p className="app-chip">ESSENCE FOUNDry</p>
        <h2 className="mt-4 text-3xl font-semibold">Vertical no encontrada</h2>
        <p className="mt-2 text-sm text-muted">
          La fabrica no encontro esa vertical. Explora el catalogo completo y elige tu especializacion.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/industries">Ver catalogo</Link>
          <Link className="btn-secondary" to="/">Volver al inicio</Link>
        </div>
      </div>
    </section>
  );
}
