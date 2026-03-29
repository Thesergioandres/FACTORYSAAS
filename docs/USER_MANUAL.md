# Manual de Usuario Integral - ESSENCE Multi-Tenant

**Versión:** 1.0
**Target:** GOD, Tenant Admin, Staff, Cliente Final

Este manual define el uso práctico del sistema dependiendo de las responsabilidades asignadas (Roles).

---

## 1. Portal de Super Administrador (Rol: GOD)
*Punto de entrada: `<dominio-raiz>/admin-login`*

### 1.1 Funcionalidades
El panel principal de ESSENCE Factory (B2B Core). Únicamente usado para administrar a los Tenants.
1. **Gestión de Planes:** Menú "Planes" -> Puedes alterar los límites (máximo de sucursales, máximo de empleados) de los planes base o premium universalmente.
2. **Dashboard de Métricas Métricas:** Visualiza consumo de recursos de terceros (WhatsApp API) y evalúa los tenants más fuertes de la vertical.
3. **Suspension Force:** Menú "Empresas" -> Identifica un Tenant e interrumpe el servicio (Suspended) utilizando el Kill Switch de emergencia a nivel raíz del SaaS.

---

## 2. Portal de Administrador de Negocio (Rol: Tenant Owner/Admin)
*Punto de entrada: `<subdominio>.essencefactory.com/barberias-login`*

### 2.1 Módulo de Inteligencia de Negocios
1. Inicie sesión en el sistema.
2. La vista principal (Dashboard) resume ingresos del día actual y ticket promedio.
3. El panel superior provee filtros de Rango (ej. Semana pasada, Mes actual) para exportar comisiones de los empleados.

### 2.2 Gestión Operativa (Configuración)
1. **Gestión de Staff y Comisiones:**
   - Nav-> "Team" -> Puedes configurar variables (Fijo o Porcentaje).
   - Puedes invitar un empleado asignando los Subroles de Especialista o Cajero (POS operativo).
2. **Catálogo de Servicios:**
   - Nav -> "Servicios" -> Inserta y define la duración de un servicio (en bloques de 15 minutos).

---

## 3. Espacio del Especialista Laboral (Rol: Staff / Barbero / Médico)
*Punto de entrada: `<subdominio>.essencefactory.com` (Usa el mismo login con validación de roles)*

1. **Mi Agenda:**
   - Visualización por semana/día.
   - Posibilidad de crear eventos "Privados / Bloqueos" para horas de almuerzo. No le pueden agendar en un bloqueo.
2. **Registro Post-Cita:**
   - Clic a cita vigente -> "Marcar Entregado" (calcula automáticamente sus comisiones) o "No Asistió". Si marca "No-show", el sistema ejecutará lógicas automáticas contra el perfil del cliente final. No hay retroceso (debe pedirle a su Tenant Admin corregirlo).

---

## 4. Experiencia de Reserva B2C (Cliente Final)
*Punto de entrada: La página principal del negocio (Ej. `barberiaxtrema.essence.com`)*

1. El cliente interactúa con la página de marca blanca (colores del negocio, logos del negocio).
2. Botón "Reservar Cita".
3. **Paso 1:** Selecciona un servicio de la tienda.
4. **Paso 2:** Selecciona un profesional filtrado dinámicamente o la opción "Sin Preferencia".
5. **Paso 3:** Ve el calendario dinámico. Selecciona fecha y hora.
6. **Paso 4:** Ingresa nombre y número (se exige +57 o el country code respectivo del Tenant para WhatsApp).
7. Se arroja la confirmación visual y el cliente entra en el bucle de "Customer Trust System" con 100 puntos.
