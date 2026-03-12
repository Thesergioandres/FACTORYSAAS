import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from '../../shared/animations/gsapConfig';
import { useAuth } from '../../shared/context/AuthContext';
import { apiRequest } from '../../shared/infrastructure/http/apiClient';

type BusinessProfileForm = {
  slug: string;
  name: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
};

const initialForm: BusinessProfileForm = {
  slug: '',
  name: '',
  phone: '',
  address: '',
  logoUrl: '',
  primaryColor: '#00F0FF'
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<BusinessProfileForm>(initialForm);

  const tenantId = user?.tenantId;

  useEffect(() => {
    if (!cardRef.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-onboarding-step]',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }
      );
    }, cardRef);

    return () => context.revert();
  }, [step]);

  useEffect(() => {
    if (!tenantId) return;
    let active = true;
    setLoadingProfile(true);

    apiRequest<{ name?: string; slug?: string; phone?: string; businessProfile?: Partial<BusinessProfileForm> }>(`/tenants/${tenantId}`)
      .then((tenant) => {
        if (!active) return;
        const profile = tenant.businessProfile || {};
        setForm((prev) => ({
          ...prev,
          slug: profile.slug || tenant.slug || prev.slug,
          name: profile.name || tenant.name || prev.name,
          phone: profile.phone || tenant.phone || prev.phone,
          address: profile.address || prev.address,
          logoUrl: profile.logoUrl || prev.logoUrl,
          primaryColor: profile.primaryColor || prev.primaryColor
        }));
      })
      .catch(() => {
        if (!active) return;
        setError('No se pudo cargar la configuracion inicial de tu negocio.');
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [tenantId]);

  const canContinueStep1 = useMemo(() => {
    return Boolean(form.slug.trim() && form.name.trim() && form.phone.trim() && form.address.trim());
  }, [form.slug, form.name, form.phone, form.address]);

  const updateField = (field: keyof BusinessProfileForm) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !prev.slug) {
        next.slug = normalizeSlug(value);
      }
      return next;
    });
  };

  const goToStep2 = () => {
    setError(null);
    if (!canContinueStep1) {
      setError('Completa los datos de contacto para continuar.');
      return;
    }
    setForm((prev) => ({ ...prev, slug: normalizeSlug(prev.slug) }));
    setStep(2);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!tenantId) {
      setError('No encontramos el tenant activo para completar el onboarding.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest(`/tenants/${tenantId}/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          slug: normalizeSlug(form.slug),
          primaryColor: form.primaryColor.toUpperCase()
        })
      });
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'No fue posible guardar el perfil de negocio.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5">
      <header className="app-card">
        <p className="app-chip">White Label Engine</p>
        <h1 className="mt-4 text-3xl font-semibold">Configura tu marca en 2 pasos</h1>
        <p className="mt-2 text-sm text-muted">
          Este onboarding define la identidad publica que veran tus clientes en tu landing B2C.
        </p>
      </header>

      <form ref={cardRef} className="app-card space-y-5" onSubmit={submit}>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted">
          <span className={step === 1 ? 'text-primary' : ''}>Paso 1 Contacto</span>
          <span>/</span>
          <span className={step === 2 ? 'text-primary' : ''}>Paso 2 Identidad visual</span>
        </div>

        {error ? <p className="text-sm text-secondary">{error}</p> : null}
        {loadingProfile ? <p className="text-sm text-muted">Cargando datos del tenant...</p> : null}

        {step === 1 ? (
          <div data-onboarding-step className="grid gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-1">
              Slug publico
              <input
                className="input-field mt-2"
                value={form.slug}
                onChange={(event) => updateField('slug')(event.target.value)}
                placeholder="ink-master-bogota"
                required
              />
            </label>
            <label className="text-sm md:col-span-1">
              Nombre del negocio
              <input
                className="input-field mt-2"
                value={form.name}
                onChange={(event) => updateField('name')(event.target.value)}
                placeholder="Ink Master Bogota"
                required
              />
            </label>
            <label className="text-sm md:col-span-1">
              Telefono
              <input
                className="input-field mt-2"
                value={form.phone}
                onChange={(event) => updateField('phone')(event.target.value)}
                placeholder="+57 300 123 4567"
                required
              />
            </label>
            <label className="text-sm md:col-span-1">
              Direccion
              <input
                className="input-field mt-2"
                value={form.address}
                onChange={(event) => updateField('address')(event.target.value)}
                placeholder="Calle 85 #15-32, Bogota"
                required
              />
            </label>

            <div className="md:col-span-2 flex justify-end">
              <button className="btn-primary" type="button" onClick={goToStep2}>
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <div data-onboarding-step className="grid gap-4 md:grid-cols-2">
            <label className="text-sm md:col-span-2">
              Logo URL
              <input
                className="input-field mt-2"
                value={form.logoUrl}
                onChange={(event) => updateField('logoUrl')(event.target.value)}
                placeholder="https://cdn.tu-marca.com/logo.png"
              />
            </label>
            <label className="text-sm md:col-span-1">
              Color primario (#RRGGBB)
              <input
                className="input-field mt-2"
                value={form.primaryColor}
                onChange={(event) => updateField('primaryColor')(event.target.value)}
                placeholder="#16A34A"
                required
              />
            </label>
            <div className="md:col-span-1 rounded-xl border p-3" style={{ borderColor: 'var(--outline)' }}>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Preview de marca</p>
              <div className="mt-3 h-10 rounded-lg" style={{ backgroundColor: form.primaryColor || '#00F0FF' }} />
            </div>

            <div className="md:col-span-2 flex flex-wrap justify-between gap-3">
              <button className="btn-secondary" type="button" onClick={() => setStep(1)}>
                Volver
              </button>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Finalizar y abrir dashboard'}
              </button>
            </div>
          </div>
        )}
      </form>
    </section>
  );
}
