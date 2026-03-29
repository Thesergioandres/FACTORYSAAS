# Especificación de Requerimientos y NFRs - ESSENCE Factory

Catálogo maestro de requerimientos funcionales (Características de Software) y no funcionales (Condiciones Operativas/Limitaciones).

---

## 1. Requerimientos Funcionales (FR - Functional Requirements)

### FR-01: Multi-Tenancy Arquitectónico
El sistema DEBE aislar lógicamente todos los datos en MongoDB basados en la llave foránea `tenantId`. Ningún usuario puede invocar información sin pasar por el guardián de dominio B2B.

### FR-02: Generación Dinámica White-Label (B2C)
El sistema Frontend DEBE inyectar variables de enterno SCSS/CSS provistas en la tabla Config del Tenant. El dominio y logos mostrados a clientes deben reflejar las elecciones del proceso de Onboarding del Tenant.

### FR-03: Motor Avanzado de Reservaciones Relacional (Booking)
El proceso de citas cruzará la duración del servicio con parámetros laborales de un Especialista. Si no se puede ofrecer el tiempo completo de X servicio (Ej. 45 min de cita cuando quedan 30 min libres antes del cierre), NO DEBE visualizar la hora.

### FR-04: Customer Trust Score & Motor No-Show
El sistema restará 10 puntos fijos al score de confiabilidad de un cliente final al reportarse inasistencia. Llegar a 0 puntos bloqueará su combinación hash generada con (Email + Teléfono + Nombre) para este Tenant particular de por vida.

### FR-05: RBAC Granular (Staff Security)
A nivel backend (Middlewares / Express), los endpoints de reportes financieros y configuración global de negocio estarán altamente protegidos y arrojarán `403 Forbidden` si un token JWT no detenta permiso `OWNER` / `ADMIN`.

### FR-06: Cron Jobs y Omnicanalidad (Notificaciones)
El servidor Redis gestionará listas de tareas (BullMQ) programando records para disparos asíncronos exactos de recordatorios WhatsApp (1 hora, 30 mins) antes del Timestamp en tiempo real de una cita `startAt`.

---

## 2. Requerimientos No Funcionales (NFR)

### NFR-01: Rendimiento UI y Optimización (Core Web Vitals)
- **Time to Interactive (TTI):** La SPA desarrollada en React / Vite / Tailwind debe asegurar la interacción y pintura inicial del DOM (Landings públicas B2C) en `< 1.5s` en conexión móvil 4G estándar.
- **Rendimiento Visual y Animación:** Se prohíben manipulaciones pesadas del DOM. Las transiciones estéticas de la _Nitidez Essence_ usarán exclusivamente `GSAP` corriendo bajo RAF (Request Animation Frame) o CSS dinámico minimizando repaints.

### NFR-02: Disponibilidad y Elasticidad (Resilience)
- **Uptime de SLA Global:** 99.9% Uptime para el motor de bookings de clientes.
- El backend en NodeJS debe ser Stateless y Dockerizado para autoescalado si se requieren múltiples contenedores concurrentes. (Conexión MongoDB externa persistente).

### NFR-03: Offline Support & Tolerancia a Cortes 
- Sistema de Caja/POS B2B: Los empleados trabajando los terminales (Ej: Meseros) DEBEN poder almacenar la ordenes transaccionales de venta en memoria / LocalStorage momentáneo frente a caídas de red menores, enviando de vuelta los payloads asíncromamente al servidor REST.

### NFR-04: Seguridad & Privacidad (Compliance PTD - ARCO)
- Toda contraseña viaja `bcrypt` (10-salt-rounds max por CPU bounds).
- Se habilitan flujos de borrado (Borrar mis datos ARCO/Right to be forgotten) tanto para Tenants de nuestro SaaS B2B, como de Clientes hacia esos Tenants.
