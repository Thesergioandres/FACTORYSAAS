# Arquitectura del Sistema: BarberSync SaaS

Este documento describe la arquitectura técnica, los componentes clave y los flujos de datos principales del ecosistema `BarberSync`.

## Topología General

El sistema opera bajo un entorno de despliegue monolítico modular dividido en Frontend y Backend, diseñado nativamente como un sistema **Multi-Tenant** (SaaS).

- **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS. Consumido por clientes, barberos, administradores y Super Admin (GOD).
- **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB). Responsable de la API REST y la regla de negocio.
- **Workers/Background:** BullMQ con Redis, procesando encolamiento de notificaciones por WhatsApp.

---

## 1. Flujo de Autenticación y Multi-Tenancy

Cada petición al sistema determina a qué negocio (Tenant) pertenece la acción.

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant API
    participant MongoDB

    Usuario->>Frontend: Ingresa Email y Password
    Frontend->>API: POST /auth/login { email, password }
    API->>MongoDB: Busca Usuario por Email
    MongoDB-->>API: User (con Role y TenantId cruzado)
    API->>API: Verifica Password y firma JWT
    API-->>Frontend: Retorna { token, user: { role, tenantId } }

    Note over Frontend, API: Las siguientes peticiones incluyen Auth Bearer Token
    Frontend->>API: GET /appointments (Contexto Global)
    API->>API: Extrae tenantId del token y filtra la BDD
    API-->>Frontend: Retorna solo las citas del Tenant del usuario
```

---

## 2. Flujo de Agendamiento de Citas (Cliente)

Describe cómo un cliente reserva una cita en una Sede (Sucursal) específica.

```mermaid
sequenceDiagram
    actor Cliente
    participant Frontend
    participant API Appointments
    participant API Notifications
    participant WhatsApp (Meta/Twilio)

    Cliente->>Frontend: Selecciona Sucursal (Sede), Barbero, Servicio y Fecha
    Frontend->>API Appointments: POST /appointments { branchId, barberId, serviceId, startAt }
    API Appointments->>API Appointments: Valida colisiones de tiempo y Reglas (Tiempo de Buffer)
    API Appointments->>MongoDB: Guarda la Cita
    API Appointments->>API Notifications: Dispara Evento 'APPOINTMENT_CREATED'
    API Appointments-->>Frontend: 201 Cita Creada

    Note over API Notifications: Background Job (BullMQ)
    API Notifications->>API Notifications: Resuelve Macro {tenant} y {fecha}
    API Notifications->>WhatsApp (Meta/Twilio): Envía mensaje al teléfono del Cliente y Barbero
    WhatsApp (Meta/Twilio)-->>API Notifications: Status DELIVERED
```

---

## 3. Entidades Core (Diagrama de Dominio Físico)

```mermaid
erDiagram
    TENANT ||--o{ BRANCH : "tiene multiples"
    TENANT ||--o{ USER : "pertenece a"
    TENANT ||--o{ SERVICE : "ofrece"
    TENANT ||--o{ APPOINTMENT : "contiene"

    BRANCH ||--o{ APPOINTMENT : "ocurre en"

    USER ||--o{ APPOINTMENT : "crea / atiende"
    SERVICE ||--o{ APPOINTMENT : "es provisto en"

    TENANT {
        string id PK
        string slug "URL amigable"
        boolean active
        object config "Horarios y Buffer"
    }

    USER {
        string id PK
        string role "GOD, ADMIN, BARBER, CLIENT"
        string tenantId FK
        string[] branchIds "Donde trabaja"
    }

    APPOINTMENT {
        string id PK
        string tenantId FK
        string branchId FK
        string barberId FK
        string clientId FK
        datetime startAt
        string status "PENDIENTE, CONFIRMADA, CANCELADA"
    }
```
