📄 Documento de Requerimientos de Producto (PRD) - ESSENCE Software Factory
🎯 1. Objetivo del Proyecto
Desarrollar una plataforma SaaS Multi-Tenant escalable que ofrezca soluciones de software especializadas para múltiples sectores comerciales (verticales). El núcleo de la propuesta de valor es el White-Labeling Dinámico: cada cliente (Tenant) debe percibir y operar el sistema como si fuera un software hecho a la medida, con su propia identidad visual y marca. El sistema debe garantizar altos estándares de estética (Nitidez Essence), velocidad y seguridad estructural.

💰 Modelo de Monetización (Tarifa Universal)
Todos los servicios operarán bajo un modelo de suscripción estándar SaaS:

Plan Mensual: $50.000 COP / mes.

Plan Anual: $500.000 COP / año (Ahorro de 2 meses).

🏗️ 2. Componentes Principales de la Arquitectura
Módulo A: Portal Central de la Factory (B2B Core)
Punto de entrada principal para conocer a ESSENCE como empresa matriz.

Sección Institucional: Información de "Quiénes Somos" y la misión de la Factory.

Vitrina de Verticales: Sección destacada con algunos servicios clave (ej. Barberías, Abogados, Restaurantes) y un botón de "Ver todos los servicios" que redirija a un catálogo completo.

Acceso Administrativo: Login exclusivo y oculto para el equipo interno de administradores (Super Admins de ESSENCE).

Internacionalización (i18n): Selector global de idiomas para traducir toda la plataforma.

Módulo B: Landings Dinámicas por Servicio (Industry Verticals)
Páginas de ventas específicas para cada nicho de mercado.

Diseño Dinámico por Nicho: Cada landing debe tener colores, tipografías y distribución de componentes acordes a su sector (Ej. Barberías: rojo, blanco y negro; Salud: azules limpios y blancos).

Contenido Específico: Módulos que ofrece ese servicio en particular, características, capacidades técnicas y beneficios del sector.

Selector de Idioma Local: Capacidad de cambiar el idioma de la landing actual.

Portal de Acceso (Login): Acceso dedicado para que los Tenants que ya contrataron ese servicio específico puedan entrar a su panel de control.

Módulo C: Motor de Suscripción y Onboarding
El embudo de conversión y recolección de datos del cliente.

Pasarela de Pago: Checkout transparente para procesar los $50.000 COP (Mensual) o $500.000 COP (Anual).

Wizard de Onboarding (Setup de Empresa): Un formulario paso a paso donde el Tenant configura su negocio recién creado:

Nombre de la empresa.

Logotipo corporativo.

Ubicación física (Dirección/Mapa).

Teléfonos de contacto.

Identidad visual (Selección de colores primarios de su marca).

Módulo D: Marca Blanca y Portal Público B2C (El Core del Tenant)
El producto final que el Tenant le entrega a sus propios clientes.

Landing Web Pública del Negocio: Una página web única y funcional generada automáticamente para el Tenant (Ej. essence.com/barberias/corte-fino).

Inyección Dinámica de Marca: La landing pública debe usar el logotipo y los colores hexadecimales configurados en el Onboarding, asegurando que el cliente final solo vea la marca del Tenant y no la de ESSENCE.

Información de Contacto: Visualización clara de la dirección, teléfono, mapa y descripción del negocio.

📅 Módulo E: Motor de Reservas Inteligente y Gestión Operativa (Booking & Staff Engine)
Este módulo es el corazón transaccional para verticales basadas en servicios (Barberías, Spa, Consultorios, etc.). Permite a los clientes finales (B2C) autogestionar sus citas bajo un conjunto estricto de reglas de negocio definidas por el Tenant (B2B).

E.1. Flujo de Agendamiento B2C (Experiencia del Cliente Final)
Selección Parametrizada: El cliente selecciona Fecha, Hora y el Servicio específico que desea (Ej. "Corte + Barba - $25.000 COP").

Filtro Inteligente de Profesionales (Skill-based Routing): El sistema debe cruzar el servicio seleccionado con las habilidades de los empleados. En la lista de selección, solo aparecerán los profesionales capacitados y disponibles en ese horario.

Captura de Leads: Formulario final para confirmar la reserva solicitando: Nombre, Correo Electrónico y Teléfono (WhatsApp).

E.2. Sistema Omnicanal de Notificaciones (White-Label Communications)
Identidad de Envío Remitente: Todas las comunicaciones saldrán utilizando el correo y número de teléfono que el Tenant configuró en el Onboarding. (Nota de UX: Añadir un "Disclaimer" obligatorio en el Onboarding advirtiendo al Tenant sobre el uso de sus datos para este fin).

Cronograma de Disparos Automáticos:

Inmediato: Confirmación de reserva (Email y WhatsApp/SMS).

Día de la cita: Recordatorio en cascada faltando 1 hora, 30 minutos y 5 minutos.

Post-cita: Notificación de inasistencia (No-show) si el cliente no se presenta.

E.3. Motor de Reputación y Fidelización (Customer Trust System)
Puntaje Base: Todo cliente nuevo inicia con un saldo de 100 Puntos de Confianza.

Penalización (No-Show): Si el cliente reserva y no asiste, el sistema deduce automáticamente 10 puntos.

Bloqueo (Blacklist Automática): Si el puntaje llega a 0, el sistema bloquea futuras reservas que coincidan con esa triada de datos (Nombre, Correo o Teléfono).

Recompensas (Loyalty): Asistir a la cita suma 10 puntos, los cuales el Tenant puede configur para canjear por recompensas o descuentos futuros.

E.4. Panel de Configuración B2B (Tenant Dashboard)
Gestión de Catálogo: Creación de servicios con nombre, duración y precio dinámico.

Gestión de Staff y Habilidades: Creación de perfiles de profesionales y asignación de "Servicios Permitidos" (Skills) a cada uno.

Motor de Nómina y Comisiones: Configuración del modelo de pago por profesional. El Tenant debe poder elegir si paga por:

Porcentaje (Ej. 50% del servicio).

Valor Fijo (Ej. $10.000 COP por corte).

Ninguno (Solo salario base externo).

Ajustes de Gamificación: Interfaz para que el Tenant active/desactive el sistema de puntos o modifique las reglas de penalización.

👥 Módulo F: Sistema de Empleados y Roles Operativos (RBAC & Staff Portal)
Este módulo dota al sistema de capacidades de operación multi-usuario dentro de un mismo Tenant. Permite al dueño del negocio (Admin) invitar a su equipo de trabajo, asignando permisos granulares basados en el rol físico que desempeñan en la empresa, garantizando seguridad y eficiencia operativa.

F.1. Portal de Acceso para Empleados (Staff Login)
Login Unificado: Los empleados acceden a través de la misma URL administrativa de su Tenant (Ej. essence.com/login), pero el sistema los enruta automáticamente a su "Espacio de Trabajo" (Workspace) dependiendo de su rol.

Autogestión de Perfil: El empleado puede actualizar su foto de perfil, su contraseña y ver sus métricas personales de rendimiento (si el rol lo permite).

F.2. Tipologías de Roles y Permisos Estrictos (Casos de Uso)
El sistema debe soportar una matriz de permisos. Los roles predeterminados por vertical incluyen:

1. Rol: Especialista / Agendado (Ej. Barbero, Médico, Estilista):

Vistas Permitidas: Calendario personal (Mi Agenda), historial de sus clientes atendidos, reporte de sus comisiones generadas en el día/mes.

Acciones: Puede bloquear espacios en su propia agenda (Ej. "Hora de almuerzo" o "Cita médica personal"), marcar citas como "Completadas" o "No Asistió" (No-show).

Restricciones: No puede ver la agenda de otros compañeros, no puede modificar precios de servicios, no tiene acceso a las finanzas globales del local.

2. Rol: Operativo de Sala / POS (Ej. Mesero, Cajero, Vendedor):

Vistas Permitidas: Mapa de Mesas, Terminal de Punto de Venta (POS), Catálogo de productos.

Acciones: Tomar pedidos, enviar comandas a cocina, cobrar cuentas.

Restricciones: No puede aplicar descuentos mayores al permitido, no puede anular facturas pagadas ni borrar órdenes enviadas sin el PIN de autorización del Administrador.

3. Rol: Operativo de Producción (Ej. Cocinero, Bodeguero):

Vistas Permitidas: Exclusivamente el Monitor de Producción (KDS - Kitchen Display System) o Monitor de Despachos.

Acciones: Cambiar el estado de los tickets ("En preparación" -> "Listo para entregar").

Restricciones: Cero acceso a precios, clientes, agendas o facturación. Interfaz 100% enfocada en la producción.

F.3. Control Administrativo (Tenant Owner)
Gestión de Invitaciones: El dueño puede enviar invitaciones por correo o crear las credenciales directamente para su equipo.

Configuración de Horarios Laborales: El Admin define en qué días y horas trabaja cada especialista (Ej. "Carlos trabaja de Lunes a Viernes de 8am a 4pm"). Esto alimenta directamente la disponibilidad en la Landing Pública B2C.

Botón de Pánico (Kill Switch): Capacidad del dueño de suspender o revocar el acceso a un empleado instantáneamente en caso de despido o emergencia.

📊 Módulo G: Inteligencia de Negocio y Finanzas (BI Dashboard)
El dueño del negocio no solo quiere operar; quiere saber cuánto dinero está ganando. Este módulo es el cerebro financiero del Tenant.

Panel Principal (Dashboard B2B): Gráficos en tiempo real (con React y transiciones suaves) que muestren:

Ingresos brutos del día / semana / mes.

Tasa de inasistencia (No-shows vs. Citas completadas).

Ticket promedio de compra.

Rendimiento del Staff: Un ranking automático donde el dueño pueda ver qué empleado genera más ingresos, quién atiende más rápido y quién tiene más "No-shows".

Exportación de Datos: Capacidad de descargar reportes en CSV/PDF para la contabilidad del Tenant.

💳 Módulo H: Gestión de Suscripciones (El Motor de Cobro de la Factory)
Aquí es donde tú (ESSENCE) aseguras tus $50.000 COP mensuales sin perseguir a la gente.

Facturación Recurrente (Dunning Process): Integración con Mercado Pago (o similar) para el cobro automático a la tarjeta de crédito del Tenant.

Periodo de Gracia y Suspensión: Si el cobro falla (ej. tarjeta sin fondos), el sistema envía 3 correos de advertencia. Al día 5 de impago, el sistema cambia el estado del Tenant a SUSPENDIDO.

Efecto de Suspensión: El Tenant no puede acceder a su panel administrativo y su Landing Pública B2C muestra un mensaje amigable de "Sitio temporalmente en mantenimiento" (para no exponer sus problemas financieros ante sus clientes).

Portal de Facturación (Self-Service): Un apartado donde el Tenant puede actualizar su tarjeta, cambiar del plan Mensual al Anual, y descargar sus facturas de ESSENCE.

🛡️ 3. Requisitos No Funcionales (NFRs) - Reglas para el Equipo de Desarrollo
Esta sección es vital para que tus desarrolladores no comprometan la seguridad ni el rendimiento bajo la "Nitidez Essence".

Aislamiento de Datos Estricto (Multi-Tenancy): Es absolutamente obligatorio que cada consulta a la base de datos (Mongoose) incluya el filtro { tenantId: currentTenantId }. Un error aquí significa que una barbería podría ver las citas de un restaurante.

Arquitectura del Código:

Backend: Arquitectura Hexagonal. Prohibido acoplar la lógica de negocio (Dominio) con Express o Mongoose (Infraestructura).

Frontend: Arquitectura Limpia en Next.js. Uso estricto de Tailwind CSS para el estilizado y GSAP para las micro-interacciones.

Resiliencia Offline (Punto de Venta): Los roles operativos (como cajeros o meseros) deben poder seguir tomando órdenes temporalmente si hay micro-cortes de internet, sincronizando los datos con el servidor al reconectar.

Rendimiento (Core Web Vitals): Las Landings Públicas B2C deben cargar en menos de 1.5 segundos. Deben estar generadas de forma estática (SSG) o con renderizado del lado del servidor (SSR) optimizado para SEO, ya que los Tenants querrán posicionar su marca en Google.
