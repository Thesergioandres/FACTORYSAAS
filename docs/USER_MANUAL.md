# Manual de Usuario - BarberSync

Este documento detalla las funciones disponibles según el Rol del usuario en el sistema.

## 1. Rol Súper Admin (GOD)

Es el dueño absoluto del software SaaS.

- **URL de Acceso:** Accede mediante el menú de "Panel Administrativo" -> "Negocios".
- **Capacidades:**
  - Ver el listado total de todos los Tenants (Barberías) registradas en la plataforma.
  - Ver información de contacto comercial, límites de suscripción y cantidad de sucursales por Tenant.
  - (Próximamente): Suspender, activar o cambiar los planes de facturación de los negocios.
  - Ver métricas globales del sistema.

## 2. Rol Administrador del Negocio (Business Admin)

Es el dueño de la Barbería que ha contratado la plataforma SaaS. Su información siempre estará aislada a su `tenantId`.

- **Capacidades:**
  - **Dashboard:** Visualizar Analíticas Avanzadas de su negocio en tiempo real (Productividad diaria, Retención de Clientes mensual, Tasa de Ocupación).
  - Ver un resumen de volumen de citas organizadas por estado (Pendientes, Confirmadas, Canceladas).
  - **Servicios:** Crear, editar, activar o desactivar los servicios que ofrece su barbería.
  - **Control de Citas:** Cancelar o reprogramar citas a nombre del cliente respetando los tiempos límite (`cancelLimitMinutes`) de configuración de su negocio.

## 3. Rol Barbero (Staff)

Es el empleado del negocio. Su vista está optimizada para la operación diaria.

- **Capacidades:**
  - Ver su calendario diario y el listado de personas que van a llegar.
  - Cambiar el estado de la cita (Ej: Marcar una cita como 'COMPLETADA' o 'NO_ASISTIO').
  - En caso de emergencia, reasignar la cita a otro compañero de la misma sede.
  - Recibir notificaciones remotas vía WhatsApp sobre cambios en su agenda.

## 4. Rol Cliente

Usuario final que consume el servicio de agenda.

- **Capacidades:**
  - Portal de Agendamiento rápido (`/appointments`).
  - Elegir la Sede -> Barbería -> Barbero de Preferencia -> Servicio -> Fecha y Hora.
  - El sistema sólo le mostrará los huecos disponibles, cruzados con los horarios laborales del barbero y el tiempo de "buffer" (descanso) entre corte y corte.
  - Recibir recordatorios automatizados de sus citas previas en WhatsApp.
  - En su Dashboard personal (`/dashboard`), ver el historial de sus cortes y cancelar con antelación si no puede asistir.
