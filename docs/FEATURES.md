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
