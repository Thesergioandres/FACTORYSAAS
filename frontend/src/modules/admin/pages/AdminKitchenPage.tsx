import { KitchenDisplay } from '../../hosteleria/components/KitchenDisplay';

export function AdminKitchenPage() {
  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Cocina en tiempo real</h2>
        <p className="section-subtitle">Monitorea comandas activas y tiempos de entrega.</p>
      </header>
      <KitchenDisplay />
    </section>
  );
}
