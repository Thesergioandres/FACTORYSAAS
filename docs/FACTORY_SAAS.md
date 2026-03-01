# Barberia Factory SaaS - Documentacion Completa

## 1. Vision General
Plataforma SaaS multi-tenant para barberias y negocios de cuidado personal. Gestiona agenda, usuarios por rol, servicios, notificaciones WhatsApp y reportes. El sistema funciona como monorepo con frontend React y backend Node/Express, comunicados por API REST.

### Objetivos de Producto
- Operar multiples negocios en un solo despliegue con aislamiento por tenant.
- Automatizar el onboarding (provisioning) de nuevos negocios.
- Controlar limites por plan (sedes, barberos, citas mensuales).
- Permitir white-label con marca y colores por tenant.
- Centralizar notificaciones y recordatorios via WhatsApp.

---

## 2. Arquitectura General

### Topologia
- Frontend SPA: React + Vite.
- Backend API REST: Node + Express + TypeScript.
- Persistencia: MongoDB (principal) con fallback en memoria.
- Background jobs: Redis + BullMQ (opcional).

### Multi-Tenancy
- Cada request se contextualiza por `tenantId` incluido en el JWT.
- Repositorios filtran por `tenantId`.
- Frontend resuelve tenant por subdominio y aplica branding dinamico.

---

## 3. Backend

### 3.1 Stack
- Node.js >= 18
- Express 4
- TypeScript
- MongoDB + Mongoose
- Redis + BullMQ
- JWT + bcrypt
- Swagger (base configurada)

### 3.2 Arquitectura (Hexagonal)
Cada modulo sigue la separacion:
- `domain`: entidades y reglas de negocio
- `application`: casos de uso
- `infrastructure`: adaptadores (Mongo, JWT, providers)
- `interfaces`: controladores y rutas HTTP

### 3.3 Modulos
- **auth**: login, tokens, reset de password.
- **users**: CRUD, roles, aprobaciones.
- **tenants**: datos del negocio, branding, plan, status.
- **plans**: planes globales y limites.
- **branches**: sedes por tenant.
- **services**: catalogo de servicios.
- **barbers**: horarios y bloqueos.
- **appointments**: reservas, cancelacion, reprogramacion.
- **notifications**: WhatsApp, logs, configuracion.
- **reports**: resumenes operativos.

### 3.4 Entidades Principales
- **Plan**
  - name, price
  - maxBranches, maxBarbers, maxMonthlyAppointments
  - features[]
- **Tenant**
  - name, slug, subdomain
  - planId, status (trial|active|suspended)
  - customColors { primary, secondary }
  - logoUrl
  - config (reglas de agenda y notificaciones)
- **Branch**
  - tenantId, name, address, phone, active
- **User**
  - role: GOD|ADMIN|BARBER|CLIENT
  - tenantId, branchIds
  - approved, whatsappConsent
- **Appointment**
  - tenantId, branchId
  - clientId, barberId, serviceId
  - startAt, endAt, status
- **WhatsAppLog**
  - tenantId, event, roleTarget, phone, status

### 3.5 Provisioning Engine (FactoryService)
Cuando se registra un TENANT_ADMIN:
1) Se crea el Tenant con Plan Trial por defecto.
2) Se crea la primera sede (Branch).
3) Se crea el usuario ADMIN asociado al tenant.
4) Se inicializa `appConfig` con valores estandar.

### 3.6 Gatekeeper de Limites
Middleware global que valida limites antes de crear recursos:
- Antes de crear **BARBER**, valida `maxBarbers` del plan.
- Antes de crear **BRANCH**, valida `maxBranches` del plan.
- Respuesta 403: "Has alcanzado el limite de tu plan. Actualiza a Pro para continuar".

### 3.7 Notificaciones WhatsApp
- Provider mock o BullMQ.
- `tenantId` viaja en cada job.
- Logs persistidos por tenant.
- Quiet hours y debounce configurables.

---

## 4. Frontend

### 4.1 Stack
- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- React Router 7
- Framer Motion

### 4.2 Clean Architecture
- `domain`: modelos y contratos
- `application`: casos de uso
- `infrastructure`: clientes API
- `presentation`: paginas y componentes

### 4.3 White-Label
- TenantProvider resuelve tenant (subdominio o contexto).
- Inyecta colores dinamicos via CSS variables.
- Header, botones y layout se adaptan por tenant.

### 4.4 Rutas Principales
Publicas:
- /login
- /register
- /password
- /waiting

Cliente:
- /client
- /profile

Barbero:
- /barber

Admin:
- /admin
- /admin/users
- /admin/services
- /admin/appointments
- /admin/agenda
- /admin/notifications
- /admin/reports
- /admin/tenants (solo GOD)
- /admin/approvals (solo GOD)

---

## 5. API REST (Resumen)

### Auth
- POST /auth/login
- GET /auth/me
- POST /auth/password/forgot
- POST /auth/password/reset

### Users
- GET /users (ADMIN)
- POST /users/register
- POST /users/register-tenant
- POST /users/admin (ADMIN)
- GET /users/pending (GOD)
- PATCH /users/:id/approve (GOD)
- PATCH /users/:id
- PATCH /users/:id/whatsapp-consent
- PATCH /users/me
- GET /users/public/barbers

### Tenants (GOD)
- GET /tenants
- GET /tenants/metrics
- GET /tenants/usage/whatsapp
- GET /tenants/slug/:slug
- GET /tenants/:id

### Plans (GOD)
- GET /plans
- PATCH /plans/:id

### Branches
- GET /branches (ADMIN)
- POST /branches (ADMIN)

### Services
- GET /services
- POST /services (ADMIN)
- PATCH /services/:id (ADMIN)

### Barbers
- GET /barbers/:barberId/schedules
- POST /barbers/:barberId/schedules
- GET /barbers/:barberId/blocks
- POST /barbers/:barberId/blocks

### Appointments
- GET /appointments
- POST /appointments
- PATCH /appointments/:id/status
- POST /appointments/:id/cancel
- POST /appointments/:id/reschedule
- POST /appointments/:id/reassign
- GET /appointments/:id/history

### Notifications
- GET /notifications/logs
- GET /notifications/config
- PATCH /notifications/config

### Reports
- GET /reports/summary

---

## 6. Variables de Entorno

### Backend
- NODE_ENV, PORT
- MONGODB_URI, USE_MONGO
- REDIS_URL, ENABLE_JOBS
- JWT_SECRET, JWT_EXPIRES_IN
- MIN_ADVANCE_MINUTES, CANCEL_LIMIT_MINUTES, RESCHEDULE_LIMIT_MINUTES
- QUIET_HOURS_START, QUIET_HOURS_END
- CORS_ORIGINS

### Frontend
- VITE_API_BASE_URL

---

## 7. Infraestructura y Despliegue

### Docker Compose
Incluye:
- Nginx (proxy)
- Frontend
- Backend
- MongoDB
- Redis
- Mongo Express

### Railway
- Servicios: backend, frontend, mongo, redis
- Deploy hooks para CI/CD

---

## 8. Roles y Flujos

### GOD
- Gestion global de tenants
- Ajuste de planes
- Metricas de conversion y consumo

### ADMIN
- Gestion de usuarios, servicios, agenda y notificaciones

### BARBER
- Gestion de horarios y bloqueos

### CLIENT
- Reservas y gestion de citas

---

## 9. Testing
- Backend: `npm test`
- Build general: `npm run build`

---

## 10. Notas de Evolucion
- Factory SaaS habilita onboarding automatico con plan Trial.
- Gatekeeper evita exceder limites por plan.
- Branding dinamico por tenant en frontend.
- Jobs centralizados con tenantId para trazabilidad.
