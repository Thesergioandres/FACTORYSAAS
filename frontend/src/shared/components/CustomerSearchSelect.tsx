import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../infrastructure/http/apiClient';

export type CustomerRecord = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  tags?: string[];
};

type CustomerSearchSelectProps = {
  value?: CustomerRecord | null;
  onSelect: (customer: CustomerRecord) => void;
  placeholder?: string;
};

export function CustomerSearchSelect({ value, onSelect, placeholder = 'Buscar cliente...' }: CustomerSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiRequest<CustomerRecord[]>('/crm/customers')
      .then((data) => {
        if (!active) return;
        setCustomers(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar clientes');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(needle) ||
        customer.email?.toLowerCase().includes(needle) ||
        customer.phone?.toLowerCase().includes(needle)
      );
    });
  }, [customers, query]);

  return (
    <div className="space-y-3">
      <label className="text-xs uppercase tracking-[0.3em] text-muted">Cliente</label>
      <input
        className="input-field"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading ? <p className="text-xs text-muted">Cargando clientes...</p> : null}
      {error ? <p className="text-xs text-secondary">{error}</p> : null}
      <div className="space-y-2">
        {filtered.map((customer) => (
          <button
            key={customer.id}
            type="button"
            className="app-card-soft flex w-full items-center justify-between gap-4 text-left"
            onClick={() => onSelect(customer)}
          >
            <div>
              <p className="text-sm font-semibold text-ink">{customer.name}</p>
              <p className="text-xs text-muted">{customer.email || customer.phone || 'Sin contacto'}</p>
            </div>
            <span
              className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              Seleccionar
            </span>
          </button>
        ))}
        {filtered.length === 0 && !loading ? (
          <p className="text-xs text-muted">No hay coincidencias.</p>
        ) : null}
      </div>
      {value ? (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] p-3 text-xs text-muted">
          Seleccionado: <span className="text-ink">{value.name}</span>
        </div>
      ) : null}
    </div>
  );
}
