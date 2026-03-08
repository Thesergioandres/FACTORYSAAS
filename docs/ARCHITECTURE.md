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
