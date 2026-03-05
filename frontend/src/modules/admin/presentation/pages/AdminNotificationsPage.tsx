import { FormEvent, useEffect, useState } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { AdminNav } from '../components/AdminNav';

type WhatsAppLog = {
  id?: string;
  appointmentId?: string;
  event: string;
  roleTarget: string;
  phone: string;
  status: string;
  error?: string | null;
  createdAt?: string;
};

type AppConfig = {
  minAdvanceMinutes: number;
  cancelLimitMinutes: number;
  rescheduleLimitMinutes: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  reminderMinutes: number[];
  whatsappDebounceSeconds: number;
  whatsappEnabledEvents: Record<string, boolean>;
  whatsappTemplates: Record<string, string>;
};

type LogRowData = {
  logs: WhatsAppLog[];
};

function LogRow({ index, style, data }: ListChildComponentProps<LogRowData>) {
  const log = data.logs[index];
  return (
    <div style={style} className="px-1">
      <div className="rounded-xl border border-white/10 bg-black/40 p-2">
        <p>{log.event} · {log.status}</p>
        <p className="text-zinc-400">{log.phone} · {log.roleTarget}</p>
        {log.error ? <p className="text-red-300">{log.error}</p> : null}
      </div>
    </div>
  );
}

export function AdminNotificationsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
    const shouldVirtualize = logs.length > 100;
  const [error, setError] = useState<string | null>(null);
  const [remindersInput, setRemindersInput] = useState('120,1440');

  const loadData = async () => {
    try {
      const [configData, logsData] = await Promise.all([
        apiRequest<AppConfig>('/notifications/config'),
        apiRequest<WhatsAppLog[]>('/notifications/logs')
      ]);
      setConfig(configData);
      setLogs(logsData);
      setRemindersInput(configData.reminderMinutes.join(','));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar configuracion');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!config) return;

    const reminderMinutes = remindersInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);

    try {
      const updated = await apiRequest<AppConfig>('/notifications/config', {
        method: 'PATCH',
        body: JSON.stringify({
          ...config,
          reminderMinutes
        })
      });
      setConfig(updated);
      setRemindersInput(updated.reminderMinutes.join(','));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar configuracion');
    }
  };

  const toggleEvent = (eventName: string) => {
    if (!config) return;
    setConfig({
      ...config,
      whatsappEnabledEvents: {
        ...config.whatsappEnabledEvents,
        [eventName]: !config.whatsappEnabledEvents[eventName]
      }
    });
  };

  const updateTemplate = (eventName: string, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      whatsappTemplates: {
        ...config.whatsappTemplates,
        [eventName]: value
      }
    });
  };

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Notificaciones WhatsApp</h2>
        <p className="section-subtitle">Configura eventos, recordatorios y horarios silenciosos.</p>
      </header>

      <AdminNav />

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      {config ? (
        <form className="app-card space-y-4" onSubmit={handleSave}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Minutos de anticipacion
              <input
                className="input-field mt-2"
                type="number"
                value={config.minAdvanceMinutes}
                onChange={(event) => setConfig({ ...config, minAdvanceMinutes: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Limite cancelacion (min)
              <input
                className="input-field mt-2"
                type="number"
                value={config.cancelLimitMinutes}
                onChange={(event) => setConfig({ ...config, cancelLimitMinutes: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Limite reprogramacion (min)
              <input
                className="input-field mt-2"
                type="number"
                value={config.rescheduleLimitMinutes}
                onChange={(event) => setConfig({ ...config, rescheduleLimitMinutes: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Horas silenciosas (inicio)
              <input
                className="input-field mt-2"
                value={config.quietHoursStart}
                onChange={(event) => setConfig({ ...config, quietHoursStart: event.target.value })}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Horas silenciosas (fin)
              <input
                className="input-field mt-2"
                value={config.quietHoursEnd}
                onChange={(event) => setConfig({ ...config, quietHoursEnd: event.target.value })}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Recordatorios (min separados por coma)
              <input
                className="input-field mt-2"
                value={remindersInput}
                onChange={(event) => setRemindersInput(event.target.value)}
              />
            </label>
            <label className="text-sm text-zinc-300">
              Debounce WhatsApp (segundos)
              <input
                className="input-field mt-2"
                type="number"
                min={0}
                value={config.whatsappDebounceSeconds}
                onChange={(event) => setConfig({ ...config, whatsappDebounceSeconds: Number(event.target.value) })}
              />
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Eventos habilitados</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(config.whatsappEnabledEvents).map((eventName) => (
                <button
                  key={eventName}
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs ${config.whatsappEnabledEvents[eventName] ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-200'}`}
                  onClick={() => toggleEvent(eventName)}
                >
                  {eventName}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Plantillas</p>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(config.whatsappTemplates).map(([eventName, template]) => (
                <label key={eventName} className="text-xs text-zinc-400">
                  {eventName}
                  <textarea
                    className="textarea-field mt-2"
                    rows={2}
                    value={template}
                    onChange={(event) => updateTemplate(eventName, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary w-fit" type="submit">
            Guardar configuracion
          </button>
        </form>
      ) : null}

      <div className="app-card">
        <h3 className="text-sm font-semibold">Logs WhatsApp</h3>
        <div className="mt-3 space-y-2 text-xs">
          {shouldVirtualize ? (
            <FixedSizeList
              height={360}
              itemCount={logs.length}
              itemSize={74}
              width="100%"
              itemData={{ logs }}
            >
              {LogRow}
            </FixedSizeList>
          ) : (
            logs.map((log, index) => (
              <div key={`${log.event}-${index}`} className="rounded-xl border border-white/10 bg-black/40 p-2">
                <p>{log.event} · {log.status}</p>
                <p className="text-zinc-400">{log.phone} · {log.roleTarget}</p>
                {log.error ? <p className="text-red-300">{log.error}</p> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
