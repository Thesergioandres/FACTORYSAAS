# Catálogo de Historias de Usuario - ESSENCE Software Factory

**Proyecto:** ESSENCE Multi-Tenant SaaS Factory
**Fecha:** 2026-03-29

Este documento lista las narrativas de usuario desde la perspectiva de los 4 roles principales (Cliente Final, Especialista/Staff, Dueño/Admin de Tenant, SuperAdmin/GOD).

---

## 📅 Módulo de Agendamiento B2C (Booking Engine)

### US-B01: Reserva de Cita por Cliente
**Como** Cliente habitual, **quiero** seleccionar un servicio, profesional, fecha y hora en la landing pública del negocio, **para** agendar mi cita sin tener que llamar por teléfono.
**Criterios de Aceptación (DoD):**
1. El sistema filtra y muestra solo los profesionales capacitados para el servicio.
2. La disponibilidad de horas cruza correctamente los horarios laborales del profesional, bloqueos manuales y servicios superpuestos.
3. Se recolecta Nombre, Email y Teléfono (WhatsApp) para confirmar.
4. Genera una notificación automática inmediata por WhatsApp.

### US-B02: Cancelación / Reagendamiento
**Como** Cliente, **quiero** acceder a un enlace enviado por WhatsApp para reagendar mi cita, **para** liberar el espacio si me surge un imprevisto.
**Criterios de Aceptación (DoD):**
1. Solo se permite reagendar si está dentro de la ventana de configuración `RESCHEDULE_LIMIT_MINUTES` del Tenant.
2. Si cancela a tiempo, su puntaje de confianza (`Customer Trust System`) no se penaliza.

---

## 👥 Módulo de Operación de Especialistas (Staff Portal)

### US-S01: Visualización de Agenda Personal
**Como** Especialista (ej. Barbero/Médico), **quiero** acceder a mi panel con mi login **para** ver la lista de clientes atendidos y próximos en mi día.
**Criterios de Aceptación (DoD):**
1. El especialista **solo** puede ver sus propias citas (aislamiento de datos entre empleados).
2. La interfaz es React pura e indica alertas visuales si un cliente llega tarde.

### US-S02: Gestión de Estado (No-show)
**Como** Especialista, **quiero** poder marcar a un cliente como "Completado" o "No Asistió", **para** mantener el historial y las penalizaciones al día.
**Criterios de Aceptación (DoD):**
1. Al marcar "No Asistió", el sistema resta automáticamente 10 puntos al perfil del cliente.
2. Si los puntos llegan a 0, las reglas de bloqueo (Blacklist) aplican inmediatamente.

---

## 🏢 Módulo de Administración Local (Tenant Admin)

### US-A01: Onboarding de Tenant
**Como** Dueño de un negocio nuevo, **quiero** completar un formulario inicial con el nombre, colores (hexadecimal) y logo de mi empresa, **para** que mi sistema adquiera automáticamente estilo White-Label.
**Criterios de Aceptación (DoD):**
1. La identidad visual se guarda en el modelo `Tenant` en MongoDB.
2. El frontend utiliza Contextos y variables CSS para inyectar estos colores de inmediato en el subdominio.

### US-A02: Reportes y BI Dashboard
**Como** Dueño de Negocio, **quiero** ver un dashboard en tiempo real de mis ingresos, inasistencias y mejores empleados, **para** tomar decisiones financieras.
**Criterios de Aceptación (DoD):**
1. Los gráficos muestran datos filtrados estrictamente por el `tenantId` actual.
2. Hay opción de exportar el recorte (`reports/daily` o `reports/range`) en formato PDF/CSV.

---

## 🌍 Módulo Central (Portal B2B & SuperAdmin GOD)

### US-G01: Monitoreo Global de Tenants
**Como** SuperAdmin (GOD), **quiero** entrar en `/admin-login` para ver la lista de todos los negocios suscritos a mi Factory, **para** observar el estado de sus suscripciones y salud del cliente.
**Criterios de Aceptación (DoD):**
1. Solo usuarios con rol global Admin (`GOD`) pueden acceder a esta vista.
2. Muestra consumo de mensajería (WhatsApp Logs) aglomerada.

### US-G02: Dunning y Bloqueo de Pagos
**Como** SuperAdmin, **quiero** que el sistema suspenda el acceso al panel administrativo de los Tenants con planes vencidos, **para** asegurar el motor de monetización automático de ESSENCE.
**Criterios de Aceptación (DoD):**
1. Al vencer la suscripción de Pago Mercado Pago, el Tenant cambia a Status = `SUSPENDED`.
2. El sitio público redirige o muestra un cartel de "Mantenimiento temporal" si el Tenant está suspendido.
