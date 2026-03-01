# Organización del Trabajo y División de Tareas para Equipo de 5 Miembros

Pasar de este robusto código base a Producción (y su consecuente mantenimiento/evolución) en un equipo de **5 personas** requiere delimitar responsabilidades para evitar colisiones en Git y optimizar tiempos.

Bajo una metodología Ágil (Scrum/Kanban), a continuación se presenta el escenario ideal de roles y tareas a asignar.

---

## Miembro 1: Líder de Frontend (React / UI / UX)

**Perfil:** Experto en React, Tailwind, Context API e interfaces intuitivas.
**Tareas a corto plazo (Go-Live):**

1. Conectar las Vistas (React) a la nueva implementación en la pasarela de pagos (si se decide hacer reserva con abono en el checkout).
2. Mejorar el diseño de la Landing Page pública (donde caen los clientes orgánicos antes de hacer login) para vender la plataforma SaaS.
3. Consumir los errores de la API de forma gráfica (toasts de error amigables).
4. Preparar el build de producción en Vercel, Netlify o Cloudflare Pages.

## Miembro 2: Líder de Backend (Node.js / Arquitectura Core)

**Perfil:** Dominio fuerte de Express, TypeScript, Patrones de Arquitectura Hexagonal y seguridad JWT.
**Tareas a corto plazo (Go-Live):**

1. **Migración DB:** Enchufar permanentemente MongoDB y escribir los Modelos Mongoose (ya casi finalizados) para reemplazar el 100% de la Mock DB (`InMemory`).
2. Implementar medidas de seguridad anti-DDoS o de límite de peticiones (Rate Limiting) especialmente en las rutas de Login y Agendamiento.
3. Asegurar los crons / background jobs manejados por BullMQ para que el proceso asíncrono no sature la máquina principal.

## Miembro 3: Especialista de Integraciones Externas y Base de Datos

**Perfil:** Resolutivo, maneja lectura de documentación de terceros, SDKs, y optimización de bases de datos.
**Tareas a corto plazo (Go-Live):**

1. **WhatsApp API:** Reemplazar el servicio Console Logger por la integración oficial con la API de WhatsApp Cloud (Meta) o Twilio. Registrar la plantilla oficial en Meta (ej: "Tu cita es el {date}").
2. **Pasarelas de Pago:** Desarrollar los Webhooks necesarios (`POST /webhooks/stripe`) para activar suscripciones de los Tenants/Business Admins de forma automática cuando paguen por tarjeta.
3. Revisar índices en MongoDB para optimizar las consultas a medida que crecen las reservas (`tenantId_index`, `date_index`).

## Miembro 4: DevOps y Release Manager

**Perfil:** Manejo de la nube (AWS/Railway/Docker), CI/CD, Linux, Redes.
**Tareas a corto plazo (Go-Live):**

1. Configuración de **Railway**, Render, o AWS para el servidor Backend Express.
2. Inyectar correctamente todas las variables de entorno de `Producción` separadas del entorno local.
3. Levantar la instancia externa de **Redis** alojada en la nube para que `BullMQ` consuma los mensajes de WhatsApp sin que todo resida en memoria de un solo server.
4. Mantenimiento del Nombre de Dominio (DNS), Certificados SSL (HTTPS) y reglas de CORS en el backend.

## Miembro 5: Product Owner / QA Engineer (Gestión e Interfaz)

**Perfil:** Visión funcional de producto comercial, capacidad de pruebas exhaustivas y entendimiento comercial.
**Tareas a corto plazo (Go-Live):**

1. Elaborar e inyectar el set de datos "Semilla" de producción (Crear y validar manualmente con el Súper Admin (GOD) a los 3 primeros negocios piloto del mundo real).
2. Probar manual y automatizadamente todos los casos límite (Ej: Qué pasa si un cliente aparta un turno a las 3:00 am, qué pasa si 2 clientes hacen clic en el mismo horario al mismo tiempo).
3. Redactar las incidencias y errores en el panel de Trello/Jira de forma documentada para que Miembro 1 o 2 las resuelvan antes de Lanzamiento.
4. Hacer demos de la aplicación al usuario final y recibir su retroalimentación funcional (Customer Success).

---

### Estrategia de Ramas en GitHub (Git Flow)

- Nadie tocará la rama `main` de manera directa.
- El repositorio GitHub (ahora creado) usará **Pull Requests**.
- Ejemplo: Miembro 1 crea rama `feat/ui-checkout-pago`, termina y pide a Miembro 2 que revise el PR antes de entrar a `main`.
- DevOps (Miembro 4) conectará `main` para que cada vez que cambie, se actualicen los servidores en la nube sin intervención humana.
