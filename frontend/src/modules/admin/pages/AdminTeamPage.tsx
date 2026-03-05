import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';

type StaffRecord = {
  id: string;
  name: string;
  email?: string;
  commissionRate?: number;
};

export function AdminTeamPage() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{
    id: string;
    name: string;
    previousRate: number;
    nextRate: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<StaffRecord[]>('/users?role=STAFF')
      .then((data) => {
        setStaff(data);
        setDrafts(
          data.reduce<Record<string, number>>((acc, member) => {
            acc[member.id] = member.commissionRate ?? 0.3;
            return acc;
          }, {})
        );
      })
      .catch((err: any) => setError(err.message || 'No se pudo cargar el equipo'));
  }, []);

  const updateRate = (id: string, value: string) => {
    const rate = Number(value);
    setDrafts((prev) => ({ ...prev, [id]: Number.isNaN(rate) ? 0 : rate }));
  };

  const openConfirm = (member: StaffRecord) => {
    const nextRate = Number(drafts[member.id] ?? 0);
    setPending({
      id: member.id,
      name: member.name,
      previousRate: member.commissionRate ?? 0,
      nextRate
    });
  };

  const confirmSave = async () => {
    if (!pending) return;

    setError(null);
    setSaving(true);
    try {
      await apiRequest(`/users/${pending.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ commissionRate: Number(pending.nextRate) })
      });
      setStaff((prev) =>
        prev.map((member) =>
          member.id === pending.id
            ? { ...member, commissionRate: pending.nextRate }
            : member
        )
      );
      setPending(null);
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar la comision');
    } finally {
      setSaving(false);
    }
  };

  const confirmDescription = useMemo(() => {
    if (!pending) return '';
    const previous = Math.round(pending.previousRate * 100);
    const next = Math.round(pending.nextRate * 100);
    return `Cambiar la comision de ${pending.name} de ${previous}% a ${next}%?`;
  }, [pending]);

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Equipo y comisiones</h2>
        <p className="section-subtitle">Ajusta comisiones por rendimiento y controla cobertura.</p>
      </header>

      {error ? <div className="app-card text-sm text-secondary">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="app-card">
          <h3 className="text-lg font-semibold">Comisiones por especialista</h3>
          <div className="mt-4 space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="app-card-soft flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-muted">{member.email || 'Sin email'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="input-field w-24"
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={drafts[member.id] ?? 0.3}
                    onChange={(event) => updateRate(member.id, event.target.value)}
                  />
                  <button className="btn-secondary" type="button" onClick={() => openConfirm(member)}>
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card">
          <h3 className="text-lg font-semibold">Cobertura por sede</h3>
          <p className="mt-2 text-sm text-muted">Rotacion inteligente segun demanda.</p>
          <button className="btn-secondary mt-4" type="button">Configurar turnos</button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Confirmar cambio de comision"
        description={confirmDescription}
        confirmLabel="Aplicar cambio"
        onConfirm={confirmSave}
        onCancel={() => setPending(null)}
        busy={saving}
      />
    </section>
  );
}
