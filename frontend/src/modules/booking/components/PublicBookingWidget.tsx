import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '../../../shared/animations/gsapConfig';
import {
  useBookingFlow,
  type BookingStep,
  type ServiceOption,
  type StaffOption,
  type StaffSchedule
} from '../../booking/hooks/useBookingFlow';

type PublicBookingWidgetProps = {
  tenantId: string;
  tenantName?: string;
  branchId?: string;
  logoUrl?: string;
};

const STEP_LABELS: Record<BookingStep, string> = {
  SERVICE: 'Servicio',
  PROFESSIONAL: 'Profesional',
  DATETIME: 'Fecha y hora',
  CLIENT_DATA: 'Tus datos'
};

const STEP_ICONS: Record<BookingStep, string> = {
  SERVICE: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  PROFESSIONAL: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  DATETIME: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  CLIENT_DATA: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function generateTimeSlots(schedule: StaffSchedule): string[] {
  const slots: string[] = [];
  const [sh, sm] = schedule.startTime.split(':').map(Number);
  const [eh, em] = schedule.endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;

  while (current + 30 <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += 30;
  }
  return slots;
}

function getNext7Days(): { label: string; value: string; dayOfWeek: number }[] {
  const result = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    result.push({
      label: `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
      value: d.toISOString().slice(0, 10),
      dayOfWeek: d.getDay()
    });
  }
  return result;
}

export function PublicBookingWidget({
  tenantId,
  tenantName,
  branchId,
  logoUrl
}: PublicBookingWidgetProps) {
  const flow = useBookingFlow(tenantId, branchId);

  const containerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // ── GSAP: Step transition (slide) ────────────────────
  const animateStepTransition = useCallback((direction: 'forward' | 'back') => {
    if (!stepContentRef.current) return;
    const xFrom = direction === 'forward' ? 60 : -60;
    gsap.fromTo(
      stepContentRef.current,
      { x: xFrom, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  }, []);

  // Animate on step change
  useEffect(() => {
    animateStepTransition('forward');
  }, [flow.state.step]);

  // ── GSAP: Progress bar ───────────────────────────────
  useEffect(() => {
    if (!progressBarRef.current) return;
    gsap.to(progressBarRef.current, {
      width: `${flow.progress}%`,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, [flow.progress]);

  // ── GSAP: Success screen ─────────────────────────────
  useEffect(() => {
    if (!flow.isSuccess || !successRef.current) return;
    const children = Array.from(successRef.current.children) as HTMLElement[];
    gsap.fromTo(
      children,
      { y: 30, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.12,
        ease: 'back.out(1.7)'
      }
    );
  }, [flow.isSuccess]);

  // ── Handlers with animation ──────────────────────────
  const handleBack = useCallback(() => {
    if (!stepContentRef.current) {
      flow.goBack();
      return;
    }
    gsap.to(stepContentRef.current, {
      x: 60,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        flow.goBack();
      }
    });
  }, [flow]);

  const handleSelectService = useCallback(
    (service: ServiceOption) => {
      if (!stepContentRef.current) {
        flow.selectService(service);
        return;
      }
      gsap.to(stepContentRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => flow.selectService(service)
      });
    },
    [flow]
  );

  const handleSelectStaff = useCallback(
    (staff: StaffOption) => {
      if (!stepContentRef.current) {
        flow.selectStaff(staff);
        return;
      }
      gsap.to(stepContentRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => flow.selectStaff(staff)
      });
    },
    [flow]
  );

  const handleSelectDateTime = useCallback(
    (date: string, time: string) => {
      if (!stepContentRef.current) {
        flow.selectDateTime(date, time);
        return;
      }
      gsap.to(stepContentRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => flow.selectDateTime(date, time)
      });
    },
    [flow]
  );

  // ── Success screen ───────────────────────────────────
  if (flow.isSuccess && flow.submitResult) {
    return (
      <div ref={containerRef} className="mx-auto max-w-xl">
        <div
          ref={successRef}
          className="app-card relative overflow-hidden p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.06), rgba(138,43,226,0.04) 60%, rgba(10,15,30,0.8))'
          }}
        >
          {/* Checkmark */}
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(138,43,226,0.1))',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 30px rgba(0,240,255,0.2)'
            }}
          >
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          {/* Message */}
          <h2
            className="mt-6 text-2xl font-bold"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            <span className="brand-gradient-text">¡Reserva confirmada!</span>
          </h2>
          <p className="mt-3 text-sm text-muted">
            {flow.submitResult.message}
          </p>

          {/* Trust points badge */}
          <div
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2"
            style={{
              borderColor: 'rgba(0,240,255,0.4)',
              background: 'rgba(0,240,255,0.06)'
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
              +{flow.submitResult.trustPoints} Puntos de Confianza
            </span>
          </div>

          {/* CTA */}
          <button
            className="btn-primary mt-8 w-full justify-center"
            type="button"
            onClick={flow.reset}
          >
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  // ── Date/time state for step 3 ───────────────────────
  const availableDays = getNext7Days();
  const selectedDayOfWeek = flow.state.selectedDate
    ? new Date(flow.state.selectedDate + 'T12:00:00').getDay()
    : -1;
  const matchingSchedule = flow.schedules.find((s) => s.dayOfWeek === selectedDayOfWeek);
  const timeSlots = matchingSchedule ? generateTimeSlots(matchingSchedule) : [];
  const scheduleDaysSet = new Set(flow.schedules.map((s) => s.dayOfWeek));

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl">
      <div
        className="app-card relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,30,0.75), rgba(10,15,30,0.9))'
        }}
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center gap-4 pb-6">
          {logoUrl ? (
            <img src={logoUrl} alt={tenantName || ''} className="h-12 w-12 rounded-xl object-cover border border-white/10" />
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{tenantName || 'Reserva tu cita'}</p>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              <span className="brand-gradient-text">Motor de reservas</span>
            </h2>
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {(['SERVICE', 'PROFESSIONAL', 'DATETIME', 'CLIENT_DATA'] as BookingStep[]).map((step, idx) => {
              const isCurrent = step === flow.state.step;
              const isPast = idx < flow.currentIndex;
              return (
                <button
                  key={step}
                  type="button"
                  className="flex flex-col items-center gap-1 transition-all duration-200"
                  style={{ opacity: isCurrent ? 1 : isPast ? 0.7 : 0.3 }}
                  onClick={() => isPast ? flow.goToStep(step) : undefined}
                  disabled={!isPast}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300"
                    style={{
                      borderColor: isCurrent ? 'var(--primary)' : isPast ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
                      backgroundColor: isPast ? 'var(--primary)' : 'transparent',
                      boxShadow: isCurrent ? '0 0 16px rgba(0,240,255,0.3)' : 'none'
                    }}
                  >
                    {isPast ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={isPast ? '#0A0F1E' : 'currentColor'} strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={STEP_ICONS[step]} />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider hidden sm:block">{STEP_LABELS[step]}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <div
              ref={progressBarRef}
              className="h-full rounded-full"
              style={{
                width: '25%',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary, #8A2BE2))',
                boxShadow: '0 0 12px rgba(0,240,255,0.4)'
              }}
            />
          </div>
        </div>

        {/* ── Step Content ──────────────────────────── */}
        <div ref={stepContentRef} className="min-h-[280px]">
          {/* STEP 1: Services */}
          {flow.state.step === 'SERVICE' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">¿Qué servicio necesitas?</h3>
              <p className="text-xs text-muted">Selecciona el servicio que deseas agendar.</p>
              {flow.servicesLoading ? (
                <div className="flex items-center gap-3 py-8">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                  <span className="text-sm text-muted">Cargando servicios...</span>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {flow.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className="group rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        borderColor: 'rgba(255,255,255,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <p className="text-sm font-semibold">{service.name}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                        <span>${service.price.toLocaleString()}</span>
                        <span>·</span>
                        <span>{service.durationMinutes} min</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Professional */}
          {flow.state.step === 'PROFESSIONAL' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Elige tu profesional</h3>
              <p className="text-xs text-muted">
                Para: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{flow.state.selectedService?.name}</span>
              </p>
              {flow.staffLoading ? (
                <div className="flex items-center gap-3 py-8">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                  <span className="text-sm text-muted">Cargando profesionales...</span>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {flow.staff.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleSelectStaff(member)}
                      className="group flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        borderColor: 'rgba(255,255,255,0.08)',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)' }}>
                        <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{member.name}</p>
                        <p className="text-xs text-muted capitalize">{member.role.toLowerCase()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DateTime */}
          {flow.state.step === 'DATETIME' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selecciona fecha y hora</h3>
              <p className="text-xs text-muted">
                Con: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{flow.state.selectedStaff?.name}</span>
              </p>

              {flow.schedulesLoading ? (
                <div className="flex items-center gap-3 py-8">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
                  <span className="text-sm text-muted">Cargando disponibilidad...</span>
                </div>
              ) : (
                <>
                  {/* Date pills */}
                  <div>
                    <p className="text-xs text-muted mb-2 uppercase tracking-wider">Fecha</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {availableDays.map((day) => {
                        const isAvailable = scheduleDaysSet.has(day.dayOfWeek);
                        const isSelected = flow.state.selectedDate === day.value;
                        return (
                          <button
                            key={day.value}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              flow.selectDateTime(day.value, '');
                              flow.goToStep('DATETIME');
                            }}
                            className="shrink-0 rounded-xl border px-4 py-3 text-center transition-all duration-200"
                            style={{
                              borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                              backgroundColor: isSelected ? 'rgba(0,240,255,0.08)' : 'transparent',
                              opacity: isAvailable ? 1 : 0.25,
                              boxShadow: isSelected ? '0 0 16px rgba(0,240,255,0.15)' : 'none'
                            }}
                          >
                            <p className="text-xs font-semibold">{day.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  {flow.state.selectedDate && (
                    <div>
                      <p className="text-xs text-muted mb-2 uppercase tracking-wider">Hora</p>
                      {timeSlots.length === 0 ? (
                        <p className="text-sm text-muted py-4">No hay horarios disponibles para este día.</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {timeSlots.map((time) => {
                            const isSelected = flow.state.selectedTime === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => handleSelectDateTime(flow.state.selectedDate, time)}
                                className="rounded-lg border px-3 py-2 text-center text-sm font-medium transition-all duration-200"
                                style={{
                                  borderColor: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                  backgroundColor: isSelected ? 'rgba(0,240,255,0.1)' : 'transparent',
                                  color: isSelected ? 'var(--primary)' : 'inherit',
                                  boxShadow: isSelected ? '0 0 12px rgba(0,240,255,0.2)' : 'none'
                                }}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 4: Client data */}
          {flow.state.step === 'CLIENT_DATA' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Completa tus datos</h3>
              <p className="text-xs text-muted">Solo necesitamos lo básico para confirmar tu cita.</p>

              <div className="grid gap-3">
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Nombre completo</label>
                  <input
                    className="input-field mt-1"
                    placeholder="Tu nombre"
                    value={flow.state.clientData.clientName}
                    onChange={(e) => flow.updateClientData('clientName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Email</label>
                  <input
                    className="input-field mt-1"
                    type="email"
                    placeholder="tu@email.com"
                    value={flow.state.clientData.clientEmail}
                    onChange={(e) => flow.updateClientData('clientEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Teléfono</label>
                  <input
                    className="input-field mt-1"
                    type="tel"
                    placeholder="+57 300 000 0000"
                    value={flow.state.clientData.clientPhone}
                    onChange={(e) => flow.updateClientData('clientPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider">Notas (opcional)</label>
                  <textarea
                    className="textarea-field mt-1"
                    rows={2}
                    placeholder="Indicaciones especiales..."
                    value={flow.state.clientData.notes || ''}
                    onChange={(e) => flow.updateClientData('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <p className="text-xs uppercase tracking-wider text-muted mb-2">Resumen de tu cita</p>
                <div className="grid gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Servicio</span>
                    <span className="font-semibold">{flow.state.selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Profesional</span>
                    <span className="font-semibold">{flow.state.selectedStaff?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Fecha</span>
                    <span className="font-semibold">{flow.state.selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Hora</span>
                    <span className="font-semibold">{flow.state.selectedTime}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                    <span className="text-muted">Total</span>
                    <span className="font-bold brand-gradient-text">
                      ${flow.state.selectedService?.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {flow.submitError ? (
                <p className="text-sm text-secondary">{flow.submitError}</p>
              ) : null}
            </div>
          )}
        </div>

        {/* ── Footer: Navigation ────────────────────── */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-5">
          <button
            className="btn-ghost"
            type="button"
            onClick={handleBack}
            disabled={flow.isFirstStep}
            style={{ opacity: flow.isFirstStep ? 0.3 : 1 }}
          >
            ← Atrás
          </button>

          {flow.isLastStep ? (
            <button
              className="btn-primary"
              type="button"
              onClick={flow.submitBooking}
              disabled={!flow.canAdvance || flow.isSubmitting}
            >
              {flow.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Reservando...
                </span>
              ) : (
                '✨ Confirmar reserva'
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
