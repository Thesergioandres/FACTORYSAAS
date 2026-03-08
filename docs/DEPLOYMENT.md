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
