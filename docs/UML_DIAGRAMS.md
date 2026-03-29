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
