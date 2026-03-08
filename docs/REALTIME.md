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
