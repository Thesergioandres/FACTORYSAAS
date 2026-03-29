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
