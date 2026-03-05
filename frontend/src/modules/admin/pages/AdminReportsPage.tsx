import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { apiRequest } from '../../../shared/infrastructure/http/apiClient';
import { DateRangePicker } from '../../../shared/components/DateRangePicker';

type CommissionItem = {
  staffId: string;
  staffName: string;
  rate: number;
  total: number;
  appointments: number;
};

type DailyReport = {
  date: string;
  grossRevenue: number;
  commissions: CommissionItem[];
};

type RangeDay = {
  date: string;
  grossRevenue: number;
  commissions: number;
  netRevenue: number;
};

type RangeReport = {
  start: string;
  end: string;
  grossRevenue: number;
  commissions: CommissionItem[];
  days: RangeDay[];
};

export function AdminReportsPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailyReport | RangeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'daily' | 'range'>('daily');
  const [rangeStart, setRangeStart] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    now.setDate(now.getDate() - day + 1);
    return now.toISOString().split('T')[0];
  });
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().split('T')[0]);

  const loadReport = async (targetDate: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<DailyReport>(`/reports/daily?date=${targetDate}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el cierre');
    } finally {
      setLoading(false);
    }
  };

  const loadRangeReport = async (start: string, end: string) => {
    try {
      setLoading(true);
      const data = await apiRequest<RangeReport>(`/reports/range?start=${start}&end=${end}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el rango');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'daily') {
      loadReport(date);
    } else {
      loadRangeReport(rangeStart, rangeEnd);
    }
  }, [date, mode, rangeStart, rangeEnd]);

  const totalCommissions = useMemo(() =>
    report?.commissions.reduce((acc, item) => acc + item.total, 0) || 0,
    [report]
  );

  const netRevenue = useMemo(() => (report?.grossRevenue || 0) - totalCommissions, [report, totalCommissions]);

  const activateWeek = () => {
    const now = new Date();
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - day + 1);
    setMode('range');
    setRangeStart(start.toISOString().split('T')[0]);
    setRangeEnd(new Date().toISOString().split('T')[0]);
  };

  const activateMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setMode('range');
    setRangeStart(start.toISOString().split('T')[0]);
    setRangeEnd(new Date().toISOString().split('T')[0]);
  };

  const downloadCsv = () => {
    if (!report) return;

    const rows: Array<Array<string | number>> = 'date' in report
      ? [
        ['Fecha', report.date],
        ['Ventas del dia', report.grossRevenue.toFixed(2)],
        ['Comisiones', totalCommissions.toFixed(2)],
        ['Utilidad neta', netRevenue.toFixed(2)],
        [],
        ['Especialista', 'Citas', 'Tasa', 'Comision']
      ]
      : [
        ['Desde', report.start],
        ['Hasta', report.end],
        ['Ventas del rango', report.grossRevenue.toFixed(2)],
        ['Comisiones', totalCommissions.toFixed(2)],
        ['Utilidad neta', netRevenue.toFixed(2)],
        [],
        ['Especialista', 'Citas', 'Tasa', 'Comision']
      ];

    report.commissions.forEach((item) => {
      rows.push([
        item.staffName,
        item.appointments,
        `${Math.round(item.rate * 100)}%`,
        item.total.toFixed(2)
      ]);
    });

    if ('days' in report) {
      rows.push([]);
      rows.push(['Fecha', 'Ventas', 'Comisiones', 'Utilidad']);
      report.days.forEach((day) => {
        rows.push([
          day.date,
          day.grossRevenue.toFixed(2),
          day.commissions.toFixed(2),
          day.netRevenue.toFixed(2)
        ]);
      });
    }

    const escapeValue = (value: string | number) => {
      const stringValue = String(value);
      if (/[,\n"]/u.test(stringValue)) {
        return `"${stringValue.replace(/"/gu, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = rows
      .map((row) => row.map(escapeValue).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = 'date' in report
      ? `cierre-${report.date}.csv`
      : `cierre-${report.start}_a_${report.end}.csv`;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Cierre de caja</h2>
        <p className="section-subtitle">Resumen diario con comisiones y utilidad.</p>
      </header>

      <div className="app-card flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className={mode === 'daily' ? 'btn-primary' : 'btn-secondary'} type="button" onClick={() => setMode('daily')}>
            Hoy
          </button>
          <button className={mode === 'range' ? 'btn-primary' : 'btn-secondary'} type="button" onClick={activateWeek}>
            Esta semana
          </button>
          <button className={mode === 'range' ? 'btn-primary' : 'btn-secondary'} type="button" onClick={activateMonth}>
            Este mes
          </button>
        </div>
        {mode === 'daily' ? (
          <label className="text-sm">
            Fecha
            <input
              className="input-field mt-2"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        ) : null}
        <button className="btn-secondary" type="button" onClick={downloadCsv} disabled={!report || loading}>
          Descargar CSV
        </button>
      </div>

      {mode === 'range' ? (
        <DateRangePicker
          start={rangeStart}
          end={rangeEnd}
          onChange={(range) => {
            if (range.start) setRangeStart(range.start);
            if (range.end) setRangeEnd(range.end);
          }}
        />
      ) : null}

      {error ? <div className="app-card text-sm text-secondary">{error}</div> : null}

      {loading ? (
        <div className="app-card">
          <p className="text-sm text-muted">Cargando cierre...</p>
        </div>
      ) : report ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="app-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Ventas del dia</p>
              <p className="mt-3 text-2xl font-semibold">$ {report.grossRevenue.toFixed(2)}</p>
            </div>
            <div className="app-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Comisiones</p>
              <p className="mt-3 text-2xl font-semibold">$ {totalCommissions.toFixed(2)}</p>
            </div>
            <div className="app-card">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Utilidad neta</p>
              <p className="mt-3 text-2xl font-semibold">$ {netRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="app-card">
            <h3 className="text-lg font-semibold">Detalle por especialista</h3>
            {report.commissions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sin comisiones registradas.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {report.commissions.map((item) => (
                  <div key={item.staffId} className="app-card-soft flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.staffName}</p>
                      <p className="text-xs text-muted">{Math.round(item.rate * 100)}% · {item.appointments} citas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink">$ {item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {'days' in report ? (
            <div className="app-card">
              <h3 className="text-lg font-semibold">Evolucion diaria</h3>
              {report.days.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Sin datos para este rango.</p>
              ) : (
                <>
                  <div className="mt-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.days} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(248,250,252,0.08)" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#c3cad6" fontSize={12} />
                        <YAxis stroke="#c3cad6" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 17, 24, 0.92)',
                            border: '1px solid rgba(248,250,252,0.12)',
                            borderRadius: '12px'
                          }}
                        />
                        <Line type="monotone" dataKey="grossRevenue" stroke="#f4b41a" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="netRevenue" stroke="#f9d784" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.2em] text-muted">
                        <tr>
                          <th className="pb-3">Fecha</th>
                          <th className="pb-3">Ventas</th>
                          <th className="pb-3">Comisiones</th>
                          <th className="pb-3">Utilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.days.map((day) => (
                          <tr key={day.date} className="border-t border-outline">
                            <td className="py-3 text-muted">{day.date}</td>
                            <td className="py-3">$ {day.grossRevenue.toFixed(2)}</td>
                            <td className="py-3">$ {day.commissions.toFixed(2)}</td>
                            <td className="py-3">$ {day.netRevenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
