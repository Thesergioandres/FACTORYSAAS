# Especificación Formal de API REST - ESSENCE Factory

Esta hoja de especificaciones es un recurso de referencia técnica de las Interfáz API HTTP que comunica la SPA B2B/B2C con la capa de `infrastructure` (Backend API). Se utiliza la convención HTTP Estándar (Verbos GET, POST, PATCH y DELETE).

El `Base URL` en producción se definirá como `https://api.essencefactory.com/v1`

---

## Encabezados Predeterminados (Headers Obligatorios)
- `Authorization`: `Bearer <JWT_TOKEN_CADENA_STRING>` (Generado al LogIn. Omítase si la ruta es pública como la pasarela de reservas B2C).
- `Content-Type`: `application/json`

---

## API Routes & Endpoints Core

### 1. Autenticación `/auth`

**1.1 POST `/auth/login`**
  - **Descripción:** Inicia la bóveda de sesión. Genera JWT Básico.
  - **Body (Input):**
    ```json
    {
      "email": "owner@miestilo.com",
      "password": "SecurePassword123"
    }
    ```
  - **Success (200 OK):**
    ```json
    {
      "token": "eyJhbG...",
      "user": {
        "id": "673cfddf1xx",
        "role": "ADMIN",
        "tenantId": "tnt_83abc"
      }
    }
    ```
  - **Error (401 Unauthorized):** Fallo Credenciales.

---

### 2. Administración y Usuarios B2B `/users`

**2.1 POST `/users/register-tenant`**
  - **Descripción:** Creador principal de Onboarding Completo (Viene luego del cobro de Stripe/MercadoPago).
  - **Body (Input):** Formulario Front con campos (`companyName`, `subdomain`, config de `customColors`, datos del propietario en crudo `ownerName`, `phone`, etc.).
  - **Returns (201 Created):** Entidades Tenant y User generadas.

**2.2 GET `/users/public/barbers`**
  - **Descripción:** *Ruta Pública.* Expone a los profesionales de nuestro `Tenant` específico al portal B2C filtrando quienes tienen visibilidad activa.
  - **Params:** `?tenantId=tnt_xx` (Obligatorio en Request Parameter si es B2C y no trae Auth JWT que extraiga el tenant).
  - **Returns (200 OK):** Lista de IDs y Nombres con sus Skills fotográficas.

---

### 3. Motor de Citas & Reservaciones `/appointments`

**3.1 GET `/appointments`**
  - **Descripción:** Recupera la parrilla general de citas del negocio.
  - **Filtros de Query (Opcionales):** `?branchId=Y&barberId=X&date=YYYY-MM-DD`
  - **Returns (200 OK):**
    ```json
    [
      {
        "id": "app_54rfv",
        "clientId": "cli_99x",
        "clientName": "Juan Perez",
        "startAt": "2026-03-14T09:30:00Z",
        "endAt": "2026-03-14T10:00:00Z",
        "serviceId": "svc_12",
        "status": "SCHEDULED"
      }
    ]
    ```

**3.2 POST `/appointments`**
  - **Descripción:** Insertar y apartar bloque horario nuevo de la Web de Reservas Pública.
  - **Validaciones:** Backend valida cruce (Colisiones), validación de variables. Si hay conflicto: responde `409 Conflict`. Si es exitoso responde `201 Created`. Encola trabajo en Redis (BullMQ Notification Engine).

**3.3 PATCH `/appointments/:id/status`**
  - **Descripción:** Especialistas marcando estado del cliente.
  - **Body (Input):**
    ```json
    {
      "status": "COMPLETED" // Enum: SCHEDULED, COMPLETED, NO_SHOW, CANCELLED
    }
    ```
  - **Lógica lateral:** Dependiendo del estado (e.g. `NO_SHOW`), el controlador despacha el EventBus para punir el _Trust Score_ del cliente.

---

### 4. Inteligencia y POS API `/reports` y `/inventory`

**4.1 GET `/reports/summary`**
  - **Protección:** JWT Requerido. Solo Role `ADMIN`.
  - **Descripción:** Retorna agregaciones MongoDB (Aggregate pipeline).
  - **Returns (200 OK):**
    ```json
     {
       "totalRevenue": 4500000,
       "completedAppointmentsCount": 112,
       "noShowRate": "3.5%"
     }
    ```

**4.2 POST `/inventory/sales` (Integración POS)**
  - **Descripción:** Ejecución de venta rápida de terminales y tickets físicos/comandas.
  - **Body (Input):**
    ```json
    {
      "items": [
        { "productId": "prd_24x", "quantity": 1 }
      ],
      "paymentMethod": "CASH"
    }
    ```
  - **Returns (201 Created):** Resta cantidad de MongoDB en tiempo real. 
