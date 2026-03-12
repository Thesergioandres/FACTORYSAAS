## 💎 Matriz de Funciones - ESSENCE SOFTWARE FACTORY

Esta matriz define la jerarquia de desarrollo. Ningun desarrollador debe reprogramar una funcion que ya resida en la Capa Core.

---

## 🛡️ Capa 1: Modulos Core (Transversales)
Se programan UNA VEZ. Estan disponibles para las 64 verticales.

| Modulo | Funcionalidad | Responsable |
| --- | --- | --- |
| Auth & RBAC | Registro, login, roles (God, Owner, Staff, Client). | Security Team |
| Payments | Integracion Mercado Pago (Checkout Pro), efectivo, transferencias. | Fintech Team |
| CRM Central | Ficha de cliente, historial unificado, notas y tags. | Core Team |
| Notifications | Motor de WhatsApp (Twilio/API), Email y Push. | DevOps |
| Billing | Generacion de facturas legales y recibos simples. | Legal/Fintech |
| Analytics | Dashboard de KPIs, ventas y reportes de rendimiento. | Data Team |

---

## 🏗️ Capa 2: Modulos Base por Familias
Logica compartida por grupos de industrias. Se reutiliza el motor entre ellas.

### 🧴 Familia: Bienestar (Barberias, Spas, Salones)
- Agenda Inteligente: Bloques de tiempo, servicios y recursos.
- Staff Manager: Turnos, perfiles de empleados y metas.
- Comisiones: Calculo automatico por servicio prestado.

### 🍽️ Familia: Hosteleria (Restaurantes, Bares, Discotecas)
- POS Tactil: Interfaz rapida para comandas y ventas.
- Inventory: Recetas (escandallos), mermas y existencias.
- Multi-Terminal: Sincronizacion entre barra, cocina y mesas.

### 📦 Familia: Retail (Farmacias, Ferreterias, Tiendas)
- Stock Pro: Lotes, fechas de vencimiento y codigos de barras.
- Suppliers: Gestion de proveedores y ordenes de compra.

---

## 💎 Capa 3: Funciones Exclusivas (DNA Especializado)
Aqui es donde el equipo de 7 crea la magia de cada nicho. Son funciones unicas.

| Vertical | Funciones de Alto Valor (Exclusivas) |
| --- | --- |
| Barberias | Tarjeta de sellos virtuales, galeria de cortes (Antes/Despues). |
| Restaurantes | Mapa interactivo de mesas, division de cuentas (Split Bill). |
| Odontologia | Odontograma digital, seguimiento de ortodoncia. |
| Abogados | Custodia de documentos con cifrado, reloj de horas facturables. |
| Veterinarias | Ficha de mascota con carnet de vacunas, geolocalizacion de fincas. |
| Inmobiliarias | Motor de publicacion en portales externos, gestion de llaves. |
| Educacion | Boletin de calificaciones, portal de tareas para padres. |
| Talleres | Historial de mantenimiento por placa, ordenes de trabajo tecnicas. |

---

## 🛠️ Instrucciones para el Equipo de Programadores

**Regla de Oro**
Antes de crear una funcion, revisa si pertenece a la Capa 1. Si vas a pedir el nombre de un cliente, usa el CRM Central, no crees una tabla nueva.

**Logica de Inyeccion**
El archivo `verticalsRegistry.ts` actua como el interruptor. Si una vertical tiene `activeModules: ['pos', 'tables']`, el frontend automaticamente pintara el acceso al Punto de Venta y al Mapa de Mesas.

**Nitidez**
Toda funcion exclusiva debe usar los componentes base de la Factory para que la estetica Cyber-Luxury sea consistente.
