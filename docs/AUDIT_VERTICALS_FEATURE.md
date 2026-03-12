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
