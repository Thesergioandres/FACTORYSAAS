# 💎 ESSENCE SOFTWARE FACTORY - Infraestructura SaaS Global

**Vision:** La fabrica de software multi-tenant para 64 industrias, con marca propia, control por roles y motores operativos listos para escalar.

---

## 🧭 Mapa General

| Tema | Descripcion |
| --- | --- |
| Proposito | Plataforma SaaS white-label multiindustria con despliegue rapido y crecimiento medible. |
| Arquitectura | Monorepo con frontend (React) y backend (Node.js) desacoplados por API. |
| Legal | La Politica de Tratamiento de Datos (PTD) es obligatoria en cualquier nuevo modulo que recolecte datos personales en Colombia. |

---

## 🧰 Stack Tecnologico

| Capa | Stack |
| --- | --- |
| Frontend | React + TypeScript + Vite + Tailwind + GSAP |
| Backend | Node.js + Express + TypeScript + Clean Architecture |
| Datos | MongoDB (Mongoose) |
| Observabilidad | Pino + logs estructurados |

---

## ⚙ Motores Core (Nuevos Modulos)

| Modulo | Rol operativo | Estado |
| --- | --- | --- |
| POS | Ventas, caja, cierres diarios, reportes | ✅ Base creada |
| Mesas | Estados de mesas, turnos y flujo | ✅ Base creada |
| Proyectos | Seguimiento, estados y entregables | ✅ Base creada |
| Suscripciones | Control de planes y renovaciones | ✅ Base creada |

---

## 🧱 Arquitectura (Resumen)

```text
frontend/         React + Vite + Tailwind + GSAP
  src/modules/    Modulos por dominio
backend/          Node.js + Express + TypeScript
  src/modules/    Clean Architecture (domain/application/infrastructure/interfaces)
```

---

## 🚀 Guia de Instalacion

### 1) Instalacion global

```bash
npm install
```

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4) Variables de entorno (.env)

Crea los .env desde los templates y completa las variables clave:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend (.env)**
```bash
MONGODB_URI=mongodb://localhost:27017/factorysaas
JWT_SECRET=change-me
MP_ACCESS_TOKEN=***
MP_WEBHOOK_URL=https://tu-dominio.com/api/payments/webhook
MP_SUCCESS_URL=https://tu-dominio.com/ok
MP_FAILURE_URL=https://tu-dominio.com/error
MP_PENDING_URL=https://tu-dominio.com/pendiente
MP_CURRENCY=COP
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
```

**Frontend (.env)**
```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 🧩 Rutas clave

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000/api |
| Docs API | http://localhost:4000/docs |

---

## 🔐 Seguridad de Datos

- Passwords: bcrypt.
- Transporte: TLS en produccion.
- Backups: Google Cloud Storage.
- PTD obligatoria en nuevos modulos que procesen datos personales en Colombia.

---

## 🛠 Desarrollo para Equipo

- Code ownership por modulo.
- Reglas de performance: animaciones GSAP con cleanup y sin layout thrashing.
- Reglas de UI: uso consistente de variables de marca y EssenceMicroSymbol.

---

## 📄 Legal

- Terminos del Servicio: /legal/terms
- Politica de Privacidad: /legal/privacy
- Politica de Tratamiento de Datos: /legal/ptd
- Politica de Cookies: /legal/cookies
- DPA: /legal/dpa
- SLA: /legal/saas

---

## ✅ Checklist de arranque

```bash
# En una terminal
npm install

# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm run dev
```
