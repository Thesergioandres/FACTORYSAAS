import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../../../shared/infrastructure/http/apiClient';
import { useAuth } from '../../../../shared/context/AuthContext';

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF' | 'CLIENT';
  whatsappConsent: boolean;
};

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const me = await apiRequest<Profile>('/auth/me');
        setProfile(me);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil');
      }
    }

    load();
  }, []);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setError(null);
    try {
      const updated = await apiRequest<Profile>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          whatsappConsent: profile.whatsappConsent
        })
      });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    }
  };

  if (!user) {
    return (
      <section className="app-card">
        <h2 className="section-title">Perfil</h2>
        <p className="section-subtitle">Inicia sesion para gestionar tu perfil.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="app-card">
        <h2 className="section-title">Mi perfil</h2>
        <p className="section-subtitle">Actualiza tus datos y consentimiento.</p>
      </header>

      {error ? <p className="app-card-soft text-red-200">{error}</p> : null}

      {profile ? (
        <form className="app-card grid gap-4 md:max-w-2xl" onSubmit={handleSave}>
          <label className="text-xs text-zinc-400">
            Nombre
            <input
              className="input-field mt-2"
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            />
          </label>
          <label className="text-xs text-zinc-400">
            Telefono
            <input
              className="input-field mt-2"
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={profile.whatsappConsent}
              onChange={(event) => setProfile({ ...profile, whatsappConsent: event.target.checked })}
            />
            Acepto recibir WhatsApp
          </label>
          <button className="btn-primary w-fit" type="submit">
            Guardar cambios
          </button>
        </form>
      ) : null}
    </section>
  );
}
