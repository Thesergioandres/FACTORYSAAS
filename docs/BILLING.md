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
