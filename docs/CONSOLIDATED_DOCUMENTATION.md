# DOCUMENTACIÓN MAESTRA CONSOLIDADA - ESSENCE SOFTWARE FACTORY

Este documento autogenerado agrupa absolutamente toda la documentación funcional, técnica y arquitectónica del sistema.



---

<!-- INICIO DE ARCHIVO: ALL_DOCUMENTATION.md -->

# ARCHITECTURE.md

# Arquitectura

Fecha: 2026-03-08

## Principios
- Clean Architecture: domain -> application -> infrastructure -> interfaces.
- Multi-tenant: tenantId obligatorio en cada consulta y comando.
- White-label: branding via CSS variables y configuracion por tenant.

## Backend (Node + Express)
- Domain: entidades y reglas (Tenants, Billing, POS, CRM, etc).
- Application: casos de uso y servicios (CreateInvoiceUseCase, TaxCalculatorService).
- Infrastructure: Mongo, InMemory, SSE hubs, terceros.
- Interfaces: rutas HTTP y middlewares.

## Frontend (React)
- shared: layouts, contextos, UI base, infraestructura HTTP.
- modules: features por rol y vertical (admin, staff, landing, hosteleria).

## Flujos clave
- Auth -> JWT -> tenantId en req.auth.
- VerticalRegistry -> rutas dinamicas de landing + temas.
- POS -> venta -> billing (invoice) si status PAGADA.
- Orders -> SSE -> KitchenDisplay.

## Diagramas

### Capas Clean Architecture
```mermaid
flowchart TD
	UI[Interfaces HTTP / UI] --> UC[UseCases / Application]
	UC --> D[Domain]
	UC --> INF[Infrastructure]
	INF --> DB[(Mongo/InMemory)]
```

### Flujo POS -> Billing
```mermaid
sequenceDiagram
	participant UI as UI POS
	participant API as API
	participant POS as POS UseCase
	participant BILL as Billing UseCase
	participant DB as Mongo
	UI->>API: POST /api/pos/sales (PAGADA)
	API->>POS: CreateSaleUseCase
	POS->>DB: store sale
	POS->>BILL: CreateInvoiceUseCase
	BILL->>DB: store invoice
	API-->>UI: sale + invoice
```

### Orders SSE
```mermaid
flowchart LR
	POS[POS] --> API[POST /api/orders]
	API --> HUB[ordersHub]
	HUB --> SSE[SSE Stream]
	SSE --> KITCHEN[KitchenDisplay]
```

---

# BILLING.md

# Billing e impuestos

Fecha: 2026-03-08

## Objetivo
Generar facturas con impuestos segun pais del tenant.

## Entidad
Invoice: subtotal, taxAmount, total, currency, tenantId, country.

## Flujo
- POS crea venta con paymentStatus = PAGADA.
- POS llama CreateInvoiceUseCase.
- TaxCalculatorService aplica tasa por pais.

## Endpoints
- POST /api/billing/invoices (manual)
- POST /api/pos/sales (auto si PAGADA)

## Tenant country
- Campo country en Tenant.
- Default CO si no existe.

## Ejemplo
```bash
curl -X POST http://localhost:4000/api/billing/invoices \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"subtotal":100000,"currency":"COP"}'
```

---

# CHANGELOG.md

# Changelog

## 2026-03-08
- Rutas dinamicas por vertical y pagina 404 con estilo Essence.
- Billing con facturas e impuestos por pais.
- ContentService para copy dinamico en landings.
- SSE de comandas y KitchenDisplay.
- ModuleGuard con upsell card.
- POS con soporte de ordenes a cocina y estado PAGADA.

---

# CONTENT.md

# Content Service (IA placeholder)

Fecha: 2026-03-08

## Objetivo
Generar copy dinamico por vertical sin lorem ipsum.

## Endpoint
- GET /api/content/landing/:verticalId

## Frontend
- DynamicHero consume este endpoint para hero de la landing.

## Ejemplo
```bash
curl http://localhost:4000/api/content/landing/restaurantes
```

---

# DEPLOYMENT.md

# Deploy y configuracion

Fecha: 2026-03-08

## Entorno
- Node >= 18
- MongoDB + Redis (opcional)

## Variables clave
Backend:
- JWT_SECRET
- MONGODB_URI
- USE_MONGO
- REDIS_URL
- ENABLE_JOBS
- MP_* (Mercado Pago)

Frontend:
- VITE_API_BASE_URL

## Notas
- SSE requiere proxy que no bufferice (X-Accel-Buffering: no).
- Service Worker basico en frontend/public/basic-sw.js.

## Checklist de despliegue
- Definir JWT_SECRET seguro.
- Configurar MP_* si se usa Mercado Pago.
- Revisar CORS_ORIGINS para dominios finales.
- Habilitar HTTPS para SSE estable.
- Monitorear logs pino-http.

---

# FACTORY_SAAS.md

# ESSENCE FACTORY SAAS - Documentacion Tecnica para Desarrollo

Fecha: 2026-03-05

## 0. Documentacion extendida
- docs/INDEX.md
- docs/ARCHITECTURE.md
- docs/FEATURES.md
- docs/VERTICALS.md
- docs/REALTIME.md
- docs/BILLING.md
- docs/CONTENT.md
- docs/DEPLOYMENT.md

## 1. Resumen Ejecutivo
Essence Factory SaaS es una plataforma multi-tenant white-label para verticales de servicios. El sistema opera como monorepo con frontend React (SPA) y backend Node/Express, con persistencia en MongoDB y jobs opcionales via Redis/BullMQ. La plataforma ofrece onboarding automatico de negocios, control por planes, branding por tenant y modulos de operacion (agenda, staff, inventario, reportes, WhatsApp).

## 2. Como empezar (dev)

### 2.1 Requisitos
- Node.js >= 18
- Docker Desktop (para Mongo/Redis)
- Git

### 2.2 Configuracion rapida
1) Copia el archivo de entorno:
	- `cp .env.example .env`
2) Define un `JWT_SECRET` seguro (64 bytes hex).
3) Instala dependencias:
	- `npm install`
4) Ejecuta el entorno de desarrollo:
	- `npm run dev`

### 2.3 Alternativa sin Docker
Si no puedes usar Docker, ejecuta:
- `npm run dev:backend:memory`
- `npm run dev:frontend`

### 2.4 Puertos por defecto
- Frontend: http://localhost:5174
- Backend API: http://localhost:4000
- MongoDB: 27017
- Redis: 6379
- Mongo Express: http://localhost:8081

### 2.5 Troubleshooting rapido
- Error `JWT_SECRET es obligatorio`: crea `.env` en la raiz y define `JWT_SECRET`.
- Error Docker pipe (Windows): inicia Docker Desktop.
- Orphan containers: `docker compose up -d --remove-orphans`.

## 3. Arquitectura General

### 3.1 Topologia
- Frontend SPA: React 19 + Vite 6 + Tailwind 4 + React Router 7.
- Backend API REST: Node.js + Express + TypeScript.
- Persistencia: MongoDB (principal) con repositorios in-memory para fallback.
- Jobs: Redis + BullMQ (opcional, controlado por ENABLE_JOBS).
- Hosting: Nginx (en Docker), configuracion local con Vite.

### 3.2 Multi-Tenancy
- `tenantId` viaja en JWT y condiciona consultas.
- Repositorios filtran por `tenantId` en la capa de persistence.
- Frontend resuelve tenant por subdominio y aplica branding con CSS variables.

### 3.3 Capas de Aplicacion
Backend sigue arquitectura hexagonal:
- domain: entidades, reglas y validaciones core.
- application: casos de uso.
- infrastructure: adaptadores (Mongo, Redis, JWT, etc).
- interfaces: rutas HTTP y controladores.

Frontend sigue separacion por modulos:
- shared: contextos, layouts, infraestructura y UI base.
- modules: features por rol (admin, staff, god, landing, onboarding).

### 3.4 Diagramas (arquitectura y flujos)

#### 3.4.1 Flujo general (frontend + backend + datos)
```mermaid
flowchart LR
	U[Usuario] --> UI[Frontend SPA]
	UI --> API[Backend API]
	API --> DB[(MongoDB)]
	API --> R[(Redis)]
	API --> J[Jobs BullMQ]
	API --> W[WhatsApp Provider]
```

#### 3.4.2 Flujo de autenticacion
```mermaid
flowchart TD
	A[Login UI] --> B[POST /auth/login]
	B --> C{Credenciales validas?}
	C -- No --> D[401 + mensaje]
	C -- Si --> E[Genera JWT]
	E --> F[Devuelve token + perfil]
	F --> G[Frontend guarda token]
```

#### 3.4.3 Flujo multi-tenant (request)
```mermaid
flowchart TD
	A[Request] --> B[Middleware Auth]
	B --> C[Extrae tenantId del JWT]
	C --> D[Use Case]
	D --> E[Repositorio filtra por tenantId]
	E --> F[(MongoDB)]
```

#### 3.4.4 Provisioning de tenant
```mermaid
flowchart TD
	A[POST /users/register-tenant] --> B[FactoryService]
	B --> C[Crea Tenant]
	B --> D[Crea Branch inicial]
	B --> E[Crea Admin]
	B --> F[Inicializa config]
	C --> G[(MongoDB)]
	D --> G
	E --> G
	F --> G
```

## 4. Rutas y Hosts

### 4.1 Namespace por host
- domain.com/ -> Landing principal (corporativa, venta del producto).
- domain.com/barberias-landing -> Landing vertical barberias (marketing + planes + login).
- subdominio.domain.com/ -> Software real del cliente (tenant).

### 4.2 Router por contexto
- landing: rutas publicas de marketing y vertical.
- app: rutas internas para roles y paneles.
- tenant: ruta de booking para clientes finales.

## 5. Roles y Jerarquia
- GOD: control global (tenants, planes, metricas, panel GOD).
- ADMIN: operacion del tenant (agenda, staff, inventario, reportes, sedes).
- BARBER: operacion diaria (staff dashboard).
- CLIENT: reserva y acceso al booking.

## 6. Backend

### 6.1 Stack
- Node.js >= 18
- Express 4
- TypeScript
- MongoDB + Mongoose
- Redis + BullMQ (opcional)
- JWT + bcrypt

### 6.2 Modulos
- auth: login, tokens, reset de password.
- users: CRUD de usuarios, registro de cliente, registro de tenant.
- tenants: data del negocio, branding, metrics.
- plans: planes globales y limites.
- branches: sedes por tenant.
- services: catalogo de servicios.
- barbers: horarios y bloqueos.
- appointments: reservas, cambios y reglas de colision.
- notifications: WhatsApp, logs y configuracion.
- reports: resumen diario, rango y comisiones.
- inventory: productos, ventas, reabastecimiento.

### 6.3 Entidades principales
- Plan: name, price, maxBranches, maxBarbers, maxMonthlyAppointments, features.
- Tenant: name, slug, subdomain, planId, status, customColors, logoUrl, config.
- Branch: tenantId, name, address, phone, active.
- User: role, tenantId, branchIds, approved, whatsappConsent, commissionRate.
- Appointment: tenantId, branchId, clientId, barberId, serviceId, startAt, endAt, status.
- Product: tenantId, name, sku, price, stock, costos y restocks.
- WhatsAppLog: tenantId, event, roleTarget, phone, status.

### 6.4 Relaciones de Base de Datos
- Plan 1..n Tenant (Tenant.planId).
- Tenant 1..n Branch (Branch.tenantId).
- Tenant 1..n User (User.tenantId).
- Tenant 1..n Service (Service.tenantId).
- Tenant 1..n Product (Product.tenantId).
- Tenant 1..n Appointment (Appointment.tenantId).
- Tenant 1..n WhatsAppLog (WhatsAppLog.tenantId).
- Branch 1..n Appointment (Appointment.branchId).
- User (BARBER) 1..n Appointment (Appointment.barberId).
- User (CLIENT) 1..n Appointment (Appointment.clientId).
- Service 1..n Appointment (Appointment.serviceId).
- User n..n Branch (User.branchIds).

### 6.4.1 Diagrama de entidades (ER)
```mermaid
erDiagram
	PLAN ||--o{ TENANT : has
	TENANT ||--o{ BRANCH : owns
	TENANT ||--o{ USER : has
	TENANT ||--o{ SERVICE : offers
	TENANT ||--o{ PRODUCT : manages
	TENANT ||--o{ APPOINTMENT : schedules
	TENANT ||--o{ WHATSAPP_LOG : logs
	BRANCH ||--o{ APPOINTMENT : hosts
	USER ||--o{ APPOINTMENT : books
	SERVICE ||--o{ APPOINTMENT : defines
	USER }o--o{ BRANCH : assigned

	PLAN {
		string name
		number price
		number maxBranches
		number maxBarbers
		number maxMonthlyAppointments
	}
	TENANT {
		string name
		string slug
		string subdomain
		string status
		string planId
	}
	BRANCH {
		string tenantId
		string name
		string address
		string phone
	}
	USER {
		string tenantId
		string role
		string[] branchIds
	}
	SERVICE {
		string tenantId
		string name
		number price
	}
	PRODUCT {
		string tenantId
		string name
		string sku
		number price
		number stock
	}
	APPOINTMENT {
		string tenantId
		string branchId
		string clientId
		string barberId
		string serviceId
		datetime startAt
		datetime endAt
	}
	WHATSAPP_LOG {
		string tenantId
		string event
		string roleTarget
		string phone
		string status
	}
```

### 6.5 Provisioning (FactoryService)
Registro tenant:
1) Crea Tenant con plan Trial por defecto.
2) Crea Branch inicial.
3) Crea Admin asociado.
4) Inicializa config de agenda y notificaciones.

### 6.6 Gatekeeper de Planes
Middleware para controlar limites por plan:
- Antes de crear BARBER -> valida maxBarbers.
- Antes de crear BRANCH -> valida maxBranches.

### 6.7 No-shows
- Regla: bloqueo o pago previo despues de N faltas.
- Respuesta 402 con `paymentUrl` para desbloqueo.

### 6.8 Redis y Jobs
- ENABLE_JOBS controla ejecucion de jobs.
- Redis en 6379 por default.
- En dev, si Redis no esta activo, logs pueden aparecer pero no bloquean el API.

## 7. Frontend

### 7.1 Stack
- React 19
- TypeScript
- Vite 6
- Tailwind 4
- React Router 7
- TanStack Query
- Recharts
- React Day Picker

### 7.2 White-Label
- TenantContext resuelve el subdominio.
- Inyecta CSS variables: --primary, --secondary, --logo-url.
- Branding dinamico en layouts y componentes base.

### 7.3 Rutas Principales
Landing:
- / -> landing corporativa.
- /barberias-landing -> vertical barberias.
- /barberias-login -> login duenos y staff.
- /barberias-client-login -> login clientes (con subdominio).
- /admin-login -> login exclusivo GOD.

App:
- /admin
- /admin/agenda
- /admin/team (comisiones)
- /admin/branches
- /admin/whatsapp
- /admin/inventory
- /admin/reports
- /staff
- /god

Tenant:
- / -> booking engine

### 7.4 Login y Roles
- LoginCard valida roles permitidos segun portal.
- GOD solo entra via /admin-login.
- Duenos y staff via /barberias-login.
- Clientes via /barberias-client-login + subdominio.

### 7.5 PWA
- Vite PWA con manifest e iconos personalizados.
- Registro de SW en prod con wrapper para dev.

### 7.6 Flujos UI clave

#### 7.6.1 Login por portal y rol
```mermaid
flowchart TD
	A[Selecciona portal] --> B{Portal}
	B -- Admin/GOD --> C[/admin-login]
	B -- Duenos/Staff --> D[/barberias-login]
	B -- Clientes --> E[/barberias-client-login]
	C --> F[LoginCard valida roles]
	D --> F
	E --> F
	F --> G[AppLayout]
```

#### 7.6.2 Booking publico
```mermaid
flowchart TD
	A[Tenant Public Home] --> B[Selecciona servicio]
	B --> C[Selecciona barber]
	C --> D[Selecciona fecha/hora]
	D --> E[Confirma reserva]
	E --> F[POST /appointments]
	F --> G[Reserva creada]
```

## 8. API REST (Resumen)

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
- GET /reports/daily
- GET /reports/range

### Inventory
- GET /inventory
- POST /inventory
- PATCH /inventory/:id
- DELETE /inventory/:id
- POST /inventory/sales
- POST /inventory/restock

## 9. Variables de Entorno

### 9.1 Backend
- NODE_ENV, PORT
- MONGODB_URI, USE_MONGO
- REDIS_URL, ENABLE_JOBS
- JWT_SECRET, JWT_EXPIRES_IN
- MIN_ADVANCE_MINUTES, CANCEL_LIMIT_MINUTES, RESCHEDULE_LIMIT_MINUTES
- QUIET_HOURS_START, QUIET_HOURS_END
- CORS_ORIGINS
- CLOUDINARY_*
- VAPID_*

### 9.2 Frontend
- VITE_API_BASE_URL

## 10. Build y Dev

### 10.1 Comandos
- npm run dev (monorepo)
- npm run dev -w backend
- npm run dev -w frontend
- npm run build

### 10.2 Notas de Dev
- Vite usa polling en Windows para detectar cambios.
- Backend usa ts-node-dev con polling.
- Redis puede ser opcional en dev.

### 10.3 Flujos operativos (dev)

#### 10.3.1 Boot de entorno (Docker)
```mermaid
flowchart TD
	A[npm run dev] --> B[docker compose up -d redis mongo]
	B --> C[Backend dev]
	B --> D[Frontend dev]
	C --> E[API lista]
	D --> F[UI lista]
```

#### 10.3.2 Boot sin Docker
```mermaid
flowchart TD
	A[npm run dev:backend:memory] --> B[Backend in-memory]
	A2[npm run dev:frontend] --> C[Frontend dev]
	B --> D[API lista]
	C --> E[UI lista]
```

## 11. Seguridad
- JWT con expiracion configurada.
- bcrypt para hashing de password.
- CORS configurado por env.
- Rate limiting activo.

## 12. Observabilidad
- pino-http para logs.
- Swagger base habilitado en /docs.

## 13. Roadmap Tecnico
- Landing SEO por vertical con metadatos dinamicos.
- Dashboard GOD con graficas y uso por ciudad.
- Multi-vertical extensible (restaurantes, gimnasios).

---

# FEATURES.md

# Funcionalidades

Fecha: 2026-03-08

## Core
- Auth + RBAC
- Tenants + branding
- CRM
- Notifications
- Plans
- Reports
- Payments (Mercado Pago)
- Billing (Invoices + impuestos por pais)

## Hospitality (Hosteleria)
- Mesas (tables) + mapa
- POS + ventas
- Kitchen Display (SSE)
- Menu digital (placeholder)

## Legal y compliance
- Consentimiento PTD, Terms, DPA, Cookies, SaaS Agreement.
- ARCO export/delete.

## UI y experiencia
- GSAP para transiciones de ruta y animaciones.
- DynamicBackground + identidad por vertical.
- ModuleGuard con upsell cuando no hay modulo activo.

## Ejemplos rapidos (API)

### POS (venta pagada)
```bash
curl -X POST http://localhost:4000/api/pos/sales \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"items":[{"productId":"p1","name":"Cafe","quantity":1,"price":12}],"paymentMethod":"cash","paymentStatus":"PAGADA","currency":"COP"}'
```

### Orders (cocina)
```bash
curl -X POST http://localhost:4000/api/orders \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"tableLabel":"Mesa 7","items":[{"name":"Hamburguesa","quantity":2}]}'
```

---

# INDEX.md

# ESSENCE Factory - Documentacion Extendida

Fecha: 2026-03-08

Este indice agrupa la documentacion tecnica y funcional creada para el equipo.

## Indice
- ARCHITECTURE.md: arquitectura, capas y contratos principales.
- FEATURES.md: funcionalidades por dominio y UI.
- VERTICALS.md: modelo de verticales y rutas dinamicas.
- REALTIME.md: SSE, Kitchen Display y eventos.
- BILLING.md: facturacion e impuestos por pais.
- CONTENT.md: generador de contenido por vertical.
- DEPLOYMENT.md: despliegue y variables clave.
- ONBOARDING.md: guia de entrada para nuevos devs.
- CHANGELOG.md: resumen de cambios por fecha.

---

# Lo que quiero para la factory.md

📄 Documento de Requerimientos de Producto (PRD) - ESSENCE Software Factory
🎯 1. Objetivo del Proyecto
Desarrollar una plataforma SaaS Multi-Tenant escalable que ofrezca soluciones de software especializadas para múltiples sectores comerciales (verticales). El núcleo de la propuesta de valor es el White-Labeling Dinámico: cada cliente (Tenant) debe percibir y operar el sistema como si fuera un software hecho a la medida, con su propia identidad visual y marca. El sistema debe garantizar altos estándares de estética (Nitidez Essence), velocidad y seguridad estructural.

💰 Modelo de Monetización (Tarifa Universal)
Todos los servicios operarán bajo un modelo de suscripción estándar SaaS:

Plan Mensual: $50.000 COP / mes.

Plan Anual: $500.000 COP / año (Ahorro de 2 meses).

🏗️ 2. Componentes Principales de la Arquitectura
Módulo A: Portal Central de la Factory (B2B Core)
Punto de entrada principal para conocer a ESSENCE como empresa matriz.

Sección Institucional: Información de "Quiénes Somos" y la misión de la Factory.

Vitrina de Verticales: Sección destacada con algunos servicios clave (ej. Barberías, Abogados, Restaurantes) y un botón de "Ver todos los servicios" que redirija a un catálogo completo.

Acceso Administrativo: Login exclusivo y oculto para el equipo interno de administradores (Super Admins de ESSENCE).

Internacionalización (i18n): Selector global de idiomas para traducir toda la plataforma.

Módulo B: Landings Dinámicas por Servicio (Industry Verticals)
Páginas de ventas específicas para cada nicho de mercado.

Diseño Dinámico por Nicho: Cada landing debe tener colores, tipografías y distribución de componentes acordes a su sector (Ej. Barberías: rojo, blanco y negro; Salud: azules limpios y blancos).

Contenido Específico: Módulos que ofrece ese servicio en particular, características, capacidades técnicas y beneficios del sector.

Selector de Idioma Local: Capacidad de cambiar el idioma de la landing actual.

Portal de Acceso (Login): Acceso dedicado para que los Tenants que ya contrataron ese servicio específico puedan entrar a su panel de control.

Módulo C: Motor de Suscripción y Onboarding
El embudo de conversión y recolección de datos del cliente.

Pasarela de Pago: Checkout transparente para procesar los $50.000 COP (Mensual) o $500.000 COP (Anual).

Wizard de Onboarding (Setup de Empresa): Un formulario paso a paso donde el Tenant configura su negocio recién creado:

Nombre de la empresa.

Logotipo corporativo.

Ubicación física (Dirección/Mapa).

Teléfonos de contacto.

Identidad visual (Selección de colores primarios de su marca).

Módulo D: Marca Blanca y Portal Público B2C (El Core del Tenant)
El producto final que el Tenant le entrega a sus propios clientes.

Landing Web Pública del Negocio: Una página web única y funcional generada automáticamente para el Tenant (Ej. essence.com/barberias/corte-fino).

Inyección Dinámica de Marca: La landing pública debe usar el logotipo y los colores hexadecimales configurados en el Onboarding, asegurando que el cliente final solo vea la marca del Tenant y no la de ESSENCE.

Información de Contacto: Visualización clara de la dirección, teléfono, mapa y descripción del negocio.

📅 Módulo E: Motor de Reservas Inteligente y Gestión Operativa (Booking & Staff Engine)
Este módulo es el corazón transaccional para verticales basadas en servicios (Barberías, Spa, Consultorios, etc.). Permite a los clientes finales (B2C) autogestionar sus citas bajo un conjunto estricto de reglas de negocio definidas por el Tenant (B2B).

E.1. Flujo de Agendamiento B2C (Experiencia del Cliente Final)
Selección Parametrizada: El cliente selecciona Fecha, Hora y el Servicio específico que desea (Ej. "Corte + Barba - $25.000 COP").

Filtro Inteligente de Profesionales (Skill-based Routing): El sistema debe cruzar el servicio seleccionado con las habilidades de los empleados. En la lista de selección, solo aparecerán los profesionales capacitados y disponibles en ese horario.

Captura de Leads: Formulario final para confirmar la reserva solicitando: Nombre, Correo Electrónico y Teléfono (WhatsApp).

E.2. Sistema Omnicanal de Notificaciones (White-Label Communications)
Identidad de Envío Remitente: Todas las comunicaciones saldrán utilizando el correo y número de teléfono que el Tenant configuró en el Onboarding. (Nota de UX: Añadir un "Disclaimer" obligatorio en el Onboarding advirtiendo al Tenant sobre el uso de sus datos para este fin).

Cronograma de Disparos Automáticos:

Inmediato: Confirmación de reserva (Email y WhatsApp/SMS).

Día de la cita: Recordatorio en cascada faltando 1 hora, 30 minutos y 5 minutos.

Post-cita: Notificación de inasistencia (No-show) si el cliente no se presenta.

E.3. Motor de Reputación y Fidelización (Customer Trust System)
Puntaje Base: Todo cliente nuevo inicia con un saldo de 100 Puntos de Confianza.

Penalización (No-Show): Si el cliente reserva y no asiste, el sistema deduce automáticamente 10 puntos.

Bloqueo (Blacklist Automática): Si el puntaje llega a 0, el sistema bloquea futuras reservas que coincidan con esa triada de datos (Nombre, Correo o Teléfono).

Recompensas (Loyalty): Asistir a la cita suma 10 puntos, los cuales el Tenant puede configur para canjear por recompensas o descuentos futuros.

E.4. Panel de Configuración B2B (Tenant Dashboard)
Gestión de Catálogo: Creación de servicios con nombre, duración y precio dinámico.

Gestión de Staff y Habilidades: Creación de perfiles de profesionales y asignación de "Servicios Permitidos" (Skills) a cada uno.

Motor de Nómina y Comisiones: Configuración del modelo de pago por profesional. El Tenant debe poder elegir si paga por:

Porcentaje (Ej. 50% del servicio).

Valor Fijo (Ej. $10.000 COP por corte).

Ninguno (Solo salario base externo).

Ajustes de Gamificación: Interfaz para que el Tenant active/desactive el sistema de puntos o modifique las reglas de penalización.

👥 Módulo F: Sistema de Empleados y Roles Operativos (RBAC & Staff Portal)
Este módulo dota al sistema de capacidades de operación multi-usuario dentro de un mismo Tenant. Permite al dueño del negocio (Admin) invitar a su equipo de trabajo, asignando permisos granulares basados en el rol físico que desempeñan en la empresa, garantizando seguridad y eficiencia operativa.

F.1. Portal de Acceso para Empleados (Staff Login)
Login Unificado: Los empleados acceden a través de la misma URL administrativa de su Tenant (Ej. essence.com/login), pero el sistema los enruta automáticamente a su "Espacio de Trabajo" (Workspace) dependiendo de su rol.

Autogestión de Perfil: El empleado puede actualizar su foto de perfil, su contraseña y ver sus métricas personales de rendimiento (si el rol lo permite).

F.2. Tipologías de Roles y Permisos Estrictos (Casos de Uso)
El sistema debe soportar una matriz de permisos. Los roles predeterminados por vertical incluyen:

1. Rol: Especialista / Agendado (Ej. Barbero, Médico, Estilista):

Vistas Permitidas: Calendario personal (Mi Agenda), historial de sus clientes atendidos, reporte de sus comisiones generadas en el día/mes.

Acciones: Puede bloquear espacios en su propia agenda (Ej. "Hora de almuerzo" o "Cita médica personal"), marcar citas como "Completadas" o "No Asistió" (No-show).

Restricciones: No puede ver la agenda de otros compañeros, no puede modificar precios de servicios, no tiene acceso a las finanzas globales del local.

2. Rol: Operativo de Sala / POS (Ej. Mesero, Cajero, Vendedor):

Vistas Permitidas: Mapa de Mesas, Terminal de Punto de Venta (POS), Catálogo de productos.

Acciones: Tomar pedidos, enviar comandas a cocina, cobrar cuentas.

Restricciones: No puede aplicar descuentos mayores al permitido, no puede anular facturas pagadas ni borrar órdenes enviadas sin el PIN de autorización del Administrador.

3. Rol: Operativo de Producción (Ej. Cocinero, Bodeguero):

Vistas Permitidas: Exclusivamente el Monitor de Producción (KDS - Kitchen Display System) o Monitor de Despachos.

Acciones: Cambiar el estado de los tickets ("En preparación" -> "Listo para entregar").

Restricciones: Cero acceso a precios, clientes, agendas o facturación. Interfaz 100% enfocada en la producción.

F.3. Control Administrativo (Tenant Owner)
Gestión de Invitaciones: El dueño puede enviar invitaciones por correo o crear las credenciales directamente para su equipo.

Configuración de Horarios Laborales: El Admin define en qué días y horas trabaja cada especialista (Ej. "Carlos trabaja de Lunes a Viernes de 8am a 4pm"). Esto alimenta directamente la disponibilidad en la Landing Pública B2C.

Botón de Pánico (Kill Switch): Capacidad del dueño de suspender o revocar el acceso a un empleado instantáneamente en caso de despido o emergencia.

📊 Módulo G: Inteligencia de Negocio y Finanzas (BI Dashboard)
El dueño del negocio no solo quiere operar; quiere saber cuánto dinero está ganando. Este módulo es el cerebro financiero del Tenant.

Panel Principal (Dashboard B2B): Gráficos en tiempo real (con React y transiciones suaves) que muestren:

Ingresos brutos del día / semana / mes.

Tasa de inasistencia (No-shows vs. Citas completadas).

Ticket promedio de compra.

Rendimiento del Staff: Un ranking automático donde el dueño pueda ver qué empleado genera más ingresos, quién atiende más rápido y quién tiene más "No-shows".

Exportación de Datos: Capacidad de descargar reportes en CSV/PDF para la contabilidad del Tenant.

💳 Módulo H: Gestión de Suscripciones (El Motor de Cobro de la Factory)
Aquí es donde tú (ESSENCE) aseguras tus $50.000 COP mensuales sin perseguir a la gente.

Facturación Recurrente (Dunning Process): Integración con Mercado Pago (o similar) para el cobro automático a la tarjeta de crédito del Tenant.

Periodo de Gracia y Suspensión: Si el cobro falla (ej. tarjeta sin fondos), el sistema envía 3 correos de advertencia. Al día 5 de impago, el sistema cambia el estado del Tenant a SUSPENDIDO.

Efecto de Suspensión: El Tenant no puede acceder a su panel administrativo y su Landing Pública B2C muestra un mensaje amigable de "Sitio temporalmente en mantenimiento" (para no exponer sus problemas financieros ante sus clientes).

Portal de Facturación (Self-Service): Un apartado donde el Tenant puede actualizar su tarjeta, cambiar del plan Mensual al Anual, y descargar sus facturas de ESSENCE.

🛡️ 3. Requisitos No Funcionales (NFRs) - Reglas para el Equipo de Desarrollo
Esta sección es vital para que tus desarrolladores no comprometan la seguridad ni el rendimiento bajo la "Nitidez Essence".

Aislamiento de Datos Estricto (Multi-Tenancy): Es absolutamente obligatorio que cada consulta a la base de datos (Mongoose) incluya el filtro { tenantId: currentTenantId }. Un error aquí significa que una barbería podría ver las citas de un restaurante.

Arquitectura del Código:

Backend: Arquitectura Hexagonal. Prohibido acoplar la lógica de negocio (Dominio) con Express o Mongoose (Infraestructura).

Frontend: Arquitectura Limpia en Next.js. Uso estricto de Tailwind CSS para el estilizado y GSAP para las micro-interacciones.

Resiliencia Offline (Punto de Venta): Los roles operativos (como cajeros o meseros) deben poder seguir tomando órdenes temporalmente si hay micro-cortes de internet, sincronizando los datos con el servidor al reconectar.

Rendimiento (Core Web Vitals): Las Landings Públicas B2C deben cargar en menos de 1.5 segundos. Deben estar generadas de forma estática (SSG) o con renderizado del lado del servidor (SSR) optimizado para SEO, ya que los Tenants querrán posicionar su marca en Google.

---

# Matriz de Funciones - ESSENCE SOFTWARE FACTORY.md

## 💎 Matriz de Funciones - ESSENCE SOFTWARE FACTORY

Esta matriz define la jerarquia de desarrollo. Ningun desarrollador debe reprogramar una funcion que ya resida en la Capa Core.

---

## 🛡️ Capa 1: Modulos Core (Transversales)
Se programan UNA VEZ. Estan disponibles para las 64 verticales.

| Modulo | Funcionalidad | Responsable |
| --- | --- | --- |
| Auth & RBAC | Registro, login, roles (God, Owner, Staff, Client). | Security Team |
| Payments | Integracion Mercado Pago (Checkout Pro), efectivo, transferencias. | Fintech Team |
| CRM Central | Ficha de cliente, historial unificado, notas y tags. | Core Team |
| Notifications | Motor de WhatsApp (Twilio/API), Email y Push. | DevOps |
| Billing | Generacion de facturas legales y recibos simples. | Legal/Fintech |
| Analytics | Dashboard de KPIs, ventas y reportes de rendimiento. | Data Team |

---

## 🏗️ Capa 2: Modulos Base por Familias
Logica compartida por grupos de industrias. Se reutiliza el motor entre ellas.

### 🧴 Familia: Bienestar (Barberias, Spas, Salones)
- Agenda Inteligente: Bloques de tiempo, servicios y recursos.
- Staff Manager: Turnos, perfiles de empleados y metas.
- Comisiones: Calculo automatico por servicio prestado.

### 🍽️ Familia: Hosteleria (Restaurantes, Bares, Discotecas)
- POS Tactil: Interfaz rapida para comandas y ventas.
- Inventory: Recetas (escandallos), mermas y existencias.
- Multi-Terminal: Sincronizacion entre barra, cocina y mesas.

### 📦 Familia: Retail (Farmacias, Ferreterias, Tiendas)
- Stock Pro: Lotes, fechas de vencimiento y codigos de barras.
- Suppliers: Gestion de proveedores y ordenes de compra.

---

## 💎 Capa 3: Funciones Exclusivas (DNA Especializado)
Aqui es donde el equipo de 7 crea la magia de cada nicho. Son funciones unicas.

| Vertical | Funciones de Alto Valor (Exclusivas) |
| --- | --- |
| Barberias | Tarjeta de sellos virtuales, galeria de cortes (Antes/Despues). |
| Restaurantes | Mapa interactivo de mesas, division de cuentas (Split Bill). |
| Odontologia | Odontograma digital, seguimiento de ortodoncia. |
| Abogados | Custodia de documentos con cifrado, reloj de horas facturables. |
| Veterinarias | Ficha de mascota con carnet de vacunas, geolocalizacion de fincas. |
| Inmobiliarias | Motor de publicacion en portales externos, gestion de llaves. |
| Educacion | Boletin de calificaciones, portal de tareas para padres. |
| Talleres | Historial de mantenimiento por placa, ordenes de trabajo tecnicas. |

---

## 🛠️ Instrucciones para el Equipo de Programadores

**Regla de Oro**
Antes de crear una funcion, revisa si pertenece a la Capa 1. Si vas a pedir el nombre de un cliente, usa el CRM Central, no crees una tabla nueva.

**Logica de Inyeccion**
El archivo `verticalsRegistry.ts` actua como el interruptor. Si una vertical tiene `activeModules: ['pos', 'tables']`, el frontend automaticamente pintara el acceso al Punto de Venta y al Mapa de Mesas.

**Nitidez**
Toda funcion exclusiva debe usar los componentes base de la Factory para que la estetica Cyber-Luxury sea consistente.

---

# ONBOARDING.md

# Onboarding de desarrollo (48h)

Fecha: 2026-03-08

## Dia 1 (0-4h)
- Leer docs/ARCHITECTURE.md y docs/FEATURES.md.
- Levantar entorno con `npm run dev`.
- Verificar login con usuarios demo.

## Dia 1 (4-8h)
- Revisar verticalsRegistry.ts y rutas dinamicas.
- Ejecutar una venta POS y observar factura creada.
- Probar KitchenDisplay con SSE.

## Dia 2 (0-4h)
- Revisar modulos core y sus rutas principales.
- Revisar ModuleGuard y planes activos.

## Dia 2 (4-8h)
- Tomar una tarea pequena y entregar PR.

## Checklist tecnico
- JWT_SECRET definido.
- Mongo/Redis activos o usar modo memory.
- VITE_API_BASE_URL configurado.

## Convenciones
- Codigo en ingles.
- Comentarios y docs en espanol.
- No logica de negocio en controllers.

---

# REALTIME.md

# Real-time (SSE)

Fecha: 2026-03-08

## Orders SSE
- Endpoint: GET /api/orders/stream
- Autenticacion: token JWT por query string (EventSource no envia headers).
- Filtrado: tenantId del JWT.

## Orders POST
- Endpoint: POST /api/orders
- Emite evento al ordersHub con tenantId.

## Frontend
- KitchenDisplay consume SSE y alerta con GSAP.
- AdminKitchenPage expone la UI.

## Ejemplo de conexion SSE
```bash
curl -N "http://localhost:4000/api/orders/stream?token=$TOKEN"
```

---

# verticals-feature-audit.md

# Vertical Feature Audit

## Summary
- Core modules found: Agenda/Appointments, Staff schedules, Services, Inventory, Reports, Notifications (WhatsApp logs/config).
- POS: partial UI (Admin POS) and inventory sales endpoint; no dedicated POS backend routes found.
- Ecommerce: storefront UI lists inventory and client cart; no order/checkout backend routes found.
- Modules not found in codebase: tables, subscriptions, progress_tracking, access_control, accounting, contracts, projects, tasks, assets_management, order_management, shipping_tracking, multi_vendor.

Evidence:
- Agenda/Appointments backend: backend/src/modules/appointments/interfaces/http/appointmentsRoutes.ts
- Staff schedules backend: backend/src/modules/staff/interfaces/http/staffRoutes.ts
- Services backend + UI: backend/src/modules/services/interfaces/http/servicesRoutes.ts, frontend/src/modules/admin/presentation/pages/AdminServicesPage.tsx
- Inventory backend + UI: backend/src/modules/inventory/interfaces/http/inventoryRoutes.ts, frontend/src/modules/admin/pages/AdminInventoryPage.tsx
- POS UI: frontend/src/modules/admin/pages/AdminPOSPage.tsx
- Storefront UI: frontend/src/modules/client/StorefrontPage.tsx
- Reports: backend/src/modules/reports/interfaces/http/reportsRoutes.ts, frontend/src/modules/admin/presentation/pages/AdminReportsPage.tsx
- Notifications: backend/src/modules/notifications/interfaces/http/notificationsRoutes.ts

Legend (Base Modules Coverage)
- Supported: base modules fully mapped to existing backend + UI.
- Partial: some base modules exist (UI only or missing backend routes).
- Not found: base modules not present in codebase.

Feature Coverage
- Not verified: features are listed in registry but no specific implementation found in backend/UI.

## Checklist by Vertical
| Vertical | Base Modules | Coverage | Features |
| --- | --- | --- | --- |
| Barberias | agenda, staff | Supported | Not verified |
| Salones de belleza | agenda, staff | Supported | Not verified |
| Centros de estetica avanzada | agenda, staff | Supported | Not verified |
| Spas y centros de relajacion | agenda, staff | Supported | Not verified |
| Centros de depilacion laser | agenda, staff | Supported | Not verified |
| Restaurantes | tables, pos | Not found | Not verified |
| Discotecas y bares nocturnos | tables, pos | Not found | Not verified |
| Gestor de gastos | accounting, pos | Not found | Not verified |
| Habitos | subscriptions, progress_tracking | Not found | Not verified |
| Veterinarias | agenda, staff | Supported | Not verified |
| Veterinarias de campo | agenda, staff | Supported | Not verified |
| Farmacias | inventory, pos | Partial | Not verified |
| Opticas | inventory, pos | Partial | Not verified |
| Clinicas | agenda, staff | Supported | Not verified |
| Clinicas de odontologia | agenda, staff | Supported | Not verified |
| Consultorios de psicologia | agenda, staff | Supported | Not verified |
| Inventarios y ventas POS | inventory, pos | Partial | Not verified |
| Tiendas agropecuarias | inventory, pos | Partial | Not verified |
| Tiendas de ropa y calzado | inventory, pos | Partial | Not verified |
| Ferreterias | inventory, pos | Partial | Not verified |
| Papelerias y librerias | inventory, pos | Partial | Not verified |
| Tiendas de regalos y floristerias | inventory, pos | Partial | Not verified |
| Tiendas de conveniencia | inventory, pos | Partial | Not verified |
| Colegios o universidades | subscriptions, progress_tracking | Not found | Not verified |
| Academias de idiomas | subscriptions, progress_tracking | Not found | Not verified |
| Escuelas de musica y arte | subscriptions, progress_tracking | Not found | Not verified |
| Bibliotecas y centros culturales | assets_management, subscriptions | Not found | Not verified |
| Tutorias y clases particulares | agenda, staff | Supported | Not verified |
| Autoescuelas | agenda, staff | Supported | Not verified |
| Gimnasios | subscriptions, progress_tracking | Not found | Not verified |
| Servicio fit | subscriptions, progress_tracking | Not found | Not verified |
| Hoteleria | inventory, pos | Partial | Not verified |
| Alquiler vacacional | subscriptions, access_control | Not found | Not verified |
| Camping y glamping | subscriptions, access_control | Not found | Not verified |
| Talleres mecanicos | agenda, staff | Supported | Not verified |
| Despachos de abogados | contracts, projects | Not found | Not verified |
| Estudios contables | accounting, projects | Not found | Not verified |
| Asesores financieros | accounting, projects | Not found | Not verified |
| Gestion de inversiones | accounting, projects | Not found | Not verified |
| Control de creditos | accounting, contracts | Not found | Not verified |
| Arquitectos e ingenieros | projects, tasks | Not found | Not verified |
| Constructoras | projects, tasks | Not found | Not verified |
| Inmobiliarias | contracts, projects | Not found | Not verified |
| Administradores de fincas y edificios | assets_management, contracts | Not found | Not verified |
| Agencias de marketing | projects, tasks | Not found | Not verified |
| Fotografos y videografos | projects, tasks | Not found | Not verified |
| Organizadores de eventos | projects, tasks | Not found | Not verified |
| Mudanzas y fletes | projects, tasks | Not found | Not verified |
| Mensajeria y ultima milla | projects, tasks | Not found | Not verified |
| Gestion de flotas | assets_management, projects | Not found | Not verified |
| Alquiler de vehiculos | assets_management, contracts | Not found | Not verified |
| Parqueaderos | pos, staff | Partial | Not verified |
| Alquiler de mobiliario y sonido | inventory, pos | Partial | Not verified |
| Teatros y cines independientes | pos, inventory | Partial | Not verified |
| Parques de atracciones | pos, inventory | Partial | Not verified |
| Servicios domesticos | agenda, staff | Supported | Not verified |
| Cuidadores de adultos mayores | agenda, staff | Supported | Not verified |
| Paseadores de perros | agenda, staff | Supported | Not verified |
| Reparaciones del hogar | agenda, staff | Supported | Not verified |
| Fincas y cultivos | assets_management, inventory | Not found | Not verified |
| Guias turisticos | agenda, staff | Supported | Not verified |
| Agencias de viajes | projects, staff | Not found | Not verified |
| Tienda en Linea | ecommerce_storefront, shopping_cart | Partial | Not verified |
| Marketplace Multi-Vendedor | ecommerce_storefront, shopping_cart | Partial | Not verified |

---

# VERTICALS.md

# Verticales y rutas dinamicas

Fecha: 2026-03-08

## Vertical Registry
Archivo: frontend/src/shared/constants/verticalsRegistry.ts
- Define slug, name, family, activeModules, baseModules, features, labels y theme.
- El frontend usa esta fuente unica para landings y chips por vertical.

## Rutas
- /landing/:slug (legacy)
- /:verticalId (dinamica por vertical)
- /404 (not found con estilo Essence)

## Notas
- VerticalLandingPage busca vertical por slug o verticalId y redirige a /404 si no existe.
- LandingLayout aplica transicion GSAP por ruta.

## Ejemplo de ruta
- /restaurantes -> carga vertical restaurantes
- /discotecas-bares -> carga vertical discotecas

## Ejemplo de entrada en registry
```ts
{
	slug: 'restaurantes',
	name: 'Restaurantes',
	activeModules: ['tables', 'pos', 'kitchen_display'],
	baseModules: ['tables', 'pos'],
	features: ['Mapa de mesas', 'Comandas a cocina'],
	labels: { staff: 'Mesero', service: 'Plato' },
	theme: { primary: '#F39237', secondary: '#D9381E' }
}
```

---

# RECOMENDACIÓN ESTRUCTURADA POR FAMILIAS DE NEGOCIO

Basado en tu visión de ESSENCE Software Factory y la matriz de funciones que has definido, he analizado cada vertical y los módulos base que propones. A continuación te presento una recomendación estructurada por familias de negocio, incluyendo:

* Módulos Core (transversales, siempre presentes)
* Módulos Base (específicos de la familia)
* Módulos Especializados (ADN de cada vertical)
* Funcionalidades clave que debería tener cada uno

Esta organización te permitirá mantener la coherencia de la plataforma, reutilizar lógica y ofrecer un valor diferencial en cada nicho.

### 🔷 Familias y Verticales con sus Módulos

#### 1. Familia: Bienestar y Estética (Servicios por cita)
**Módulos base comunes:** Agenda Inteligente + Staff Management + Comisiones
**Verticales incluidas:**
* Barberías
* Salones de belleza
* Centros de estética avanzada
* Spas y centros de relajación
* Centros de depilación láser
* Veterinarias (mascotas)
* Veterinarias de campo
* Clínicas (humanas)
* Clínicas odontológicas
* Consultorios de psicología
* Tutorías y clases particulares
* Autoescuelas
* Talleres mecánicos
* Servicios domésticos
* Cuidadores de adultos mayores
* Paseadores de perros
* Reparaciones del hogar
* Guías turísticos

**Módulos especializados por vertical:**
* **Barberías / Salones / Estética:**
  * Galería de trabajos (antes/después)
  * Tarjeta de fidelización (sellos virtuales)
  * Recomendaciones de productos (venta cruzada)
* **Veterinarias:**
  * Ficha clínica de mascota (vacunas, historial médico)
  * Recordatorios automáticos de vacunas/desparasitaciones
* **Clínicas odontológicas:**
  * Odontograma digital
  * Seguimiento de tratamientos (ortodoncia, implantes)
* **Psicología / Tutorías:**
  * Notas de sesión privadas
  * Gestión de documentación (consentimientos, informes)
* **Autoescuelas:**
  * Control de prácticas (profesor-alumno)
  * Historial de clases y exámenes
* **Talleres mecánicos:**
  * Historial por vehículo (matrícula)
  * Órdenes de reparación técnicas
* **Servicios domésticos / reparaciones:**
  * Presupuestos y aprobación digital
  * Fotos de trabajo finalizado

#### 2. Familia: Hostelería y Restauración
**Módulos base comunes:** Mesas + POS Táctil + Kitchen Display
**Verticales incluidas:**
* Restaurantes
* Discotecas y bares nocturnos
* Hotelería (pequeños hoteles, hostales)
* Camping y glamping (con gestión de reservas)

**Módulos especializados:**
* **Restaurantes / Bares:**
  * Mapa interactivo de mesas
  * División de cuentas (split bill)
  * Menú digital con QR
  * Control de propinas
* **Hotelería / Camping:**
  * Gestión de habitaciones / parcelas
  * Check-in / check-out exprés
  * Limpieza y mantenimiento
  * Integración con canales de reserva (Booking, Airbnb) – opcional

#### 3. Familia: Retail y Ventas (Productos físicos)
**Módulos base comunes:** Inventario (con lotes, vencimientos) + POS + Proveedores
**Verticales incluidas:**
* Farmacias
* Ópticas
* Tiendas agropecuarias
* Tiendas de ropa y calzado
* Ferreterías
* Papelerías y librerías
* Tiendas de regalos y floristerías
* Tiendas de conveniencia
* Alquiler de mobiliario y sonido
* Teatros y cines independientes
* Parques de atracciones

**Módulos especializados:**
* **Farmacias / Ópticas:**
  * Gestión de lotes y fechas de vencimiento (obligatorio)
  * Recetas médicas digitales (vinculadas a clientes)
  * Venta con o sin receta
* **Tiendas de ropa:**
  * Tallas y colores por producto
  * Gestión de tallas (inventario por variante)
* **Ferreterías / Agropecuarias:**
  * Precios por unidad de medida (metro, kilo, litro)
  * Conversión de unidades
* **Alquiler de mobiliario:**
  * Calendario de disponibilidad por artículo
  * Contratos de alquiler y depósitos
* **Teatros / Cines:**
  - Mapa de butacas (venta de entradas)
  - Funciones y horarios

#### 4. Familia: Educación y Formación
**Módulos base comunes:** Gestión de Suscripciones (matrículas) + Seguimiento de Progreso
**Verticales incluidas:**
* Colegios o universidades
* Academias de idiomas
* Escuelas de música y arte
* Bibliotecas y centros culturales
* Gimnasios
* Servicio fit (rutinas + alimentación)
* Clases particulares (ya cubiertas en Bienestar)

**Módulos especializados:**
* **Colegios / Academias:**
  * Portal de padres (calificaciones, asistencia, tareas)
  * Generación de boletines y certificados
  * Control de pagos (matrícula, mensualidades)
* **Gimnasios / Fit:**
  * Gestión de rutinas y planes de entrenamiento
  * Seguimiento de medidas y progreso físico
  * Check-in por código QR o huella
* **Bibliotecas:**
  * Catálogo de libros y préstamos
  * Gestión de devoluciones y multas

#### 5. Familia: Profesionales y Servicios B2B
**Módulos base comunes:** Proyectos + Tareas + Facturación (con impuestos)
**Verticales incluidas:**
* Despachos de abogados
* Estudios contables
* Asesores financieros
* Gestión de inversiones
* Control de créditos
* Arquitectos e ingenieros
* Constructoras
* Inmobiliarias
* Administradores de fincas
* Agencias de marketing
* Fotógrafos y videógrafos
* Organizadores de eventos
* Mudanzas y fletes
* Mensajería y última milla

**Módulos especializados:**
* **Abogados / Asesores:**
  * Gestión de expedientes y documentos (cifrado)
  * Control de horas facturables (time tracking)
  * Calendario de audiencias y plazos
* **Contables / Financieros:**
  * Libros contables (diario, mayor, balances)
  * Declaraciones de impuestos (preconfiguradas por país)
  * Conciliación bancaria automática
* **Arquitectos / Constructores:**
  * Gestión de planos y versiones
  * Control de presupuestos por obra
  * Certificaciones de avance
* **Inmobiliarias:**
  * CRM de propiedades (fotos, características, precios)
  * Publicación automática en portales externos
  * Gestión de visitas y contratos de arrendamiento
* **Eventos / Mudanzas:**
  * Checklists y tareas por proyecto
  * Asignación de recursos (personal, vehículos)

#### 6. Familia: Logística y Activos
**Módulos base comunes:** Activos + Inventario + Contratos
**Verticales incluidas:**
* Gestión de flotas
* Alquiler de vehículos
* Parqueaderos
* Fincas y cultivos

**Módulos especializados:**
* **Flotas / Alquiler de vehículos:**
  * Mantenimiento programado (kilometraje, fechas)
  * Control de combustible
  * Geolocalización en tiempo real
* **Parqueaderos:**
  * Control de entradas/salidas (tarifa por tiempo)
  * Reservas de cupos
  * Facturación automática
* **Fincas / Cultivos:**
  * Gestión de parcelas y cultivos (rotación, fertilizantes)
  * Control de insumos y cosechas
  * Trazabilidad de productos

#### 7. Familia: E-commerce y Marketplaces
**Módulos base comunes:** Tienda en Línea (storefront) + Carrito de Compras + Pasarela de Pago
**Verticales incluidas:**
* Tienda en Línea (genérica)
* Marketplace Multi-Vendedor

**Módulos especializados:**
* **Marketplace:**
  * Gestión de vendedores (comisiones, pagos)
  * Catálogo centralizado con atributos por categoría
  * Valoraciones y reseñas
  * Logística de envíos (integración con transportadoras)

### 🧩 Módulos Core (Siempre Presentes)
Estos módulos son transversales a todas las verticales y deben estar implementados de forma centralizada, sin duplicación:
* **Auth y RBAC** (con roles: Super Admin, Owner, Staff, Client)
* **Gestión de Tenants** (branding, planes, límites)
* **Suscripciones y Facturación** (cobro recurrente, facturas legales)
* **Notificaciones** (WhatsApp, Email, SMS – con identidad white‑label)
* **CRM Central** (ficha única de clientes con historial)
* **Analíticas y Reportes** (ventas, comisiones, inasistencias)
* **Configuración** (generales del negocio, horarios, políticas)

### 📌 Recomendaciones para la Implementación
**Usa el `verticalsRegistry.ts` para definir por cada vertical:**
* `baseModules`: los módulos base que necesita (ej. `['agenda', 'staff']`)
* `features`: lista de funcionalidades especializadas (ej. `['odontograma', 'recetas']`)
* `activeModules`: combinación de base + especializados (para el ModuleGuard)

**Prioriza el desarrollo por familias**
Comienza con la familia de Bienestar (Barberías, etc.) porque tu motor de reservas ya está avanzado, y luego Hostelería (Restaurantes) para aprovechar el POS y el KDS. Las familias más complejas (B2B, Logística) pueden ir en fases posteriores.

**Asegura la reutilización**
Antes de programar una función para una vertical, verifica si ya existe en la Capa Core o en otra familia. Por ejemplo, el "control de horas facturables" de abogados podría servir para arquitectos o consultores.

**Diseña pensando en la personalización**
Las funcionalidades exclusivas deben construirse como plugins o componentes configurables, de modo que puedan activarse/desactivarse sin afectar el núcleo.

---

# Documentación Recomendada para ESSENCE Software Factory

Tienes una base excelente. Para llevar la documentación a un nivel profesional y asegurar que el equipo (y futuros colaboradores) puedan trabajar de manera eficiente, te sugiero incorporar los siguientes documentos, organizados por categorías.

## 1. Documentación de Producto (Visión y Alcance)

| Documento | Propósito |
| --- | --- |
| PRD (ya lo tienes) | Visión general, objetivos, módulos A-H. |
| User Personas | Perfiles detallados de los usuarios finales (dueño de barbería, recepcionista, cliente, etc.). Ayuda a diseñar funcionalidades centradas en el usuario. |
| User Journeys | Flujos completos de principio a fin (ej. "Cómo un cliente reserva una cita", "Cómo un dueño configura su negocio"). |
| Matriz de Roles y Permisos | Tabla que cruza roles (Super Admin, Owner, Manager, Staff, Client) con permisos sobre cada funcionalidad. Útil para desarrollo y para explicar a los tenants. |
| Roadmap del Producto | Visión a 6-12 meses: qué verticales y funcionalidades se desarrollarán en cada fase (Fase 1: Barberías + Restaurantes, Fase 2: Educación, etc.). |
| Modelo de Precios Detallado | Explicación de los planes (mensual/anual), qué incluyen, límites por plan (ej. máx. empleados, sedes, funciones premium). |

## 2. Documentación Técnica (Arquitectura y Desarrollo)

| Documento | Propósito |
| --- | --- |
| API Reference (OpenAPI/Swagger) | Especificación completa de todos los endpoints: parámetros, respuestas, errores, autenticación. Idealmente generada desde el código. |
| Guía de Estilo de Código | Convenciones de nomenclatura, formato (Prettier), organización de imports, buenas prácticas (ej. usar tenantId en todas las queries). |
| Decisiones de Arquitectura (ADR) | Registro de decisiones clave: por qué se eligió MongoDB, por qué SSE en lugar de WebSockets, etc. Ayuda a entender el porqué. |
| Guía de Base de Datos | Esquema detallado de colecciones, índices, relaciones (el diagrama ER que ya tienes es un buen inicio, pero añade descripciones de campos). |
| Guía de Entornos | Cómo configurar entornos de desarrollo, staging, producción. Variables de entorno específicas para cada uno. |
| Estrategia de Testing | Qué tipos de pruebas se escriben (unitarias, integración, e2e), herramientas (Jest, Cypress), y cómo ejecutarlas. |
| Guía de Depuración | Consejos para depurar problemas comunes: cómo inspeccionar logs, conectar a MongoDB en dev, probar SSE localmente. |

## 3. Documentación de Usuario (Para Tenants y sus Clientes)

| Documento | Propósito |
| --- | --- |
| Manual del Propietario (Tenant) | Guía paso a paso para configurar su negocio: onboarding, gestión de empleados, servicios, comisiones, personalización de marca. |
| Manual del Empleado (Staff) | Cómo usar la agenda, marcar asistencia, ver comisiones, etc. |
| Guía Rápida de Clientes | Explicación de cómo reservar una cita desde la página pública, cómo cancelar, qué esperar de las notificaciones. |
| Preguntas Frecuentes (FAQ) | Separado por rol: dueños, empleados, clientes finales. |
| Vídeos Tutoriales | Enlaces a vídeos cortos (pueden alojarse en YouTube/Vimeo) mostrando tareas clave. |

## 4. Documentación Operativa y de DevOps

| Documento | Propósito |
| --- | --- |
| Runbook de Operaciones | Procedimientos para tareas comunes: backup y restauración de BD, monitorización de jobs fallidos, rotación de secretos, escalado. |
| Plan de Recuperación ante Desastres | Qué hacer en caso de caída del servidor, pérdida de datos, ataque de seguridad. |
| Guía de Monitorización | Herramientas (Prometheus, Grafana, logs) y métricas clave a vigilar (errores 5xx, tiempo de respuesta, uso de CPU). |
| Checklist de Despliegue | Pasos a seguir antes de hacer un deploy a producción (pruebas, migraciones, respaldo). |

## 5. Documentación de Seguridad y Cumplimiento

| Documento | Propósito |
| --- | --- |
| Política de Seguridad | Medidas de seguridad implementadas (encriptación, autenticación, rate limiting, firewalls). |
| Plan de Respuesta a Incidentes | Pasos a seguir si se detecta una brecha de seguridad. |
| Términos y Condiciones (para Tenants) | Documento legal que los tenants aceptan al registrarse. |
| Política de Privacidad (para Clientes Finales) | Texto legal que aparece en las landings públicas de los tenants. |
| Matriz de Cumplimiento | Por país (Colombia, etc.): requisitos de facturación electrónica, protección de datos (Ley 1581), etc. |

## 6. Documentación de Negocio y Estrategia

| Documento | Propósito |
| --- | --- |
| Análisis de Competencia | Comparativa con otras plataformas (ej. Fresha, TurnosApp) para identificar ventajas competitivas. |
| Estrategia de Marketing y Ventas | Canales de adquisición, mensajes clave por vertical, embudo de conversión. |
| KPIs del Negocio | Métricas de éxito (MRR, churn, LTV, conversión de prueba a pago) y cómo se miden. |

## 7. Documentación de Procesos Internos

| Documento | Propósito |
| --- | --- |
| Guía de Onboarding para Nuevos Desarrolladores | Amplíala con detalles sobre cómo pedir ayuda, revisar PRs, desplegar cambios. |
| Flujo de Trabajo con Git | Estrategia de branching (Git Flow, GitHub Flow), convenciones de commits, política de PRs. |
| Guía de Gestión de Proyectos | Cómo se organizan las tareas (sprints, tablero), herramientas (Jira, Trello), reuniones. |

## 🛠️ Herramientas Recomendadas para la Documentación
* **MkDocs o Docusaurus** para generar un sitio de documentación unificado y fácil de navegar.
* **Swagger UI** para la API Reference (integrado con el backend).
* **Notion o Confluence** para documentación interna y colaborativa.
* **GitHub Wiki** como alternativa simple si el equipo es pequeño.

## ✅ Checklist de Documentación Final

| Tipo | Documento | Estado |
| --- | --- | --- |
| Producto | PRD | ✅ |
| Producto | User Personas | ❌ |
| Producto | User Journeys | ❌ |
| Producto | Matriz de Roles y Permisos | ❌ |
| Producto | Roadmap | ❌ |
| Producto | Modelo de Precios Detallado | ❌ |
| Técnica | API Reference (Swagger) | ❌ |
| Técnica | Guía de Estilo de Código | ❌ |
| Técnica | ADRs | ❌ |
| Técnica | Guía de Base de Datos | 🟡 (diagrama ER, faltan detalles) |
| Técnica | Estrategia de Testing | ❌ |
| Usuario | Manual del Propietario | ❌ |
| Usuario | Manual del Empleado | ❌ |
| Usuario | Guía Rápida de Clientes | ❌ |
| Operativa | Runbook | ❌ |
| Operativa | Plan de Recuperación | ❌ |
| Seguridad | Política de Seguridad | ❌ |
| Seguridad | Términos y Condiciones | ❌ |
| Negocio | Análisis de Competencia | ❌ |
| Negocio | KPIs | ❌ |

## 🚀 Próximos Pasos Sugeridos

Prioriza los documentos más críticos para el equipo de desarrollo actual:
1. **API Reference (Swagger)** – indispensable para frontend y futuras integraciones.
2. **Matriz de Roles y Permisos** – para implementar el RBAC correctamente.
3. **Guía de Base de Datos (detallada)** – para evitar errores en consultas.

Crea una plantilla para ADRs y documenta las decisiones ya tomadas (ej. uso de MongoDB, SSE).
Involucra al equipo en la redacción: cada desarrollador puede contribuir a la guía de estilo o a la documentación de la API.
Establece un repositorio de documentación (por ejemplo, una carpeta `/docs` en el monorepo con un sitio generado por MkDocs) y mantenlo actualizado.


---

<!-- INICIO DE ARCHIVO: API_SPECIFICATION.md -->

# Especificación Formal de API REST - ESSENCE Factory

Esta hoja de especificaciones es un recurso de referencia técnica de las Interfáz API HTTP que comunica la SPA B2B/B2C con la capa de `infrastructure` (Backend API). Se utiliza la convención HTTP Estándar (Verbos GET, POST, PATCH y DELETE).

El `Base URL` en producción se definirá como `https://api.essencefactory.com/v1`

---

## Encabezados Predeterminados (Headers Obligatorios)
- `Authorization`: `Bearer <JWT_TOKEN_CADENA_STRING>` (Generado al LogIn. Omítase si la ruta es pública como la pasarela de reservas B2C).
- `Content-Type`: `application/json`

---

## API Routes & Endpoints Core

### 1. Autenticación `/auth`

**1.1 POST `/auth/login`**
  - **Descripción:** Inicia la bóveda de sesión. Genera JWT Básico.
  - **Body (Input):**
    ```json
    {
      "email": "owner@miestilo.com",
      "password": "SecurePassword123"
    }
    ```
  - **Success (200 OK):**
    ```json
    {
      "token": "eyJhbG...",
      "user": {
        "id": "673cfddf1xx",
        "role": "ADMIN",
        "tenantId": "tnt_83abc"
      }
    }
    ```
  - **Error (401 Unauthorized):** Fallo Credenciales.

---

### 2. Administración y Usuarios B2B `/users`

**2.1 POST `/users/register-tenant`**
  - **Descripción:** Creador principal de Onboarding Completo (Viene luego del cobro de Stripe/MercadoPago).
  - **Body (Input):** Formulario Front con campos (`companyName`, `subdomain`, config de `customColors`, datos del propietario en crudo `ownerName`, `phone`, etc.).
  - **Returns (201 Created):** Entidades Tenant y User generadas.

**2.2 GET `/users/public/barbers`**
  - **Descripción:** *Ruta Pública.* Expone a los profesionales de nuestro `Tenant` específico al portal B2C filtrando quienes tienen visibilidad activa.
  - **Params:** `?tenantId=tnt_xx` (Obligatorio en Request Parameter si es B2C y no trae Auth JWT que extraiga el tenant).
  - **Returns (200 OK):** Lista de IDs y Nombres con sus Skills fotográficas.

---

### 3. Motor de Citas & Reservaciones `/appointments`

**3.1 GET `/appointments`**
  - **Descripción:** Recupera la parrilla general de citas del negocio.
  - **Filtros de Query (Opcionales):** `?branchId=Y&barberId=X&date=YYYY-MM-DD`
  - **Returns (200 OK):**
    ```json
    [
      {
        "id": "app_54rfv",
        "clientId": "cli_99x",
        "clientName": "Juan Perez",
        "startAt": "2026-03-14T09:30:00Z",
        "endAt": "2026-03-14T10:00:00Z",
        "serviceId": "svc_12",
        "status": "SCHEDULED"
      }
    ]
    ```

**3.2 POST `/appointments`**
  - **Descripción:** Insertar y apartar bloque horario nuevo de la Web de Reservas Pública.
  - **Validaciones:** Backend valida cruce (Colisiones), validación de variables. Si hay conflicto: responde `409 Conflict`. Si es exitoso responde `201 Created`. Encola trabajo en Redis (BullMQ Notification Engine).

**3.3 PATCH `/appointments/:id/status`**
  - **Descripción:** Especialistas marcando estado del cliente.
  - **Body (Input):**
    ```json
    {
      "status": "COMPLETED" // Enum: SCHEDULED, COMPLETED, NO_SHOW, CANCELLED
    }
    ```
  - **Lógica lateral:** Dependiendo del estado (e.g. `NO_SHOW`), el controlador despacha el EventBus para punir el _Trust Score_ del cliente.

---

### 4. Inteligencia y POS API `/reports` y `/inventory`

**4.1 GET `/reports/summary`**
  - **Protección:** JWT Requerido. Solo Role `ADMIN`.
  - **Descripción:** Retorna agregaciones MongoDB (Aggregate pipeline).
  - **Returns (200 OK):**
    ```json
     {
       "totalRevenue": 4500000,
       "completedAppointmentsCount": 112,
       "noShowRate": "3.5%"
     }
    ```

**4.2 POST `/inventory/sales` (Integración POS)**
  - **Descripción:** Ejecución de venta rápida de terminales y tickets físicos/comandas.
  - **Body (Input):**
    ```json
    {
      "items": [
        { "productId": "prd_24x", "quantity": 1 }
      ],
      "paymentMethod": "CASH"
    }
    ```
  - **Returns (201 Created):** Resta cantidad de MongoDB en tiempo real. 


---

<!-- INICIO DE ARCHIVO: ARCHITECTURE.md -->

# Arquitectura

Fecha: 2026-03-08

## Principios
- Clean Architecture: domain -> application -> infrastructure -> interfaces.
- Multi-tenant: tenantId obligatorio en cada consulta y comando.
- White-label: branding via CSS variables y configuracion por tenant.

## Backend (Node + Express)
- Domain: entidades y reglas (Tenants, Billing, POS, CRM, etc).
- Application: casos de uso y servicios (CreateInvoiceUseCase, TaxCalculatorService).
- Infrastructure: Mongo, InMemory, SSE hubs, terceros.
- Interfaces: rutas HTTP y middlewares.

## Frontend (React)
- shared: layouts, contextos, UI base, infraestructura HTTP.
- modules: features por rol y vertical (admin, staff, landing, hosteleria).

## Flujos clave
- Auth -> JWT -> tenantId en req.auth.
- VerticalRegistry -> rutas dinamicas de landing + temas.
- POS -> venta -> billing (invoice) si status PAGADA.
- Orders -> SSE -> KitchenDisplay.

## Diagramas

### Capas Clean Architecture
```mermaid
flowchart TD
	UI[Interfaces HTTP / UI] --> UC[UseCases / Application]
	UC --> D[Domain]
	UC --> INF[Infrastructure]
	INF --> DB[(Mongo/InMemory)]
```

### Flujo POS -> Billing
```mermaid
sequenceDiagram
	participant UI as UI POS
	participant API as API
	participant POS as POS UseCase
	participant BILL as Billing UseCase
	participant DB as Mongo
	UI->>API: POST /api/pos/sales (PAGADA)
	API->>POS: CreateSaleUseCase
	POS->>DB: store sale
	POS->>BILL: CreateInvoiceUseCase
	BILL->>DB: store invoice
	API-->>UI: sale + invoice
```

### Orders SSE
```mermaid
flowchart LR
	POS[POS] --> API[POST /api/orders]
	API --> HUB[ordersHub]
	HUB --> SSE[SSE Stream]
	SSE --> KITCHEN[KitchenDisplay]
```


---

<!-- INICIO DE ARCHIVO: AUDIT_VERTICALS_FEATURE.md -->

# Vertical Feature Audit

## Summary
- Core modules found: Agenda/Appointments, Staff schedules, Services, Inventory, Reports, Notifications (WhatsApp logs/config).
- POS: partial UI (Admin POS) and inventory sales endpoint; no dedicated POS backend routes found.
- Ecommerce: storefront UI lists inventory and client cart; no order/checkout backend routes found.
- Modules not found in codebase: tables, subscriptions, progress_tracking, access_control, accounting, contracts, projects, tasks, assets_management, order_management, shipping_tracking, multi_vendor.

Evidence:
- Agenda/Appointments backend: backend/src/modules/appointments/interfaces/http/appointmentsRoutes.ts
- Staff schedules backend: backend/src/modules/staff/interfaces/http/staffRoutes.ts
- Services backend + UI: backend/src/modules/services/interfaces/http/servicesRoutes.ts, frontend/src/modules/admin/presentation/pages/AdminServicesPage.tsx
- Inventory backend + UI: backend/src/modules/inventory/interfaces/http/inventoryRoutes.ts, frontend/src/modules/admin/pages/AdminInventoryPage.tsx
- POS UI: frontend/src/modules/admin/pages/AdminPOSPage.tsx
- Storefront UI: frontend/src/modules/client/StorefrontPage.tsx
- Reports: backend/src/modules/reports/interfaces/http/reportsRoutes.ts, frontend/src/modules/admin/presentation/pages/AdminReportsPage.tsx
- Notifications: backend/src/modules/notifications/interfaces/http/notificationsRoutes.ts

Legend (Base Modules Coverage)
- Supported: base modules fully mapped to existing backend + UI.
- Partial: some base modules exist (UI only or missing backend routes).
- Not found: base modules not present in codebase.

Feature Coverage
- Not verified: features are listed in registry but no specific implementation found in backend/UI.

## Checklist by Vertical
| Vertical | Base Modules | Coverage | Features |
| --- | --- | --- | --- |
| Barberias | agenda, staff | Supported | Not verified |
| Salones de belleza | agenda, staff | Supported | Not verified |
| Centros de estetica avanzada | agenda, staff | Supported | Not verified |
| Spas y centros de relajacion | agenda, staff | Supported | Not verified |
| Centros de depilacion laser | agenda, staff | Supported | Not verified |
| Restaurantes | tables, pos | Not found | Not verified |
| Discotecas y bares nocturnos | tables, pos | Not found | Not verified |
| Gestor de gastos | accounting, pos | Not found | Not verified |
| Habitos | subscriptions, progress_tracking | Not found | Not verified |
| Veterinarias | agenda, staff | Supported | Not verified |
| Veterinarias de campo | agenda, staff | Supported | Not verified |
| Farmacias | inventory, pos | Partial | Not verified |
| Opticas | inventory, pos | Partial | Not verified |
| Clinicas | agenda, staff | Supported | Not verified |
| Clinicas de odontologia | agenda, staff | Supported | Not verified |
| Consultorios de psicologia | agenda, staff | Supported | Not verified |
| Inventarios y ventas POS | inventory, pos | Partial | Not verified |
| Tiendas agropecuarias | inventory, pos | Partial | Not verified |
| Tiendas de ropa y calzado | inventory, pos | Partial | Not verified |
| Ferreterias | inventory, pos | Partial | Not verified |
| Papelerias y librerias | inventory, pos | Partial | Not verified |
| Tiendas de regalos y floristerias | inventory, pos | Partial | Not verified |
| Tiendas de conveniencia | inventory, pos | Partial | Not verified |
| Colegios o universidades | subscriptions, progress_tracking | Not found | Not verified |
| Academias de idiomas | subscriptions, progress_tracking | Not found | Not verified |
| Escuelas de musica y arte | subscriptions, progress_tracking | Not found | Not verified |
| Bibliotecas y centros culturales | assets_management, subscriptions | Not found | Not verified |
| Tutorias y clases particulares | agenda, staff | Supported | Not verified |
| Autoescuelas | agenda, staff | Supported | Not verified |
| Gimnasios | subscriptions, progress_tracking | Not found | Not verified |
| Servicio fit | subscriptions, progress_tracking | Not found | Not verified |
| Hoteleria | inventory, pos | Partial | Not verified |
| Alquiler vacacional | subscriptions, access_control | Not found | Not verified |
| Camping y glamping | subscriptions, access_control | Not found | Not verified |
| Talleres mecanicos | agenda, staff | Supported | Not verified |
| Despachos de abogados | contracts, projects | Not found | Not verified |
| Estudios contables | accounting, projects | Not found | Not verified |
| Asesores financieros | accounting, projects | Not found | Not verified |
| Gestion de inversiones | accounting, projects | Not found | Not verified |
| Control de creditos | accounting, contracts | Not found | Not verified |
| Arquitectos e ingenieros | projects, tasks | Not found | Not verified |
| Constructoras | projects, tasks | Not found | Not verified |
| Inmobiliarias | contracts, projects | Not found | Not verified |
| Administradores de fincas y edificios | assets_management, contracts | Not found | Not verified |
| Agencias de marketing | projects, tasks | Not found | Not verified |
| Fotografos y videografos | projects, tasks | Not found | Not verified |
| Organizadores de eventos | projects, tasks | Not found | Not verified |
| Mudanzas y fletes | projects, tasks | Not found | Not verified |
| Mensajeria y ultima milla | projects, tasks | Not found | Not verified |
| Gestion de flotas | assets_management, projects | Not found | Not verified |
| Alquiler de vehiculos | assets_management, contracts | Not found | Not verified |
| Parqueaderos | pos, staff | Partial | Not verified |
| Alquiler de mobiliario y sonido | inventory, pos | Partial | Not verified |
| Teatros y cines independientes | pos, inventory | Partial | Not verified |
| Parques de atracciones | pos, inventory | Partial | Not verified |
| Servicios domesticos | agenda, staff | Supported | Not verified |
| Cuidadores de adultos mayores | agenda, staff | Supported | Not verified |
| Paseadores de perros | agenda, staff | Supported | Not verified |
| Reparaciones del hogar | agenda, staff | Supported | Not verified |
| Fincas y cultivos | assets_management, inventory | Not found | Not verified |
| Guias turisticos | agenda, staff | Supported | Not verified |
| Agencias de viajes | projects, staff | Not found | Not verified |
| Tienda en Linea | ecommerce_storefront, shopping_cart | Partial | Not verified |
| Marketplace Multi-Vendedor | ecommerce_storefront, shopping_cart | Partial | Not verified |


---

<!-- INICIO DE ARCHIVO: BILLING.md -->

# Billing e impuestos

Fecha: 2026-03-08

## Objetivo
Generar facturas con impuestos segun pais del tenant.

## Entidad
Invoice: subtotal, taxAmount, total, currency, tenantId, country.

## Flujo
- POS crea venta con paymentStatus = PAGADA.
- POS llama CreateInvoiceUseCase.
- TaxCalculatorService aplica tasa por pais.

## Endpoints
- POST /api/billing/invoices (manual)
- POST /api/pos/sales (auto si PAGADA)

## Tenant country
- Campo country en Tenant.
- Default CO si no existe.

## Ejemplo
```bash
curl -X POST http://localhost:4000/api/billing/invoices \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"subtotal":100000,"currency":"COP"}'
```


---

<!-- INICIO DE ARCHIVO: CHANGELOG.md -->

# Changelog

## 2026-03-08
- Rutas dinamicas por vertical y pagina 404 con estilo Essence.
- Billing con facturas e impuestos por pais.
- ContentService para copy dinamico en landings.
- SSE de comandas y KitchenDisplay.
- ModuleGuard con upsell card.
- POS con soporte de ordenes a cocina y estado PAGADA.


---

<!-- INICIO DE ARCHIVO: CONTENT.md -->

# Content Service (IA placeholder)

Fecha: 2026-03-08

## Objetivo
Generar copy dinamico por vertical sin lorem ipsum.

## Endpoint
- GET /api/content/landing/:verticalId

## Frontend
- DynamicHero consume este endpoint para hero de la landing.

## Ejemplo
```bash
curl http://localhost:4000/api/content/landing/restaurantes
```


---

<!-- INICIO DE ARCHIVO: DEPLOYMENT.md -->

# Deploy y configuracion

Fecha: 2026-03-08

## Entorno
- Node >= 18
- MongoDB + Redis (opcional)

## Variables clave
Backend:
- JWT_SECRET
- MONGODB_URI
- USE_MONGO
- REDIS_URL
- ENABLE_JOBS
- MP_* (Mercado Pago)

Frontend:
- VITE_API_BASE_URL

## Notas
- SSE requiere proxy que no bufferice (X-Accel-Buffering: no).
- Service Worker basico en frontend/public/basic-sw.js.

## Checklist de despliegue
- Definir JWT_SECRET seguro.
- Configurar MP_* si se usa Mercado Pago.
- Revisar CORS_ORIGINS para dominios finales.
- Habilitar HTTPS para SSE estable.
- Monitorear logs pino-http.


---

<!-- INICIO DE ARCHIVO: DOCUMENTACION_RECOMENDADA.md -->

# Documentación Recomendada para ESSENCE Software Factory

Tienes una base excelente. Para llevar la documentación a un nivel profesional y asegurar que el equipo (y futuros colaboradores) puedan trabajar de manera eficiente, te sugiero incorporar los siguientes documentos, organizados por categorías.

## 1. Documentación de Producto (Visión y Alcance)

| Documento | Propósito |
| --- | --- |
| PRD (ya lo tienes) | Visión general, objetivos, módulos A-H. |
| User Personas | Perfiles detallados de los usuarios finales (dueño de barbería, recepcionista, cliente, etc.). Ayuda a diseñar funcionalidades centradas en el usuario. |
| User Journeys | Flujos completos de principio a fin (ej. "Cómo un cliente reserva una cita", "Cómo un dueño configura su negocio"). |
| Matriz de Roles y Permisos | Tabla que cruza roles (Super Admin, Owner, Manager, Staff, Client) con permisos sobre cada funcionalidad. Útil para desarrollo y para explicar a los tenants. |
| Roadmap del Producto | Visión a 6-12 meses: qué verticales y funcionalidades se desarrollarán en cada fase (Fase 1: Barberías + Restaurantes, Fase 2: Educación, etc.). |
| Modelo de Precios Detallado | Explicación de los planes (mensual/anual), qué incluyen, límites por plan (ej. máx. empleados, sedes, funciones premium). |

## 2. Documentación Técnica (Arquitectura y Desarrollo)

| Documento | Propósito |
| --- | --- |
| API Reference (OpenAPI/Swagger) | Especificación completa de todos los endpoints: parámetros, respuestas, errores, autenticación. Idealmente generada desde el código. |
| Guía de Estilo de Código | Convenciones de nomenclatura, formato (Prettier), organización de imports, buenas prácticas (ej. usar tenantId en todas las queries). |
| Decisiones de Arquitectura (ADR) | Registro de decisiones clave: por qué se eligió MongoDB, por qué SSE en lugar de WebSockets, etc. Ayuda a entender el porqué. |
| Guía de Base de Datos | Esquema detallado de colecciones, índices, relaciones (el diagrama ER que ya tienes es un buen inicio, pero añade descripciones de campos). |
| Guía de Entornos | Cómo configurar entornos de desarrollo, staging, producción. Variables de entorno específicas para cada uno. |
| Estrategia de Testing | Qué tipos de pruebas se escriben (unitarias, integración, e2e), herramientas (Jest, Cypress), y cómo ejecutarlas. |
| Guía de Depuración | Consejos para depurar problemas comunes: cómo inspeccionar logs, conectar a MongoDB en dev, probar SSE localmente. |

## 3. Documentación de Usuario (Para Tenants y sus Clientes)

| Documento | Propósito |
| --- | --- |
| Manual del Propietario (Tenant) | Guía paso a paso para configurar su negocio: onboarding, gestión de empleados, servicios, comisiones, personalización de marca. |
| Manual del Empleado (Staff) | Cómo usar la agenda, marcar asistencia, ver comisiones, etc. |
| Guía Rápida de Clientes | Explicación de cómo reservar una cita desde la página pública, cómo cancelar, qué esperar de las notificaciones. |
| Preguntas Frecuentes (FAQ) | Separado por rol: dueños, empleados, clientes finales. |
| Vídeos Tutoriales | Enlaces a vídeos cortos (pueden alojarse en YouTube/Vimeo) mostrando tareas clave. |

## 4. Documentación Operativa y de DevOps

| Documento | Propósito |
| --- | --- |
| Runbook de Operaciones | Procedimientos para tareas comunes: backup y restauración de BD, monitorización de jobs fallidos, rotación de secretos, escalado. |
| Plan de Recuperación ante Desastres | Qué hacer en caso de caída del servidor, pérdida de datos, ataque de seguridad. |
| Guía de Monitorización | Herramientas (Prometheus, Grafana, logs) y métricas clave a vigilar (errores 5xx, tiempo de respuesta, uso de CPU). |
| Checklist de Despliegue | Pasos a seguir antes de hacer un deploy a producción (pruebas, migraciones, respaldo). |

## 5. Documentación de Seguridad y Cumplimiento

| Documento | Propósito |
| --- | --- |
| Política de Seguridad | Medidas de seguridad implementadas (encriptación, autenticación, rate limiting, firewalls). |
| Plan de Respuesta a Incidentes | Pasos a seguir si se detecta una brecha de seguridad. |
| Términos y Condiciones (para Tenants) | Documento legal que los tenants aceptan al registrarse. |
| Política de Privacidad (para Clientes Finales) | Texto legal que aparece en las landings públicas de los tenants. |
| Matriz de Cumplimiento | Por país (Colombia, etc.): requisitos de facturación electrónica, protección de datos (Ley 1581), etc. |

## 6. Documentación de Negocio y Estrategia

| Documento | Propósito |
| --- | --- |
| Análisis de Competencia | Comparativa con otras plataformas (ej. Fresha, TurnosApp) para identificar ventajas competitivas. |
| Estrategia de Marketing y Ventas | Canales de adquisición, mensajes clave por vertical, embudo de conversión. |
| KPIs del Negocio | Métricas de éxito (MRR, churn, LTV, conversión de prueba a pago) y cómo se miden. |

## 7. Documentación de Procesos Internos

| Documento | Propósito |
| --- | --- |
| Guía de Onboarding para Nuevos Desarrolladores | Amplíala con detalles sobre cómo pedir ayuda, revisar PRs, desplegar cambios. |
| Flujo de Trabajo con Git | Estrategia de branching (Git Flow, GitHub Flow), convenciones de commits, política de PRs. |
| Guía de Gestión de Proyectos | Cómo se organizan las tareas (sprints, tablero), herramientas (Jira, Trello), reuniones. |

## 🛠️ Herramientas Recomendadas para la Documentación
* **MkDocs o Docusaurus** para generar un sitio de documentación unificado y fácil de navegar.
* **Swagger UI** para la API Reference (integrado con el backend).
* **Notion o Confluence** para documentación interna y colaborativa.
* **GitHub Wiki** como alternativa simple si el equipo es pequeño.

## ✅ Checklist de Documentación Final

| Tipo | Documento | Estado |
| --- | --- | --- |
| Producto | PRD | ✅ |
| Producto | User Personas | ❌ |
| Producto | User Journeys | ❌ |
| Producto | Matriz de Roles y Permisos | ❌ |
| Producto | Roadmap | ❌ |
| Producto | Modelo de Precios Detallado | ❌ |
| Técnica | API Reference (Swagger) | ❌ |
| Técnica | Guía de Estilo de Código | ❌ |
| Técnica | ADRs | ❌ |
| Técnica | Guía de Base de Datos | 🟡 (diagrama ER, faltan detalles) |
| Técnica | Estrategia de Testing | ❌ |
| Usuario | Manual del Propietario | ❌ |
| Usuario | Manual del Empleado | ❌ |
| Usuario | Guía Rápida de Clientes | ❌ |
| Operativa | Runbook | ❌ |
| Operativa | Plan de Recuperación | ❌ |
| Seguridad | Política de Seguridad | ❌ |
| Seguridad | Términos y Condiciones | ❌ |
| Negocio | Análisis de Competencia | ❌ |
| Negocio | KPIs | ❌ |


---

<!-- INICIO DE ARCHIVO: FACTORY_SAAS.md -->

# ESSENCE FACTORY SAAS - Documentacion Tecnica para Desarrollo

Fecha: 2026-03-05

## 0. Documentacion extendida
- docs/INDEX.md
- docs/ARCHITECTURE.md
- docs/FEATURES.md
- docs/VERTICALS.md
- docs/REALTIME.md
- docs/BILLING.md
- docs/CONTENT.md
- docs/DEPLOYMENT.md

## 1. Resumen Ejecutivo
Essence Factory SaaS es una plataforma multi-tenant white-label para verticales de servicios. El sistema opera como monorepo con frontend React (SPA) y backend Node/Express, con persistencia en MongoDB y jobs opcionales via Redis/BullMQ. La plataforma ofrece onboarding automatico de negocios, control por planes, branding por tenant y modulos de operacion (agenda, staff, inventario, reportes, WhatsApp).

## 2. Como empezar (dev)

### 2.1 Requisitos
- Node.js >= 18
- Docker Desktop (para Mongo/Redis)
- Git

### 2.2 Configuracion rapida
1) Copia el archivo de entorno:
	- `cp .env.example .env`
2) Define un `JWT_SECRET` seguro (64 bytes hex).
3) Instala dependencias:
	- `npm install`
4) Ejecuta el entorno de desarrollo:
	- `npm run dev`

### 2.3 Alternativa sin Docker
Si no puedes usar Docker, ejecuta:
- `npm run dev:backend:memory`
- `npm run dev:frontend`

### 2.4 Puertos por defecto
- Frontend: http://localhost:5174
- Backend API: http://localhost:4000
- MongoDB: 27017
- Redis: 6379
- Mongo Express: http://localhost:8081

### 2.5 Troubleshooting rapido
- Error `JWT_SECRET es obligatorio`: crea `.env` en la raiz y define `JWT_SECRET`.
- Error Docker pipe (Windows): inicia Docker Desktop.
- Orphan containers: `docker compose up -d --remove-orphans`.

## 3. Arquitectura General

### 3.1 Topologia
- Frontend SPA: React 19 + Vite 6 + Tailwind 4 + React Router 7.
- Backend API REST: Node.js + Express + TypeScript.
- Persistencia: MongoDB (principal) con repositorios in-memory para fallback.
- Jobs: Redis + BullMQ (opcional, controlado por ENABLE_JOBS).
- Hosting: Nginx (en Docker), configuracion local con Vite.

### 3.2 Multi-Tenancy
- `tenantId` viaja en JWT y condiciona consultas.
- Repositorios filtran por `tenantId` en la capa de persistence.
- Frontend resuelve tenant por subdominio y aplica branding con CSS variables.

### 3.3 Capas de Aplicacion
Backend sigue arquitectura hexagonal:
- domain: entidades, reglas y validaciones core.
- application: casos de uso.
- infrastructure: adaptadores (Mongo, Redis, JWT, etc).
- interfaces: rutas HTTP y controladores.

Frontend sigue separacion por modulos:
- shared: contextos, layouts, infraestructura y UI base.
- modules: features por rol (admin, staff, god, landing, onboarding).

### 3.4 Diagramas (arquitectura y flujos)

#### 3.4.1 Flujo general (frontend + backend + datos)
```mermaid
flowchart LR
	U[Usuario] --> UI[Frontend SPA]
	UI --> API[Backend API]
	API --> DB[(MongoDB)]
	API --> R[(Redis)]
	API --> J[Jobs BullMQ]
	API --> W[WhatsApp Provider]
```

#### 3.4.2 Flujo de autenticacion
```mermaid
flowchart TD
	A[Login UI] --> B[POST /auth/login]
	B --> C{Credenciales validas?}
	C -- No --> D[401 + mensaje]
	C -- Si --> E[Genera JWT]
	E --> F[Devuelve token + perfil]
	F --> G[Frontend guarda token]
```

#### 3.4.3 Flujo multi-tenant (request)
```mermaid
flowchart TD
	A[Request] --> B[Middleware Auth]
	B --> C[Extrae tenantId del JWT]
	C --> D[Use Case]
	D --> E[Repositorio filtra por tenantId]
	E --> F[(MongoDB)]
```

#### 3.4.4 Provisioning de tenant
```mermaid
flowchart TD
	A[POST /users/register-tenant] --> B[FactoryService]
	B --> C[Crea Tenant]
	B --> D[Crea Branch inicial]
	B --> E[Crea Admin]
	B --> F[Inicializa config]
	C --> G[(MongoDB)]
	D --> G
	E --> G
	F --> G
```

## 4. Rutas y Hosts

### 4.1 Namespace por host
- domain.com/ -> Landing principal (corporativa, venta del producto).
- domain.com/barberias-landing -> Landing vertical barberias (marketing + planes + login).
- subdominio.domain.com/ -> Software real del cliente (tenant).

### 4.2 Router por contexto
- landing: rutas publicas de marketing y vertical.
- app: rutas internas para roles y paneles.
- tenant: ruta de booking para clientes finales.

## 5. Roles y Jerarquia
- GOD: control global (tenants, planes, metricas, panel GOD).
- ADMIN: operacion del tenant (agenda, staff, inventario, reportes, sedes).
- BARBER: operacion diaria (staff dashboard).
- CLIENT: reserva y acceso al booking.

## 6. Backend

### 6.1 Stack
- Node.js >= 18
- Express 4
- TypeScript
- MongoDB + Mongoose
- Redis + BullMQ (opcional)
- JWT + bcrypt

### 6.2 Modulos
- auth: login, tokens, reset de password.
- users: CRUD de usuarios, registro de cliente, registro de tenant.
- tenants: data del negocio, branding, metrics.
- plans: planes globales y limites.
- branches: sedes por tenant.
- services: catalogo de servicios.
- barbers: horarios y bloqueos.
- appointments: reservas, cambios y reglas de colision.
- notifications: WhatsApp, logs y configuracion.
- reports: resumen diario, rango y comisiones.
- inventory: productos, ventas, reabastecimiento.

### 6.3 Entidades principales
- Plan: name, price, maxBranches, maxBarbers, maxMonthlyAppointments, features.
- Tenant: name, slug, subdomain, planId, status, customColors, logoUrl, config.
- Branch: tenantId, name, address, phone, active.
- User: role, tenantId, branchIds, approved, whatsappConsent, commissionRate.
- Appointment: tenantId, branchId, clientId, barberId, serviceId, startAt, endAt, status.
- Product: tenantId, name, sku, price, stock, costos y restocks.
- WhatsAppLog: tenantId, event, roleTarget, phone, status.

### 6.4 Relaciones de Base de Datos
- Plan 1..n Tenant (Tenant.planId).
- Tenant 1..n Branch (Branch.tenantId).
- Tenant 1..n User (User.tenantId).
- Tenant 1..n Service (Service.tenantId).
- Tenant 1..n Product (Product.tenantId).
- Tenant 1..n Appointment (Appointment.tenantId).
- Tenant 1..n WhatsAppLog (WhatsAppLog.tenantId).
- Branch 1..n Appointment (Appointment.branchId).
- User (BARBER) 1..n Appointment (Appointment.barberId).
- User (CLIENT) 1..n Appointment (Appointment.clientId).
- Service 1..n Appointment (Appointment.serviceId).
- User n..n Branch (User.branchIds).

### 6.4.1 Diagrama de entidades (ER)
```mermaid
erDiagram
	PLAN ||--o{ TENANT : has
	TENANT ||--o{ BRANCH : owns
	TENANT ||--o{ USER : has
	TENANT ||--o{ SERVICE : offers
	TENANT ||--o{ PRODUCT : manages
	TENANT ||--o{ APPOINTMENT : schedules
	TENANT ||--o{ WHATSAPP_LOG : logs
	BRANCH ||--o{ APPOINTMENT : hosts
	USER ||--o{ APPOINTMENT : books
	SERVICE ||--o{ APPOINTMENT : defines
	USER }o--o{ BRANCH : assigned

	PLAN {
		string name
		number price
		number maxBranches
		number maxBarbers
		number maxMonthlyAppointments
	}
	TENANT {
		string name
		string slug
		string subdomain
		string status
		string planId
	}
	BRANCH {
		string tenantId
		string name
		string address
		string phone
	}
	USER {
		string tenantId
		string role
		string[] branchIds
	}
	SERVICE {
		string tenantId
		string name
		number price
	}
	PRODUCT {
		string tenantId
		string name
		string sku
		number price
		number stock
	}
	APPOINTMENT {
		string tenantId
		string branchId
		string clientId
		string barberId
		string serviceId
		datetime startAt
		datetime endAt
	}
	WHATSAPP_LOG {
		string tenantId
		string event
		string roleTarget
		string phone
		string status
	}
```

### 6.5 Provisioning (FactoryService)
Registro tenant:
1) Crea Tenant con plan Trial por defecto.
2) Crea Branch inicial.
3) Crea Admin asociado.
4) Inicializa config de agenda y notificaciones.

### 6.6 Gatekeeper de Planes
Middleware para controlar limites por plan:
- Antes de crear BARBER -> valida maxBarbers.
- Antes de crear BRANCH -> valida maxBranches.

### 6.7 No-shows
- Regla: bloqueo o pago previo despues de N faltas.
- Respuesta 402 con `paymentUrl` para desbloqueo.

### 6.8 Redis y Jobs
- ENABLE_JOBS controla ejecucion de jobs.
- Redis en 6379 por default.
- En dev, si Redis no esta activo, logs pueden aparecer pero no bloquean el API.

## 7. Frontend

### 7.1 Stack
- React 19
- TypeScript
- Vite 6
- Tailwind 4
- React Router 7
- TanStack Query
- Recharts
- React Day Picker

### 7.2 White-Label
- TenantContext resuelve el subdominio.
- Inyecta CSS variables: --primary, --secondary, --logo-url.
- Branding dinamico en layouts y componentes base.

### 7.3 Rutas Principales
Landing:
- / -> landing corporativa.
- /barberias-landing -> vertical barberias.
- /barberias-login -> login duenos y staff.
- /barberias-client-login -> login clientes (con subdominio).
- /admin-login -> login exclusivo GOD.

App:
- /admin
- /admin/agenda
- /admin/team (comisiones)
- /admin/branches
- /admin/whatsapp
- /admin/inventory
- /admin/reports
- /staff
- /god

Tenant:
- / -> booking engine

### 7.4 Login y Roles
- LoginCard valida roles permitidos segun portal.
- GOD solo entra via /admin-login.
- Duenos y staff via /barberias-login.
- Clientes via /barberias-client-login + subdominio.

### 7.5 PWA
- Vite PWA con manifest e iconos personalizados.
- Registro de SW en prod con wrapper para dev.

### 7.6 Flujos UI clave

#### 7.6.1 Login por portal y rol
```mermaid
flowchart TD
	A[Selecciona portal] --> B{Portal}
	B -- Admin/GOD --> C[/admin-login]
	B -- Duenos/Staff --> D[/barberias-login]
	B -- Clientes --> E[/barberias-client-login]
	C --> F[LoginCard valida roles]
	D --> F
	E --> F
	F --> G[AppLayout]
```

#### 7.6.2 Booking publico
```mermaid
flowchart TD
	A[Tenant Public Home] --> B[Selecciona servicio]
	B --> C[Selecciona barber]
	C --> D[Selecciona fecha/hora]
	D --> E[Confirma reserva]
	E --> F[POST /appointments]
	F --> G[Reserva creada]
```

## 8. API REST (Resumen)

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
- GET /reports/daily
- GET /reports/range

### Inventory
- GET /inventory
- POST /inventory
- PATCH /inventory/:id
- DELETE /inventory/:id
- POST /inventory/sales
- POST /inventory/restock

## 9. Variables de Entorno

### 9.1 Backend
- NODE_ENV, PORT
- MONGODB_URI, USE_MONGO
- REDIS_URL, ENABLE_JOBS
- JWT_SECRET, JWT_EXPIRES_IN
- MIN_ADVANCE_MINUTES, CANCEL_LIMIT_MINUTES, RESCHEDULE_LIMIT_MINUTES
- QUIET_HOURS_START, QUIET_HOURS_END
- CORS_ORIGINS
- CLOUDINARY_*
- VAPID_*

### 9.2 Frontend
- VITE_API_BASE_URL

## 10. Build y Dev

### 10.1 Comandos
- npm run dev (monorepo)
- npm run dev -w backend
- npm run dev -w frontend
- npm run build

### 10.2 Notas de Dev
- Vite usa polling en Windows para detectar cambios.
- Backend usa ts-node-dev con polling.
- Redis puede ser opcional en dev.

### 10.3 Flujos operativos (dev)

#### 10.3.1 Boot de entorno (Docker)
```mermaid
flowchart TD
	A[npm run dev] --> B[docker compose up -d redis mongo]
	B --> C[Backend dev]
	B --> D[Frontend dev]
	C --> E[API lista]
	D --> F[UI lista]
```

#### 10.3.2 Boot sin Docker
```mermaid
flowchart TD
	A[npm run dev:backend:memory] --> B[Backend in-memory]
	A2[npm run dev:frontend] --> C[Frontend dev]
	B --> D[API lista]
	C --> E[UI lista]
```

## 11. Seguridad
- JWT con expiracion configurada.
- bcrypt para hashing de password.
- CORS configurado por env.
- Rate limiting activo.

## 12. Observabilidad
- pino-http para logs.
- Swagger base habilitado en /docs.

## 13. Roadmap Tecnico
- Landing SEO por vertical con metadatos dinamicos.
- Dashboard GOD con graficas y uso por ciudad.
- Multi-vertical extensible (restaurantes, gimnasios).


---

<!-- INICIO DE ARCHIVO: FEATURES.md -->

# Funcionalidades

Fecha: 2026-03-08

## Core
- Auth + RBAC
- Tenants + branding
- CRM
- Notifications
- Plans
- Reports
- Payments (Mercado Pago)
- Billing (Invoices + impuestos por pais)

## Hospitality (Hosteleria)
- Mesas (tables) + mapa
- POS + ventas
- Kitchen Display (SSE)
- Menu digital (placeholder)

## Legal y compliance
- Consentimiento PTD, Terms, DPA, Cookies, SaaS Agreement.
- ARCO export/delete.

## UI y experiencia
- GSAP para transiciones de ruta y animaciones.
- DynamicBackground + identidad por vertical.
- ModuleGuard con upsell cuando no hay modulo activo.

## Ejemplos rapidos (API)

### POS (venta pagada)
```bash
curl -X POST http://localhost:4000/api/pos/sales \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"items":[{"productId":"p1","name":"Cafe","quantity":1,"price":12}],"paymentMethod":"cash","paymentStatus":"PAGADA","currency":"COP"}'
```

### Orders (cocina)
```bash
curl -X POST http://localhost:4000/api/orders \
	-H "Authorization: Bearer $TOKEN" \
	-H "Content-Type: application/json" \
	-d '{"tableLabel":"Mesa 7","items":[{"name":"Hamburguesa","quantity":2}]}'
```


---

<!-- INICIO DE ARCHIVO: FLOWCHARTS.md -->

# Diagramas de Flujo y Procesos Core - ESSENCE Factory

Este documento amplía la visualización de datos exponiendo, paso a paso, el flujo de operaciones transaccionales críticas a lo largo del sistema y los responsables de cada decisión/actividad.

---

## 1. Onboarding Automático y Generación de Marca (B2B)
El flujo más importante del sistema comercial: cómo un cliente de internet paga y automáticamente se despliega su subdominio completo (Ej. peluqueriaxtrema.essence.com).

```mermaid
sequenceDiagram
    autonumber
    participant ClienteEmprendedor as Nuevo Cliente
    participant FE_Landing as Frontend Factory (Next/React)
    participant BE as Backend Factory (Node/Express)
    participant PG as Payment Gateway (Mercado Pago)
    participant DB as MongoDB

    ClienteEmprendedor->>FE_Landing: Interacción "Comprar Plan" y llena Formulario Onboarding.
    FE_Landing->>BE: POST /users/register-tenant (Form Payload + Card)
    BE->>PG: Tokenize & Charge $50.000 COP
    PG-->>BE: Status: Approved / Captured
    BE->>DB: Iniciar Transacción de Mongo
    BE->>DB: Crear Tenant con subdomain y branding.
    BE->>DB: Crear Branch Primaria (Local Principal).
    BE->>DB: Insertar Usuario (Owner / Admin) asociado al nuevo Tenant.
    BE->>DB: Sembrar Configuraciones por Defecto (Horario L-V / Notificaciones activadas).
    BE->>DB: Commit Transacción y devolver Objetos
    BE-->>FE_Landing: HTTP 201: Tenant Creado y Token JWT.
    FE_Landing-->>ClienteEmprendedor: Redirección Inteligente a <subdomain>.essencefactory.com/barberias-login.
```

---

## 2. Proceso de Agendamiento B2C Inteligente (Filtrado y Colisión)
Exposición de las validaciones a través del backend para impedir dobles reservas.

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente Final B2C
    participant F as Frontend B2C <br>(Subdomain)
    participant B as BookingUseCase (Backend)
    participant R as AppointmentRepo / Mongoose
    participant N as NotificationJob (Redis BullsMQ)

    C->>F: Selecciona Servicio $25.000 COP (Dura 30m)
    C->>F: Selecciona Carlos (Profesional) y Día 14.
    F->>B: GET /barbers/XX/schedules?date=14
    B->>R: Fetch `Appointments` existentes y `ScheduleBlocks` del profesional.
    R-->>B: Retorna datos bloqueados ocupados.
    B->>B: Booking Engine Resta ocupados a Horario Laboral Disponible.
    B-->>F: Devuelve Bloques de Tiempo Limpios (09:00, 09:30, ...)
    C->>F: Confirmar Cita 09:30 (Nombre + Tel WhatsApp).
    F->>B: POST /appointments (Payload)
    B->>R: ¿Hay ya una nueva cita a las 09:30 creada hace ms? (Mutex check).
    alt Colisión Encontrada
        R-->>B: Error (Solapamiento)
        B-->>F: HTTP 409 Conflict. "El horario se acaba de reservar."
    else Todo bien
        B->>R: Insert `Appointment` B2C.
        R-->>B: Success!
        B->>N: Encolar Notificación WhatsApp inmediata a Cliente.
        B->>N: Encolar Recordatorio para Día 14 - 1 Hora.
        B-->>F: HTTP 201 Created.
        F-->>C: Vista de Éxito / Redirect / Landing Home.
    end
```

---

## 3. Dunning Period y Suspensión Forzosa (Gestión Financiera Factory)
Si el software funciona perfecto pero el cliente rebota la tarjeta finalizado el mes:

```mermaid
flowchart TD
    Inicio((Cron Job: Chequeo Diario Dunning)) --> TraerTenants[Obtener Tenants Vencidos del Mes]
    TraerTenants --> Filtrar[Filtrar por Status == ACTIVE]
    
    Filtrar --> A{¿Intento de cobro en MP Exitoso?}
    
    A -- SI --> B[Renovar Fecha de Expiración]
    B --> Fin((Fin normal))
    
    A -- NO --> C{Cuenta Días Impagos (Failed Payments)}
    
    C -- Días == 1 --> D1[Enviar Email Recordatorio 1 (Tranquilo)] --> Fin
    C -- Días == 3 --> D2[Enviar Email Recordatorio 2 (Urgente)] --> Fin
    
    C -- Días >= 5 --> Bloqueo[Sistema: Action Suspend Tenant]
    Bloqueo --> DBChange[(MongoDB: Actualizar STATUS a SUSPENDED)]
    DBChange --> BlockFrontend(Inyectar bandera. Frontend B2C y B2B bloqueado para Operaciones / Mostrar 'Factura Pendiente')
    BlockFrontend --> Fin((Tenant Pausado Legalmente))
```


---

<!-- INICIO DE ARCHIVO: INDEX.md -->

# ESSENCE Factory - Documentacion Extendida

Fecha: 2026-03-08

Este indice agrupa la documentacion tecnica y funcional creada para el equipo.

## Indice
- ARCHITECTURE.md: arquitectura, capas y contratos principales.
- FEATURES.md: funcionalidades por dominio y UI.
- VERTICALS.md: modelo de verticales y rutas dinamicas.
- REALTIME.md: SSE, Kitchen Display y eventos.
- BILLING.md: facturacion e impuestos por pais.
- CONTENT.md: generador de contenido por vertical.
- DEPLOYMENT.md: despliegue y variables clave.
- ONBOARDING.md: guia de entrada para nuevos devs.
- CHANGELOG.md: resumen de cambios por fecha.
- PRD_ESSENCE_FACTORY.md: Documento de Requerimientos de Producto (PRD) de ESSENCE Software Factory.
- FACTORY_SAAS.md: Documentación técnica central del ecosistema.
- MATRIZ_FUNCIONES.md: Matriz de desarrollo transversal por capas y verticales.
- AUDIT_VERTICALS_FEATURE.md: Auditoría de las funciones actuales vs features requeridos.
- RECOMENDACION_FAMILIAS.md: Recomendación estructurada por familias de negocio y módulos.
- DOCUMENTACION_RECOMENDADA.md: Estructuración y priorización para la documentación a mantener en el proyecto.


---

<!-- INICIO DE ARCHIVO: MATRIZ_FUNCIONES.md -->

## 💎 Matriz de Funciones - ESSENCE SOFTWARE FACTORY

Esta matriz define la jerarquia de desarrollo. Ningun desarrollador debe reprogramar una funcion que ya resida en la Capa Core.

---

## 🛡️ Capa 1: Modulos Core (Transversales)
Se programan UNA VEZ. Estan disponibles para las 64 verticales.

| Modulo | Funcionalidad | Responsable |
| --- | --- | --- |
| Auth & RBAC | Registro, login, roles (God, Owner, Staff, Client). | Security Team |
| Payments | Integracion Mercado Pago (Checkout Pro), efectivo, transferencias. | Fintech Team |
| CRM Central | Ficha de cliente, historial unificado, notas y tags. | Core Team |
| Notifications | Motor de WhatsApp (Twilio/API), Email y Push. | DevOps |
| Billing | Generacion de facturas legales y recibos simples. | Legal/Fintech |
| Analytics | Dashboard de KPIs, ventas y reportes de rendimiento. | Data Team |

---

## 🏗️ Capa 2: Modulos Base por Familias
Logica compartida por grupos de industrias. Se reutiliza el motor entre ellas.

### 🧴 Familia: Bienestar (Barberias, Spas, Salones)
- Agenda Inteligente: Bloques de tiempo, servicios y recursos.
- Staff Manager: Turnos, perfiles de empleados y metas.
- Comisiones: Calculo automatico por servicio prestado.

### 🍽️ Familia: Hosteleria (Restaurantes, Bares, Discotecas)
- POS Tactil: Interfaz rapida para comandas y ventas.
- Inventory: Recetas (escandallos), mermas y existencias.
- Multi-Terminal: Sincronizacion entre barra, cocina y mesas.

### 📦 Familia: Retail (Farmacias, Ferreterias, Tiendas)
- Stock Pro: Lotes, fechas de vencimiento y codigos de barras.
- Suppliers: Gestion de proveedores y ordenes de compra.

---

## 💎 Capa 3: Funciones Exclusivas (DNA Especializado)
Aqui es donde el equipo de 7 crea la magia de cada nicho. Son funciones unicas.

| Vertical | Funciones de Alto Valor (Exclusivas) |
| --- | --- |
| Barberias | Tarjeta de sellos virtuales, galeria de cortes (Antes/Despues). |
| Restaurantes | Mapa interactivo de mesas, division de cuentas (Split Bill). |
| Odontologia | Odontograma digital, seguimiento de ortodoncia. |
| Abogados | Custodia de documentos con cifrado, reloj de horas facturables. |
| Veterinarias | Ficha de mascota con carnet de vacunas, geolocalizacion de fincas. |
| Inmobiliarias | Motor de publicacion en portales externos, gestion de llaves. |
| Educacion | Boletin de calificaciones, portal de tareas para padres. |
| Talleres | Historial de mantenimiento por placa, ordenes de trabajo tecnicas. |

---

## 🛠️ Instrucciones para el Equipo de Programadores

**Regla de Oro**
Antes de crear una funcion, revisa si pertenece a la Capa 1. Si vas a pedir el nombre de un cliente, usa el CRM Central, no crees una tabla nueva.

**Logica de Inyeccion**
El archivo `verticalsRegistry.ts` actua como el interruptor. Si una vertical tiene `activeModules: ['pos', 'tables']`, el frontend automaticamente pintara el acceso al Punto de Venta y al Mapa de Mesas.

**Nitidez**
Toda funcion exclusiva debe usar los componentes base de la Factory para que la estetica Cyber-Luxury sea consistente.


---

<!-- INICIO DE ARCHIVO: ONBOARDING.md -->

# Onboarding de desarrollo (48h)

Fecha: 2026-03-08

## Dia 1 (0-4h)
- Leer docs/ARCHITECTURE.md y docs/FEATURES.md.
- Levantar entorno con `npm run dev`.
- Verificar login con usuarios demo.

## Dia 1 (4-8h)
- Revisar verticalsRegistry.ts y rutas dinamicas.
- Ejecutar una venta POS y observar factura creada.
- Probar KitchenDisplay con SSE.

## Dia 2 (0-4h)
- Revisar modulos core y sus rutas principales.
- Revisar ModuleGuard y planes activos.

## Dia 2 (4-8h)
- Tomar una tarea pequena y entregar PR.

## Checklist tecnico
- JWT_SECRET definido.
- Mongo/Redis activos o usar modo memory.
- VITE_API_BASE_URL configurado.

## Convenciones
- Codigo en ingles.
- Comentarios y docs en espanol.
- No logica de negocio en controllers.


---

<!-- INICIO DE ARCHIVO: PRD_ESSENCE_FACTORY.md -->

📄 Documento de Requerimientos de Producto (PRD) - ESSENCE Software Factory
🎯 1. Objetivo del Proyecto
Desarrollar una plataforma SaaS Multi-Tenant escalable que ofrezca soluciones de software especializadas para múltiples sectores comerciales (verticales). El núcleo de la propuesta de valor es el White-Labeling Dinámico: cada cliente (Tenant) debe percibir y operar el sistema como si fuera un software hecho a la medida, con su propia identidad visual y marca. El sistema debe garantizar altos estándares de estética (Nitidez Essence), velocidad y seguridad estructural.

💰 Modelo de Monetización (Tarifa Universal)
Todos los servicios operarán bajo un modelo de suscripción estándar SaaS:

Plan Mensual: $50.000 COP / mes.

Plan Anual: $500.000 COP / año (Ahorro de 2 meses).

🏗️ 2. Componentes Principales de la Arquitectura
Módulo A: Portal Central de la Factory (B2B Core)
Punto de entrada principal para conocer a ESSENCE como empresa matriz.

Sección Institucional: Información de "Quiénes Somos" y la misión de la Factory.

Vitrina de Verticales: Sección destacada con algunos servicios clave (ej. Barberías, Abogados, Restaurantes) y un botón de "Ver todos los servicios" que redirija a un catálogo completo.

Acceso Administrativo: Login exclusivo y oculto para el equipo interno de administradores (Super Admins de ESSENCE).

Internacionalización (i18n): Selector global de idiomas para traducir toda la plataforma.

Módulo B: Landings Dinámicas por Servicio (Industry Verticals)
Páginas de ventas específicas para cada nicho de mercado.

Diseño Dinámico por Nicho: Cada landing debe tener colores, tipografías y distribución de componentes acordes a su sector (Ej. Barberías: rojo, blanco y negro; Salud: azules limpios y blancos).

Contenido Específico: Módulos que ofrece ese servicio en particular, características, capacidades técnicas y beneficios del sector.

Selector de Idioma Local: Capacidad de cambiar el idioma de la landing actual.

Portal de Acceso (Login): Acceso dedicado para que los Tenants que ya contrataron ese servicio específico puedan entrar a su panel de control.

Módulo C: Motor de Suscripción y Onboarding
El embudo de conversión y recolección de datos del cliente.

Pasarela de Pago: Checkout transparente para procesar los $50.000 COP (Mensual) o $500.000 COP (Anual).

Wizard de Onboarding (Setup de Empresa): Un formulario paso a paso donde el Tenant configura su negocio recién creado:

Nombre de la empresa.

Logotipo corporativo.

Ubicación física (Dirección/Mapa).

Teléfonos de contacto.

Identidad visual (Selección de colores primarios de su marca).

Módulo D: Marca Blanca y Portal Público B2C (El Core del Tenant)
El producto final que el Tenant le entrega a sus propios clientes.

Landing Web Pública del Negocio: Una página web única y funcional generada automáticamente para el Tenant (Ej. essence.com/barberias/corte-fino).

Inyección Dinámica de Marca: La landing pública debe usar el logotipo y los colores hexadecimales configurados en el Onboarding, asegurando que el cliente final solo vea la marca del Tenant y no la de ESSENCE.

Información de Contacto: Visualización clara de la dirección, teléfono, mapa y descripción del negocio.

📅 Módulo E: Motor de Reservas Inteligente y Gestión Operativa (Booking & Staff Engine)
Este módulo es el corazón transaccional para verticales basadas en servicios (Barberías, Spa, Consultorios, etc.). Permite a los clientes finales (B2C) autogestionar sus citas bajo un conjunto estricto de reglas de negocio definidas por el Tenant (B2B).

E.1. Flujo de Agendamiento B2C (Experiencia del Cliente Final)
Selección Parametrizada: El cliente selecciona Fecha, Hora y el Servicio específico que desea (Ej. "Corte + Barba - $25.000 COP").

Filtro Inteligente de Profesionales (Skill-based Routing): El sistema debe cruzar el servicio seleccionado con las habilidades de los empleados. En la lista de selección, solo aparecerán los profesionales capacitados y disponibles en ese horario.

Captura de Leads: Formulario final para confirmar la reserva solicitando: Nombre, Correo Electrónico y Teléfono (WhatsApp).

E.2. Sistema Omnicanal de Notificaciones (White-Label Communications)
Identidad de Envío Remitente: Todas las comunicaciones saldrán utilizando el correo y número de teléfono que el Tenant configuró en el Onboarding. (Nota de UX: Añadir un "Disclaimer" obligatorio en el Onboarding advirtiendo al Tenant sobre el uso de sus datos para este fin).

Cronograma de Disparos Automáticos:

Inmediato: Confirmación de reserva (Email y WhatsApp/SMS).

Día de la cita: Recordatorio en cascada faltando 1 hora, 30 minutos y 5 minutos.

Post-cita: Notificación de inasistencia (No-show) si el cliente no se presenta.

E.3. Motor de Reputación y Fidelización (Customer Trust System)
Puntaje Base: Todo cliente nuevo inicia con un saldo de 100 Puntos de Confianza.

Penalización (No-Show): Si el cliente reserva y no asiste, el sistema deduce automáticamente 10 puntos.

Bloqueo (Blacklist Automática): Si el puntaje llega a 0, el sistema bloquea futuras reservas que coincidan con esa triada de datos (Nombre, Correo o Teléfono).

Recompensas (Loyalty): Asistir a la cita suma 10 puntos, los cuales el Tenant puede configur para canjear por recompensas o descuentos futuros.

E.4. Panel de Configuración B2B (Tenant Dashboard)
Gestión de Catálogo: Creación de servicios con nombre, duración y precio dinámico.

Gestión de Staff y Habilidades: Creación de perfiles de profesionales y asignación de "Servicios Permitidos" (Skills) a cada uno.

Motor de Nómina y Comisiones: Configuración del modelo de pago por profesional. El Tenant debe poder elegir si paga por:

Porcentaje (Ej. 50% del servicio).

Valor Fijo (Ej. $10.000 COP por corte).

Ninguno (Solo salario base externo).

Ajustes de Gamificación: Interfaz para que el Tenant active/desactive el sistema de puntos o modifique las reglas de penalización.

👥 Módulo F: Sistema de Empleados y Roles Operativos (RBAC & Staff Portal)
Este módulo dota al sistema de capacidades de operación multi-usuario dentro de un mismo Tenant. Permite al dueño del negocio (Admin) invitar a su equipo de trabajo, asignando permisos granulares basados en el rol físico que desempeñan en la empresa, garantizando seguridad y eficiencia operativa.

F.1. Portal de Acceso para Empleados (Staff Login)
Login Unificado: Los empleados acceden a través de la misma URL administrativa de su Tenant (Ej. essence.com/login), pero el sistema los enruta automáticamente a su "Espacio de Trabajo" (Workspace) dependiendo de su rol.

Autogestión de Perfil: El empleado puede actualizar su foto de perfil, su contraseña y ver sus métricas personales de rendimiento (si el rol lo permite).

F.2. Tipologías de Roles y Permisos Estrictos (Casos de Uso)
El sistema debe soportar una matriz de permisos. Los roles predeterminados por vertical incluyen:

1. Rol: Especialista / Agendado (Ej. Barbero, Médico, Estilista):

Vistas Permitidas: Calendario personal (Mi Agenda), historial de sus clientes atendidos, reporte de sus comisiones generadas en el día/mes.

Acciones: Puede bloquear espacios en su propia agenda (Ej. "Hora de almuerzo" o "Cita médica personal"), marcar citas como "Completadas" o "No Asistió" (No-show).

Restricciones: No puede ver la agenda de otros compañeros, no puede modificar precios de servicios, no tiene acceso a las finanzas globales del local.

2. Rol: Operativo de Sala / POS (Ej. Mesero, Cajero, Vendedor):

Vistas Permitidas: Mapa de Mesas, Terminal de Punto de Venta (POS), Catálogo de productos.

Acciones: Tomar pedidos, enviar comandas a cocina, cobrar cuentas.

Restricciones: No puede aplicar descuentos mayores al permitido, no puede anular facturas pagadas ni borrar órdenes enviadas sin el PIN de autorización del Administrador.

3. Rol: Operativo de Producción (Ej. Cocinero, Bodeguero):

Vistas Permitidas: Exclusivamente el Monitor de Producción (KDS - Kitchen Display System) o Monitor de Despachos.

Acciones: Cambiar el estado de los tickets ("En preparación" -> "Listo para entregar").

Restricciones: Cero acceso a precios, clientes, agendas o facturación. Interfaz 100% enfocada en la producción.

F.3. Control Administrativo (Tenant Owner)
Gestión de Invitaciones: El dueño puede enviar invitaciones por correo o crear las credenciales directamente para su equipo.

Configuración de Horarios Laborales: El Admin define en qué días y horas trabaja cada especialista (Ej. "Carlos trabaja de Lunes a Viernes de 8am a 4pm"). Esto alimenta directamente la disponibilidad en la Landing Pública B2C.

Botón de Pánico (Kill Switch): Capacidad del dueño de suspender o revocar el acceso a un empleado instantáneamente en caso de despido o emergencia.

📊 Módulo G: Inteligencia de Negocio y Finanzas (BI Dashboard)
El dueño del negocio no solo quiere operar; quiere saber cuánto dinero está ganando. Este módulo es el cerebro financiero del Tenant.

Panel Principal (Dashboard B2B): Gráficos en tiempo real (con React y transiciones suaves) que muestren:

Ingresos brutos del día / semana / mes.

Tasa de inasistencia (No-shows vs. Citas completadas).

Ticket promedio de compra.

Rendimiento del Staff: Un ranking automático donde el dueño pueda ver qué empleado genera más ingresos, quién atiende más rápido y quién tiene más "No-shows".

Exportación de Datos: Capacidad de descargar reportes en CSV/PDF para la contabilidad del Tenant.

💳 Módulo H: Gestión de Suscripciones (El Motor de Cobro de la Factory)
Aquí es donde tú (ESSENCE) aseguras tus $50.000 COP mensuales sin perseguir a la gente.

Facturación Recurrente (Dunning Process): Integración con Mercado Pago (o similar) para el cobro automático a la tarjeta de crédito del Tenant.

Periodo de Gracia y Suspensión: Si el cobro falla (ej. tarjeta sin fondos), el sistema envía 3 correos de advertencia. Al día 5 de impago, el sistema cambia el estado del Tenant a SUSPENDIDO.

Efecto de Suspensión: El Tenant no puede acceder a su panel administrativo y su Landing Pública B2C muestra un mensaje amigable de "Sitio temporalmente en mantenimiento" (para no exponer sus problemas financieros ante sus clientes).

Portal de Facturación (Self-Service): Un apartado donde el Tenant puede actualizar su tarjeta, cambiar del plan Mensual al Anual, y descargar sus facturas de ESSENCE.

🛡️ 3. Requisitos No Funcionales (NFRs) - Reglas para el Equipo de Desarrollo
Esta sección es vital para que tus desarrolladores no comprometan la seguridad ni el rendimiento bajo la "Nitidez Essence".

Aislamiento de Datos Estricto (Multi-Tenancy): Es absolutamente obligatorio que cada consulta a la base de datos (Mongoose) incluya el filtro { tenantId: currentTenantId }. Un error aquí significa que una barbería podría ver las citas de un restaurante.

Arquitectura del Código:

Backend: Arquitectura Hexagonal. Prohibido acoplar la lógica de negocio (Dominio) con Express o Mongoose (Infraestructura).

Frontend: Arquitectura Limpia en Next.js. Uso estricto de Tailwind CSS para el estilizado y GSAP para las micro-interacciones.

Resiliencia Offline (Punto de Venta): Los roles operativos (como cajeros o meseros) deben poder seguir tomando órdenes temporalmente si hay micro-cortes de internet, sincronizando los datos con el servidor al reconectar.

Rendimiento (Core Web Vitals): Las Landings Públicas B2C deben cargar en menos de 1.5 segundos. Deben estar generadas de forma estática (SSG) o con renderizado del lado del servidor (SSR) optimizado para SEO, ya que los Tenants querrán posicionar su marca en Google.


---

<!-- INICIO DE ARCHIVO: REALTIME.md -->

# Real-time (SSE)

Fecha: 2026-03-08

## Orders SSE
- Endpoint: GET /api/orders/stream
- Autenticacion: token JWT por query string (EventSource no envia headers).
- Filtrado: tenantId del JWT.

## Orders POST
- Endpoint: POST /api/orders
- Emite evento al ordersHub con tenantId.

## Frontend
- KitchenDisplay consume SSE y alerta con GSAP.
- AdminKitchenPage expone la UI.

## Ejemplo de conexion SSE
```bash
curl -N "http://localhost:4000/api/orders/stream?token=$TOKEN"
```


---

<!-- INICIO DE ARCHIVO: RECOMENDACION_FAMILIAS.md -->

# RECOMENDACIÓN ESTRUCTURADA POR FAMILIAS DE NEGOCIO

Basado en tu visión de ESSENCE Software Factory y la matriz de funciones que has definido, he analizado cada vertical y los módulos base que propones. A continuación te presento una recomendación estructurada por familias de negocio, incluyendo:

* Módulos Core (transversales, siempre presentes)
* Módulos Base (específicos de la familia)
* Módulos Especializados (ADN de cada vertical)
* Funcionalidades clave que debería tener cada uno

Esta organización te permitirá mantener la coherencia de la plataforma, reutilizar lógica y ofrecer un valor diferencial en cada nicho.

### 🔷 Familias y Verticales con sus Módulos

#### 1. Familia: Bienestar y Estética (Servicios por cita)
**Módulos base comunes:** Agenda Inteligente + Staff Management + Comisiones
**Verticales incluidas:**
* Barberías
* Salones de belleza
* Centros de estética avanzada
* Spas y centros de relajación
* Centros de depilación láser
* Veterinarias (mascotas)
* Veterinarias de campo
* Clínicas (humanas)
* Clínicas odontológicas
* Consultorios de psicología
* Tutorías y clases particulares
* Autoescuelas
* Talleres mecánicos
* Servicios domésticos
* Cuidadores de adultos mayores
* Paseadores de perros
* Reparaciones del hogar
* Guías turísticos

**Módulos especializados por vertical:**
* **Barberías / Salones / Estética:**
  * Galería de trabajos (antes/después)
  * Tarjeta de fidelización (sellos virtuales)
  * Recomendaciones de productos (venta cruzada)
* **Veterinarias:**
  * Ficha clínica de mascota (vacunas, historial médico)
  * Recordatorios automáticos de vacunas/desparasitaciones
* **Clínicas odontológicas:**
  * Odontograma digital
  * Seguimiento de tratamientos (ortodoncia, implantes)
* **Psicología / Tutorías:**
  * Notas de sesión privadas
  * Gestión de documentación (consentimientos, informes)
* **Autoescuelas:**
  * Control de prácticas (profesor-alumno)
  * Historial de clases y exámenes
* **Talleres mecánicos:**
  * Historial por vehículo (matrícula)
  * Órdenes de reparación técnicas
* **Servicios domésticos / reparaciones:**
  * Presupuestos y aprobación digital
  * Fotos de trabajo finalizado

#### 2. Familia: Hostelería y Restauración
**Módulos base comunes:** Mesas + POS Táctil + Kitchen Display
**Verticales incluidas:**
* Restaurantes
* Discotecas y bares nocturnos
* Hotelería (pequeños hoteles, hostales)
* Camping y glamping (con gestión de reservas)

**Módulos especializados:**
* **Restaurantes / Bares:**
  * Mapa interactivo de mesas
  * División de cuentas (split bill)
  * Menú digital con QR
  * Control de propinas
* **Hotelería / Camping:**
  * Gestión de habitaciones / parcelas
  * Check-in / check-out exprés
  * Limpieza y mantenimiento
  * Integración con canales de reserva (Booking, Airbnb) – opcional

#### 3. Familia: Retail y Ventas (Productos físicos)
**Módulos base comunes:** Inventario (con lotes, vencimientos) + POS + Proveedores
**Verticales incluidas:**
* Farmacias
* Ópticas
* Tiendas agropecuarias
* Tiendas de ropa y calzado
* Ferreterías
* Papelerías y librerías
* Tiendas de regalos y floristerías
* Tiendas de conveniencia
* Alquiler de mobiliario y sonido
* Teatros y cines independientes
* Parques de atracciones

**Módulos especializados:**
* **Farmacias / Ópticas:**
  * Gestión de lotes y fechas de vencimiento (obligatorio)
  * Recetas médicas digitales (vinculadas a clientes)
  * Venta con o sin receta
* **Tiendas de ropa:**
  * Tallas y colores por producto
  * Gestión de tallas (inventario por variante)
* **Ferreterías / Agropecuarias:**
  * Precios por unidad de medida (metro, kilo, litro)
  * Conversión de unidades
* **Alquiler de mobiliario:**
  * Calendario de disponibilidad por artículo
  * Contratos de alquiler y depósitos
* **Teatros / Cines:**
  - Mapa de butacas (venta de entradas)
  - Funciones y horarios

#### 4. Familia: Educación y Formación
**Módulos base comunes:** Gestión de Suscripciones (matrículas) + Seguimiento de Progreso
**Verticales incluidas:**
* Colegios o universidades
* Academias de idiomas
* Escuelas de música y arte
* Bibliotecas y centros culturales
* Gimnasios
* Servicio fit (rutinas + alimentación)
* Clases particulares (ya cubiertas en Bienestar)

**Módulos especializados:**
* **Colegios / Academias:**
  * Portal de padres (calificaciones, asistencia, tareas)
  * Generación de boletines y certificados
  * Control de pagos (matrícula, mensualidades)
* **Gimnasios / Fit:**
  * Gestión de rutinas y planes de entrenamiento
  * Seguimiento de medidas y progreso físico
  * Check-in por código QR o huella
* **Bibliotecas:**
  * Catálogo de libros y préstamos
  * Gestión de devoluciones y multas

#### 5. Familia: Profesionales y Servicios B2B
**Módulos base comunes:** Proyectos + Tareas + Facturación (con impuestos)
**Verticales incluidas:**
* Despachos de abogados
* Estudios contables
* Asesores financieros
* Gestión de inversiones
* Control de créditos
* Arquitectos e ingenieros
* Constructoras
* Inmobiliarias
* Administradores de fincas
* Agencias de marketing
* Fotógrafos y videógrafos
* Organizadores de eventos
* Mudanzas y fletes
* Mensajería y última milla

**Módulos especializados:**
* **Abogados / Asesores:**
  * Gestión de expedientes y documentos (cifrado)
  * Control de horas facturables (time tracking)
  * Calendario de audiencias y plazos
* **Contables / Financieros:**
  * Libros contables (diario, mayor, balances)
  * Declaraciones de impuestos (preconfiguradas por país)
  * Conciliación bancaria automática
* **Arquitectos / Constructores:**
  * Gestión de planos y versiones
  * Control de presupuestos por obra
  * Certificaciones de avance
* **Inmobiliarias:**
  * CRM de propiedades (fotos, características, precios)
  * Publicación automática en portales externos
  * Gestión de visitas y contratos de arrendamiento
* **Eventos / Mudanzas:**
  * Checklists y tareas por proyecto
  * Asignación de recursos (personal, vehículos)

#### 6. Familia: Logística y Activos
**Módulos base comunes:** Activos + Inventario + Contratos
**Verticales incluidas:**
* Gestión de flotas
* Alquiler de vehículos
* Parqueaderos
* Fincas y cultivos

**Módulos especializados:**
* **Flotas / Alquiler de vehículos:**
  * Mantenimiento programado (kilometraje, fechas)
  * Control de combustible
  * Geolocalización en tiempo real
* **Parqueaderos:**
  * Control de entradas/salidas (tarifa por tiempo)
  * Reservas de cupos
  * Facturación automática
* **Fincas / Cultivos:**
  * Gestión de parcelas y cultivos (rotación, fertilizantes)
  * Control de insumos y cosechas
  * Trazabilidad de productos

#### 7. Familia: E-commerce y Marketplaces
**Módulos base comunes:** Tienda en Línea (storefront) + Carrito de Compras + Pasarela de Pago
**Verticales incluidas:**
* Tienda en Línea (genérica)
* Marketplace Multi-Vendedor

**Módulos especializados:**
* **Marketplace:**
  * Gestión de vendedores (comisiones, pagos)
  * Catálogo centralizado con atributos por categoría
  * Valoraciones y reseñas
  * Logística de envíos (integración con transportadoras)

### 🧩 Módulos Core (Siempre Presentes)
Estos módulos son transversales a todas las verticales y deben estar implementados de forma centralizada, sin duplicación:
* **Auth y RBAC** (con roles: Super Admin, Owner, Staff, Client)
* **Gestión de Tenants** (branding, planes, límites)
* **Suscripciones y Facturación** (cobro recurrente, facturas legales)
* **Notificaciones** (WhatsApp, Email, SMS – con identidad white‑label)
* **CRM Central** (ficha única de clientes con historial)
* **Analíticas y Reportes** (ventas, comisiones, inasistencias)
* **Configuración** (generales del negocio, horarios, políticas)

### 📌 Recomendaciones para la Implementación
**Usa el `verticalsRegistry.ts` para definir por cada vertical:**
* `baseModules`: los módulos base que necesita (ej. `['agenda', 'staff']`)
* `features`: lista de funcionalidades especializadas (ej. `['odontograma', 'recetas']`)
* `activeModules`: combinación de base + especializados (para el ModuleGuard)

**Prioriza el desarrollo por familias**
Comienza con la familia de Bienestar (Barberías, etc.) porque tu motor de reservas ya está avanzado, y luego Hostelería (Restaurantes) para aprovechar el POS y el KDS. Las familias más complejas (B2B, Logística) pueden ir en fases posteriores.

**Asegura la reutilización**
Antes de programar una función para una vertical, verifica si ya existe en la Capa Core o en otra familia. Por ejemplo, el "control de horas facturables" de abogados podría servir para arquitectos o consultores.

**Diseña pensando en la personalización**
Las funcionalidades exclusivas deben construirse como plugins o componentes configurables, de modo que puedan activarse/desactivarse sin afectar el núcleo.


---

<!-- INICIO DE ARCHIVO: REQUIREMENTS.md -->

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


---

<!-- INICIO DE ARCHIVO: UML_DIAGRAMS.md -->

# Diagramas UML de Clases - ESSENCE Factory

Requerimiento: Este documento avanza las definiciones puras Entity-Relational, brindando Diagramas de Clase OOD (Orientados a Objetos) basados en Mermaid para exponer el Domain Driven Design (DDD) implementado en TypeScript (Backend Clean Architecture).

---

## 1. Domain Object Model (Core Multi-Tenant)
La interconexión arquitectónica que muestra la visibilidad y responsabilidades técnicas inyectadas vía constructor (Casos de uso / Clases).

```mermaid
classDiagram
    class Plan {
        +String name
        +Float price
        +Int maxBranches
        +Int maxBarbers
        +Int maxMonthlyAppointments
        +Boolean isActive()
    }

    class Tenant {
        +String id
        +String name
        +String subdomain
        +Object customColors
        +String status
        +String planId
        +provisionEnvironment()
        +suspendTenantService()
    }

    class Branch {
        +String id
        +String tenantId
        +String name
        +String address
        +Boolean active
        +assignToUser()
    }

    class UserRole {
        <<enumeration>>
        GOD
        ADMIN
        STAFF
        CLIENT
    }

    class User {
        +String id
        +String tenantId
        +String email
        +String passwordHash
        +Float commissionRate
        +Boolean whatsappConsent
        +UserRole role
        +validateCredentials(string pswd)
        +updateTrustScore(int delta)
    }

    Plan "1" -- "0..*" Tenant : subscribe
    Tenant "1" *-- "1..*" Branch : owns (Aggregation)
    Tenant "1" *-- "1..*" User : registers
    User -- UserRole : type definition
```

---

## 2. Diagrama de Módulo Citas (Booking Engine)

Este esquema relacional expone las dependencias y servicios involucrados para que un usuario reserve tiempo contra las entidades horarias de la clínica/salón (Tenant).

```mermaid
classDiagram
    class Service {
        +String id
        +String tenantId
        +String name
        +Float  price
        +Int expectedDurationMinutes
        +toggleAvailability()
    }

    class Appointment {
        +String id
        +String tenantId
        +String branchId
        +String clientId
        +String barberId
        +String serviceId
        +Datetime startAt
        +Datetime endAt
        +String status
        +markAsNoShow()
        +completeAppointment()
    }

    class ScheduleBlock {
        +String id
        +String barberId
        +Datetime blockStart
        +Datetime blockEnd
        +String reason
    }

    class BookingEngine {
        <<Interface>>
        +findAvailableSlots(barberId, date)
        +detectCollision(newAppointment)
    }

    User "1" <-- "0..*" Appointment : Client (Books)
    User "1" <-- "0..*" Appointment : Barber/Staff (Host)
    Branch "1" <-- "0..*" Appointment : location
    Service "1" <-- "0..*" Appointment : defines
    User "1" *-- "0..*" ScheduleBlock : holds

    BookingEngine ..> Appointment : Creates rules
```

## 3. Comentarios Backend (Clean Architecture / TypeScript Classes)
Esta vista conceptualiza que las clases `User` o `Appointment` de Domain no extienden de Clases `Mongoose Document`. Las implementaciones de repositorios (e.g. `MongoUserRepository implements IUserRepository`) realizan la traducción OOD -> ORM (Dapper/Mongoose) impidiendo el acoplamiento.


---

<!-- INICIO DE ARCHIVO: USER_MANUAL.md -->

# Manual de Usuario Integral - ESSENCE Multi-Tenant

**Versión:** 1.0
**Target:** GOD, Tenant Admin, Staff, Cliente Final

Este manual define el uso práctico del sistema dependiendo de las responsabilidades asignadas (Roles).

---

## 1. Portal de Super Administrador (Rol: GOD)
*Punto de entrada: `<dominio-raiz>/admin-login`*

### 1.1 Funcionalidades
El panel principal de ESSENCE Factory (B2B Core). Únicamente usado para administrar a los Tenants.
1. **Gestión de Planes:** Menú "Planes" -> Puedes alterar los límites (máximo de sucursales, máximo de empleados) de los planes base o premium universalmente.
2. **Dashboard de Métricas Métricas:** Visualiza consumo de recursos de terceros (WhatsApp API) y evalúa los tenants más fuertes de la vertical.
3. **Suspension Force:** Menú "Empresas" -> Identifica un Tenant e interrumpe el servicio (Suspended) utilizando el Kill Switch de emergencia a nivel raíz del SaaS.

---

## 2. Portal de Administrador de Negocio (Rol: Tenant Owner/Admin)
*Punto de entrada: `<subdominio>.essencefactory.com/barberias-login`*

### 2.1 Módulo de Inteligencia de Negocios
1. Inicie sesión en el sistema.
2. La vista principal (Dashboard) resume ingresos del día actual y ticket promedio.
3. El panel superior provee filtros de Rango (ej. Semana pasada, Mes actual) para exportar comisiones de los empleados.

### 2.2 Gestión Operativa (Configuración)
1. **Gestión de Staff y Comisiones:**
   - Nav-> "Team" -> Puedes configurar variables (Fijo o Porcentaje).
   - Puedes invitar un empleado asignando los Subroles de Especialista o Cajero (POS operativo).
2. **Catálogo de Servicios:**
   - Nav -> "Servicios" -> Inserta y define la duración de un servicio (en bloques de 15 minutos).

---

## 3. Espacio del Especialista Laboral (Rol: Staff / Barbero / Médico)
*Punto de entrada: `<subdominio>.essencefactory.com` (Usa el mismo login con validación de roles)*

1. **Mi Agenda:**
   - Visualización por semana/día.
   - Posibilidad de crear eventos "Privados / Bloqueos" para horas de almuerzo. No le pueden agendar en un bloqueo.
2. **Registro Post-Cita:**
   - Clic a cita vigente -> "Marcar Entregado" (calcula automáticamente sus comisiones) o "No Asistió". Si marca "No-show", el sistema ejecutará lógicas automáticas contra el perfil del cliente final. No hay retroceso (debe pedirle a su Tenant Admin corregirlo).

---

## 4. Experiencia de Reserva B2C (Cliente Final)
*Punto de entrada: La página principal del negocio (Ej. `barberiaxtrema.essence.com`)*

1. El cliente interactúa con la página de marca blanca (colores del negocio, logos del negocio).
2. Botón "Reservar Cita".
3. **Paso 1:** Selecciona un servicio de la tienda.
4. **Paso 2:** Selecciona un profesional filtrado dinámicamente o la opción "Sin Preferencia".
5. **Paso 3:** Ve el calendario dinámico. Selecciona fecha y hora.
6. **Paso 4:** Ingresa nombre y número (se exige +57 o el country code respectivo del Tenant para WhatsApp).
7. Se arroja la confirmación visual y el cliente entra en el bucle de "Customer Trust System" con 100 puntos.


---

<!-- INICIO DE ARCHIVO: USER_STORIES.md -->

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


---

<!-- INICIO DE ARCHIVO: VERTICALS.md -->

# Verticales y rutas dinamicas

Fecha: 2026-03-08

## Vertical Registry
Archivo: frontend/src/shared/constants/verticalsRegistry.ts
- Define slug, name, family, activeModules, baseModules, features, labels y theme.
- El frontend usa esta fuente unica para landings y chips por vertical.

## Rutas
- /landing/:slug (legacy)
- /:verticalId (dinamica por vertical)
- /404 (not found con estilo Essence)

## Notas
- VerticalLandingPage busca vertical por slug o verticalId y redirige a /404 si no existe.
- LandingLayout aplica transicion GSAP por ruta.

## Ejemplo de ruta
- /restaurantes -> carga vertical restaurantes
- /discotecas-bares -> carga vertical discotecas

## Ejemplo de entrada en registry
```ts
{
	slug: 'restaurantes',
	name: 'Restaurantes',
	activeModules: ['tables', 'pos', 'kitchen_display'],
	baseModules: ['tables', 'pos'],
	features: ['Mapa de mesas', 'Comandas a cocina'],
	labels: { staff: 'Mesero', service: 'Plato' },
	theme: { primary: '#F39237', secondary: '#D9381E' }
}
```
