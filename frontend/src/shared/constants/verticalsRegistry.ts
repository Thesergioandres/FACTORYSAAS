import type { AppModule } from '../types/appModules';

export type VerticalFamily =
  | 'Wellness'
  | 'Hosteleria'
  | 'Retail'
  | 'Profesionales'
  | 'Educacion'
  | 'Salud'
  | 'General';

export type VerticalConfig = {
  slug: string;
  name: string;
  activeModules: AppModule[];
  baseModules: AppModule[];
  family: VerticalFamily;
  exclusiveFeatures: string[];
  features: string[];
  theme?: {
    primary: string;
    secondary: string;
    background?: string;
    text?: string;
  };
  labels: {
    staff: string;
    service: string;
    [key: string]: string;
  };
};

type VerticalSeed = Omit<VerticalConfig, 'family' | 'exclusiveFeatures'>;

const VERTICAL_FAMILY_BY_SLUG: Record<string, VerticalFamily> = {
  barberias: 'Wellness',
  'salones-belleza': 'Wellness',
  'estetica-avanzada': 'Wellness',
  'spas-relajacion': 'Wellness',
  'depilacion-laser': 'Wellness',
  restaurantes: 'Hosteleria',
  'discotecas-bares': 'Hosteleria',
  farmacias: 'Retail',
  ferreterias: 'Retail',
  'tiendas-ropa-calzado': 'Retail',
  'papelerias-librerias': 'Retail',
  'regalos-floristerias': 'Retail',
  'tiendas-conveniencia': 'Retail',
  'despachos-abogados': 'Profesionales',
  'arquitectos-ingenieros': 'Profesionales',
  constructoras: 'Profesionales',
  inmobiliarias: 'Profesionales',
  'estudios-contables': 'Profesionales',
  'colegios-universidades': 'Educacion',
  'academias-idiomas': 'Educacion',
  'escuelas-musica-arte': 'Educacion',
  tutorias: 'Educacion',
  clinicas: 'Salud',
  'clinicas-odontologia': 'Salud',
  psicologia: 'Salud',
  veterinarias: 'Salud',
  'veterinarias-campo': 'Salud'
};

const EXCLUSIVE_FEATURES_BY_SLUG: Record<string, string[]> = {
  barberias: ['Tarjeta de sellos virtuales', 'Galeria de cortes (Antes/Despues)'],
  restaurantes: ['Mapa interactivo de mesas', 'Division de cuentas (Split Bill)'],
  'clinicas-odontologia': ['Odontograma digital', 'Seguimiento de ortodoncia'],
  'despachos-abogados': ['Custodia de documentos con cifrado', 'Reloj de horas facturables'],
  veterinarias: ['Ficha de mascota con carnet de vacunas', 'Geolocalizacion de fincas'],
  inmobiliarias: ['Motor de publicacion en portales externos', 'Gestion de llaves'],
  'colegios-universidades': ['Boletin de calificaciones', 'Portal de tareas para padres'],
  'talleres-mecanicos': ['Historial de mantenimiento por placa', 'Ordenes de trabajo tecnicas']
};

const RAW_VERTICALS_REGISTRY: VerticalSeed[] = [
  {
    slug: 'barberias',
    name: 'Barberias',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de turnos con seleccion de servicio y profesional.',
      'Historial del cliente con preferencias y productos usados.',
      'Venta de productos con inventario integrado.',
      'Fidelizacion con puntos o sellos por visita.',
      'Recordatorios automaticos por WhatsApp/SMS.',
      'Caja diaria con propinas y comisiones por servicio.',
      'Estadisticas de servicios y profesionales mas demandados.'
    ],
    theme: {
      primary: '#C41E3A',
      secondary: '#002244'
    },
    labels: { staff: 'Barbero', service: 'Servicio' }
  },
  {
    slug: 'salones-belleza',
    name: 'Salones de belleza',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Agenda con servicios personalizados (corte, color, manicura).',
      'Gestion de productos quimicos con stock y vencimientos.',
      'Ficha del cliente con alergias e historial de tratamientos.',
      'Paquetes de servicios por eventos y fechas clave.',
      'Venta de productos de cosmetica y cuidado capilar.',
      'Modulo de promociones y bonos regalo.',
      'Informes de rentabilidad por servicio y profesional.'
    ],
    theme: {
      primary: '#F7CAC9',
      secondary: '#D4AF37'
    },
    labels: { staff: 'Estilista', service: 'Servicio' }
  },
  {
    slug: 'estetica-avanzada',
    name: 'Centros de estetica avanzada',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de tratamientos medicos con protocolos.',
      'Ficha clinica con consentimientos informados.',
      'Control de sesiones contratadas vs. realizadas.',
      'Gestion de equipos con mantenimiento y calibracion.',
      'Inventario de insumos medicos con trazabilidad.',
      'Facturacion electronica para servicios de salud.',
      'Recordatorios de citas y seguimiento post-tratamiento.'
    ],
    theme: {
      primary: '#009688',
      secondary: '#C0C0C0'
    },
    labels: { staff: 'Especialista', service: 'Tratamiento' }
  },
  {
    slug: 'spas-relajacion',
    name: 'Spas y centros de relajacion',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'subscriptions',
      'commissions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Agenda con duracion de servicios y terapeutas.',
      'Gestion de areas comunes con control de aforo.',
      'Venta de bonos de sesiones y membresias.',
      'Paquetes para eventos y experiencias de pareja.',
      'Gestion de productos de aromaterapia.',
      'Encuestas de satisfaccion y sugerencias.',
      'Promociones por temporada y fechas especiales.'
    ],
    theme: {
      primary: '#B2A4D4',
      secondary: '#98D8C8'
    },
    labels: { staff: 'Terapeuta', service: 'Sesion' }
  },
  {
    slug: 'depilacion-laser',
    name: 'Centros de depilacion laser',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Agenda por tipo de laser y zona a tratar.',
      'Ficha del paciente con fototipo y potencia usada.',
      'Control de sesiones contratadas y restantes.',
      'Inventario de insumos y repuestos de cabezales.',
      'Consentimientos informados digitales.',
      'Alertas de mantenimiento de equipos laser.',
      'Facturacion recurrente para paquetes de sesiones.'
    ],
    theme: {
      primary: '#6A0DAD',
      secondary: '#FFFFFF'
    },
    labels: { staff: 'Especialista', service: 'Tratamiento' }
  },
  {
    slug: 'restaurantes',
    name: 'Restaurantes',
    activeModules: [
      'tables',
      'pos',
      'inventory',
      'kitchen_display',
      'digital_menu',
      'staff',
      'ecommerce_storefront'
    ],
    baseModules: ['tables', 'pos'],
    features: [
      'Mapa de mesas con estados en tiempo real.',
      'Toma de pedidos por mesa con envio a cocina.',
      'Comanda digital con impresion automatica.',
      'Gestion de menus, alergicos y precios por temporada.',
      'Inventario de insumos con recetas y mermas.',
      'Reservas online con confirmacion y deposito.',
      'Programa de fidelizacion y reportes por mesero.'
    ],
    theme: {
      primary: '#F39237',
      secondary: '#D9381E'
    },
    labels: { staff: 'Mesero', service: 'Plato' }
  },
  {
    slug: 'discotecas-bares',
    name: 'Discotecas y bares nocturnos',
    activeModules: [
      'tables',
      'pos',
      'inventory',
      'staff',
      'kitchen_display',
      'digital_menu',
      'ecommerce_storefront'
    ],
    baseModules: ['tables', 'pos'],
    features: [
      'Gestion de mesas VIP con consumicion minima.',
      'Control de acceso con lista de invitados.',
      'Pedidos rapidos en barra y precios por ronda.',
      'Modulo de eventos y promociones por hora.',
      'Inventario de bebidas con control de mermas.',
      'TPVs portatiles para camareros.',
      'Division de cuentas por grupos.',
      'Estadisticas de afluencia por hora y dia.'
    ],
    theme: {
      primary: '#FF00FF',
      secondary: '#00FFFF'
    },
    labels: { staff: 'Bartender', service: 'Consumo' }
  },
  {
    slug: 'gestor-gastos',
    name: 'Gestor de gastos',
    activeModules: ['accounting', 'pos'],
    baseModules: ['accounting', 'pos'],
    features: [
      'Registro de gastos por categorias y proyectos.',
      'Escaneo de facturas y tickets con OCR.',
      'Presupuestos mensuales con alertas.',
      'Sincronizacion con cuentas bancarias.',
      'Informes personalizados por cliente y tipo.',
      'Gestion de impuestos y deducciones.',
      'Exportacion a contabilidad (Excel, CSV, XML).',
      'Modulo de ahorro y metas financieras.'
    ],
    theme: {
      primary: '#2ECC71',
      secondary: '#3498DB'
    },
    labels: { staff: 'Analista', service: 'Movimiento' }
  },
  {
    slug: 'habitos',
    name: 'Habitos',
    activeModules: ['subscriptions', 'progress_tracking'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Seguimiento de habitos diarios y semanales.',
      'Recordatorios push y notificaciones motivacionales.',
      'Estadisticas de rachas y cumplimiento.',
      'Comunidad y retos entre usuarios.',
      'Integracion con wearables (Fitbit, Apple Health).',
      'Personalizacion de objetivos y planes.',
      'Gamificacion con logros y recompensas.',
      'Informes de progreso mensual.'
    ],
    theme: {
      primary: '#A3E4D7',
      secondary: '#5DADE2'
    },
    labels: { staff: 'Coach', service: 'Plan' }
  },
  {
    slug: 'veterinarias',
    name: 'Veterinarias',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Ficha de paciente con historia clinica y vacunas.',
      'Agenda por veterinario y tipo de consulta.',
      'Recordatorios de citas a duenos.',
      'Historial de tratamientos y recetas.',
      'Inventario de medicamentos con vencimientos.',
      'Facturacion con conceptos veterinarios.',
      'Seguimiento de pacientes hospitalizados.',
      'Comunicacion con duenos (informes y fotos).'
    ],
    theme: {
      primary: '#1F618D',
      secondary: '#F39C12'
    },
    labels: { staff: 'Veterinario', service: 'Consulta' }
  },
  {
    slug: 'veterinarias-campo',
    name: 'Veterinarias de campo',
    activeModules: ['agenda', 'staff', 'services', 'inventory', 'assets_management'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Planificacion de rutas de visitas a fincas.',
      'Fichas de animales con geolocalizacion.',
      'Registro de tratamientos con firma digital.',
      'Control de stock en vehiculo.',
      'Informes de salud para asociaciones ganaderas.',
      'Facturacion offline con sincronizacion posterior.'
    ],
    theme: {
      primary: '#808000',
      secondary: '#8B4513'
    },
    labels: { staff: 'Veterinario', service: 'Visita' }
  },
  {
    slug: 'farmacias',
    name: 'Farmacias',
    activeModules: [
      'inventory',
      'pos',
      'accounting',
      'order_management',
      'shipping_tracking'
    ],
    baseModules: ['inventory', 'pos'],
    features: [
      'Gestion de lotes y fechas de vencimiento.',
      'Control de recetas medicas y seguimiento.',
      'Alertas de stock minimo y pedidos a droguerias.',
      'Integracion con receta electronica.',
      'Venta de productos de parafarmacia.',
      'Programas de fidelizacion con puntos.',
      'Informes de ventas por laboratorio y margen.',
      'Gestion de devoluciones y mermas.'
    ],
    theme: {
      primary: '#27AE60',
      secondary: '#ECF0F1'
    },
    labels: { staff: 'Farmaceutico', service: 'Producto' }
  },
  {
    slug: 'opticas',
    name: 'Opticas',
    activeModules: ['inventory', 'pos', 'services', 'staff'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Gestion de armazones y lentes con atributos.',
      'Ficha de clientes con graduacion y revisiones.',
      'Pedidos a laboratorios con trazabilidad.',
      'Control de talleres de montaje.',
      'Venta de lentes de contacto y liquidos.',
      'Recordatorios de revisiones periodicas.',
      'Informes de rotacion de productos.'
    ],
    theme: {
      primary: '#5DADE2',
      secondary: '#1ABC9C'
    },
    labels: { staff: 'Optometrista', service: 'Examen' }
  },
  {
    slug: 'clinicas',
    name: 'Clinicas',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Historia clinica electronica con diagnosticos.',
      'Agenda por especialidad y profesional.',
      'Recordatorios de citas a pacientes.',
      'Facturacion a pacientes y aseguradoras.',
      'Control de ingresos y altas hospitalarias.',
      'Inventario de material medico y farmacia.',
      'Consentimientos informados digitales.',
      'Estadisticas de ocupacion y listas de espera.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#BDC3C7'
    },
    labels: { staff: 'Medico', service: 'Consulta' }
  },
  {
    slug: 'clinicas-odontologia',
    name: 'Clinicas de odontologia',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'inventory',
      'pos',
      'commissions',
      'subscriptions',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Odontograma digital para registrar tratamientos.',
      'Ficha del paciente con radiografias y fotos.',
      'Gestion de presupuestos y planes de tratamiento.',
      'Control de citas con recordatorios.',
      'Inventario de materiales dentales y protesis.',
      'Facturacion a pacientes y seguros dentales.',
      'Seguimiento de ortodoncia y alineadores.'
    ],
    theme: {
      primary: '#AED6F1',
      secondary: '#FDFEFE'
    },
    labels: { staff: 'Odontologo', service: 'Tratamiento' }
  },
  {
    slug: 'psicologia',
    name: 'Consultorios de psicologia',
    activeModules: [
      'agenda',
      'staff',
      'services',
      'subscriptions',
      'commissions',
      'inventory',
      'progress_tracking'
    ],
    baseModules: ['agenda', 'staff'],
    features: [
      'Agenda con sesiones presenciales y online.',
      'Ficha del paciente con historial y tests.',
      'Gestion de pagos por sesion o bonos.',
      'Notas privadas y confidenciales.',
      'Recordatorios automaticos para evitar ausencias.',
      'Facturacion electronica para seguros.',
      'Informes de evolucion.'
    ],
    theme: {
      primary: '#85C1E9',
      secondary: '#A9DFBF'
    },
    labels: { staff: 'Psicologo', service: 'Sesion' }
  },
  {
    slug: 'inventarios-pos',
    name: 'Inventarios y ventas POS',
    activeModules: ['inventory', 'pos', 'accounting'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Productos con multiples variantes (talla, color).',
      'Control de stock en tiempo real y multiples almacenes.',
      'Escaneo de codigos de barras.',
      'TPV rapido con opciones de pago.',
      'Gestion de promociones y descuentos.',
      'Informes de ventas y margen por producto.',
      'Sincronizacion con e-commerce.'
    ],
    theme: {
      primary: '#E67E22',
      secondary: '#2C3E50'
    },
    labels: { staff: 'Cajero', service: 'Producto' }
  },
  {
    slug: 'tiendas-agropecuarias',
    name: 'Tiendas agropecuarias',
    activeModules: ['inventory', 'pos', 'accounting'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Productos por categorias (semillas, herramientas).',
      'Control de lotes y caducidad en quimicos.',
      'Ventas a granel con pesaje integrado.',
      'Ficha de clientes con historial de compras.',
      'Credito y cuentas corrientes.',
      'Asesoramiento tecnico asociado a productos.',
      'Informes de rotacion por temporada.'
    ],
    theme: {
      primary: '#28B463',
      secondary: '#BA6B25'
    },
    labels: { staff: 'Asesor', service: 'Producto' }
  },
  {
    slug: 'tiendas-ropa-calzado',
    name: 'Tiendas de ropa y calzado',
    activeModules: [
      'inventory',
      'pos',
      'accounting',
      'order_management',
      'shipping_tracking'
    ],
    baseModules: ['inventory', 'pos'],
    features: [
      'Gestion de tallas y colores por producto.',
      'Control de stock en tienda y almacen.',
      'Escaneo de codigos de barras.',
      'TPV con busqueda rapida por referencia.',
      'Gestion de devoluciones y cambios.',
      'Fidelizacion con descuentos y puntos.',
      'Informes de tendencias y rotacion.'
    ],
    theme: {
      primary: '#1C1C1C',
      secondary: '#D2527F'
    },
    labels: { staff: 'Vendedor', service: 'Producto' }
  },
  {
    slug: 'ferreterias',
    name: 'Ferreterias',
    activeModules: [
      'inventory',
      'pos',
      'accounting',
      'order_management',
      'shipping_tracking'
    ],
    baseModules: ['inventory', 'pos'],
    features: [
      'Productos con multiples unidades de medida.',
      'Control de stock en tiempo real.',
      'Ventas a profesionales con descuento por volumen.',
      'Presupuestos y albaranes.',
      'Gestion de pedidos a proveedores.',
      'Busqueda por referencia o codigo.',
      'Informes de rentabilidad por seccion.'
    ],
    theme: {
      primary: '#F1C40F',
      secondary: '#2C3E50'
    },
    labels: { staff: 'Asesor', service: 'Producto' }
  },
  {
    slug: 'papelerias-librerias',
    name: 'Papelerias y librerias',
    activeModules: ['inventory', 'pos', 'accounting'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Productos por categorias (libros, cuadernos).',
      'Control de stock con alertas de reposicion.',
      'Busqueda de libros por ISBN.',
      'Venta de articulos de oficina y escolares.',
      'Gestion de pedidos especiales.',
      'Fidelizacion para colegios.',
      'Informes de ventas por temporada.'
    ],
    theme: {
      primary: '#E67E22',
      secondary: '#F9E79F'
    },
    labels: { staff: 'Asesor', service: 'Producto' }
  },
  {
    slug: 'regalos-floristerias',
    name: 'Tiendas de regalos y floristerias',
    activeModules: ['inventory', 'pos', 'accounting'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Gestion de productos de regalo y decoracion.',
      'Control de flores frescas y mermas.',
      'Diseno de ramos con precios dinamicos.',
      'Gestion de envios con rutas.',
      'Recordatorios de fechas especiales.',
      'Venta online con catalogo.',
      'Informes de ventas por ocasion.'
    ],
    theme: {
      primary: '#FFB6C1',
      secondary: '#7DCEA0'
    },
    labels: { staff: 'Vendedor', service: 'Producto' }
  },
  {
    slug: 'tiendas-conveniencia',
    name: 'Tiendas de conveniencia',
    activeModules: ['inventory', 'pos', 'accounting'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Productos de alta rotacion y reposicion automatica.',
      'Control de stock minimo y pedidos automaticos.',
      'TPV rapido con pantalla tactil.',
      'Gestion de loterias y recargas.',
      'Horarios extendidos con turnos de personal.',
      'Informes de ventas por hora y dia.',
      'Integracion con sistemas de seguridad.'
    ],
    theme: {
      primary: '#E74C3C',
      secondary: '#F7DC6F'
    },
    labels: { staff: 'Cajero', service: 'Producto' }
  },
  {
    slug: 'colegios-universidades',
    name: 'Colegios o universidades',
    activeModules: ['subscriptions', 'progress_tracking', 'staff', 'access_control', 'tasks'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Gestion de matriculas y cobro de mensualidades.',
      'Ficha de alumnos con datos medicos y academicos.',
      'Control de asistencia presencial o digital.',
      'Boletin de calificaciones y reportes.',
      'Comunicacion con padres y reuniones.',
      'Gestion de profesores y asignacion de cursos.',
      'Modulo de biblioteca y prestamos.',
      'Portal del alumno y padres.'
    ],
    theme: {
      primary: '#2874A6',
      secondary: '#F9E79F'
    },
    labels: { staff: 'Docente', service: 'Programa' }
  },
  {
    slug: 'academias-idiomas',
    name: 'Academias de idiomas',
    activeModules: ['subscriptions', 'progress_tracking', 'staff', 'tasks', 'access_control'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Gestion de grupos y niveles.',
      'Control de asistencia a clases.',
      'Seguimiento de progreso del alumno.',
      'Facturacion de matriculas y mensualidades.',
      'Programacion de cursos y horarios.',
      'Aula virtual con materiales.',
      'Certificados automaticos por nivel.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#F39C12'
    },
    labels: { staff: 'Instructor', service: 'Curso' }
  },
  {
    slug: 'escuelas-musica-arte',
    name: 'Escuelas de musica y arte',
    activeModules: ['subscriptions', 'progress_tracking', 'staff', 'tasks'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Gestion de alumnos por instrumento o disciplina.',
      'Agenda de clases individuales y colectivas.',
      'Control de asistencia y evaluaciones.',
      'Gestion de eventos y audiciones.',
      'Alquiler de instrumentos o materiales.',
      'Facturacion de clases sueltas o bonos.',
      'Videoteca con recursos didacticos.'
    ],
    theme: {
      primary: '#8E44AD',
      secondary: '#F39C12'
    },
    labels: { staff: 'Instructor', service: 'Clase' }
  },
  {
    slug: 'bibliotecas-culturales',
    name: 'Bibliotecas y centros culturales',
    activeModules: ['assets_management', 'subscriptions', 'access_control'],
    baseModules: ['assets_management', 'subscriptions'],
    features: [
      'Catalogo de libros y contenidos con busqueda.',
      'Gestion de prestamos y devoluciones.',
      'Control de socios y cuotas.',
      'Reservas de salas o equipos.',
      'Programacion de actividades culturales.',
      'Estadisticas de uso y rotacion.',
      'Integracion con sistemas de autoprestamo.'
    ],
    theme: {
      primary: '#7D3C1F',
      secondary: '#B7950B'
    },
    labels: { staff: 'Bibliotecario', service: 'Prestamo' }
  },
  {
    slug: 'tutorias',
    name: 'Tutorias y clases particulares',
    activeModules: ['agenda', 'staff', 'subscriptions', 'progress_tracking', 'access_control', 'tasks'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Agenda de profesores y alumnos.',
      'Gestion de materias y niveles.',
      'Seguimiento de progreso con informes.',
      'Facturacion por hora o bonos.',
      'Aula virtual con videollamada y pizarra.',
      'Recordatorios automaticos.',
      'Valoraciones de profesores.'
    ],
    theme: {
      primary: '#2ECC71',
      secondary: '#3498DB'
    },
    labels: { staff: 'Tutor', service: 'Sesion' }
  },
  {
    slug: 'autoescuelas',
    name: 'Autoescuelas',
    activeModules: ['agenda', 'staff', 'progress_tracking', 'assets_management'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de alumnos y expedientes.',
      'Programacion de clases teoricas y practicas.',
      'Control de asistencia a clases.',
      'Seguimiento de progreso en tests.',
      'Gestion de vehiculos con mantenimiento.',
      'Facturacion de matriculas y tasas.',
      'Notificaciones de fechas de examenes.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#F1C40F'
    },
    labels: { staff: 'Instructor', service: 'Clase' }
  },
  {
    slug: 'gimnasios',
    name: 'Gimnasios',
    activeModules: ['subscriptions', 'progress_tracking', 'staff', 'access_control', 'tasks'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Gestion de socios y cuotas.',
      'Control de accesos por QR o huella.',
      'Agenda de clases dirigidas con aforo.',
      'Seguimiento de entrenamientos y progreso.',
      'Gestion de entrenadores personales.',
      'Venta de productos y suplementos.',
      'Informes de ocupacion y retencion.'
    ],
    theme: {
      primary: '#E74C3C',
      secondary: '#2C3E50'
    },
    labels: { staff: 'Coach', service: 'Rutina' }
  },
  {
    slug: 'servicio-fit',
    name: 'Servicio fit (rutinas + alimentacion)',
    activeModules: ['subscriptions', 'progress_tracking', 'staff'],
    baseModules: ['subscriptions', 'progress_tracking'],
    features: [
      'Rutinas de entrenamiento personalizadas.',
      'Planes de alimentacion con recetas.',
      'Seguimiento de medidas y peso.',
      'Chat con entrenador o nutricionista.',
      'Videoteca de ejercicios.',
      'Recordatorios de comidas y entrenos.',
      'Comunidad y retos.'
    ],
    theme: {
      primary: '#C0F312',
      secondary: '#F39C12'
    },
    labels: { staff: 'Coach', service: 'Plan' }
  },
  {
    slug: 'hoteleria',
    name: 'Hoteleria',
    activeModules: ['inventory', 'pos', 'staff', 'access_control', 'subscriptions'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Gestion de reservas de habitaciones.',
      'Check-in y check-out digital.',
      'Facturacion de estancias y extras.',
      'Gestion de housekeeping.',
      'Inventario de amenities y ropa de cama.',
      'Integracion con OTAs.',
      'Informes de ocupacion y revenue.'
    ],
    theme: {
      primary: '#1B2631',
      secondary: '#B7950B'
    },
    labels: { staff: 'Recepcionista', service: 'Reserva' }
  },
  {
    slug: 'alquiler-vacacional',
    name: 'Alquiler vacacional',
    activeModules: ['subscriptions', 'access_control', 'inventory'],
    baseModules: ['subscriptions', 'access_control'],
    features: [
      'Gestion de propiedades y calendario.',
      'Reservas online con pago anticipado.',
      'Contratos de alquiler digitales.',
      'Gestion de llaves inteligentes.',
      'Comunicacion con huespedes.',
      'Limpieza y mantenimiento entre estancias.',
      'Integracion con plataformas.'
    ],
    theme: {
      primary: '#1ABC9C',
      secondary: '#F4D03F'
    },
    labels: { staff: 'Host', service: 'Reserva' }
  },
  {
    slug: 'camping-glamping',
    name: 'Camping y glamping',
    activeModules: ['subscriptions', 'access_control', 'inventory'],
    baseModules: ['subscriptions', 'access_control'],
    features: [
      'Gestion de parcelas y cabañas.',
      'Reservas por noche con ocupacion.',
      'Facturacion de servicios adicionales.',
      'Gestion de actividades del recinto.',
      'Control de accesos al recinto.',
      'Inventario de material de acampada.',
      'Informes de temporada.'
    ],
    theme: {
      primary: '#27AE60',
      secondary: '#8B4513'
    },
    labels: { staff: 'Anfitrion', service: 'Reserva' }
  },
  {
    slug: 'talleres-mecanicos',
    name: 'Talleres mecanicos',
    activeModules: ['agenda', 'staff', 'inventory', 'pos', 'assets_management'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Ficha de vehiculos con historial de reparaciones.',
      'Ordenes de trabajo con diagnostico.',
      'Inventario de piezas y consumibles.',
      'Presupuestos y facturacion.',
      'Control de mano de obra y tiempos.',
      'Recordatorios de mantenimiento.',
      'Integracion con proveedores de recambios.'
    ],
    theme: {
      primary: '#5D6D7E',
      secondary: '#E74C3C'
    },
    labels: { staff: 'Tecnico', service: 'Reparacion' }
  },
  {
    slug: 'despachos-abogados',
    name: 'Despachos de abogados',
    activeModules: ['contracts', 'projects', 'tasks', 'staff', 'accounting', 'assets_management'],
    baseModules: ['contracts', 'projects'],
    features: [
      'Gestion de expedientes por cliente.',
      'Control de plazos y calendario de audiencias.',
      'Facturacion por horas o tarifa plana.',
      'Modelos de documentos y contratos.',
      'Seguimiento de tareas y responsables.',
      'Comunicacion confidencial con cliente.',
      'Informes de rentabilidad por caso.'
    ],
    theme: {
      primary: '#1F3A5F',
      secondary: '#7F8C8D'
    },
    labels: { staff: 'Abogado', service: 'Asesoria' }
  },
  {
    slug: 'estudios-contables',
    name: 'Estudios contables',
    activeModules: ['accounting', 'projects', 'tasks', 'staff', 'assets_management', 'contracts'],
    baseModules: ['accounting', 'projects'],
    features: [
      'Gestion de clientes y obligaciones fiscales.',
      'Calendario de vencimientos tributarios.',
      'Informes contables y balances.',
      'Facturacion de honorarios recurrentes.',
      'Portal del cliente para documentos.',
      'Integracion con bancos y AEAT.',
      'Alertas de presentacion de impuestos.'
    ],
    theme: {
      primary: '#27AE60',
      secondary: '#2980B9'
    },
    labels: { staff: 'Contador', service: 'Servicio' }
  },
  {
    slug: 'asesores-financieros',
    name: 'Asesores financieros',
    activeModules: ['accounting', 'projects', 'staff'],
    baseModules: ['accounting', 'projects'],
    features: [
      'Gestion de carteras de clientes.',
      'Simulaciones de inversion y pensiones.',
      'Seguimiento de objetivos financieros.',
      'Informes de rentabilidad y riesgo.',
      'Compliance y documentacion regulatoria.',
      'Reuniones virtuales y firmas digitales.',
      'Alertas de mercado.'
    ],
    theme: {
      primary: '#2C3E50',
      secondary: '#2ECC71'
    },
    labels: { staff: 'Asesor', service: 'Asesoria' }
  },
  {
    slug: 'gestion-inversiones',
    name: 'Gestion de inversiones',
    activeModules: ['accounting', 'projects', 'staff'],
    baseModules: ['accounting', 'projects'],
    features: [
      'Seguimiento de activos financieros.',
      'Valoracion de carteras en tiempo real.',
      'Calculo de rentabilidades y comisiones.',
      'Informes para clientes institucionales.',
      'Gestion de riesgos y alertas.',
      'Integracion con brokers y bancos.',
      'Historial de transacciones.'
    ],
    theme: {
      primary: '#1E8449',
      secondary: '#1F618D'
    },
    labels: { staff: 'Asesor', service: 'Portafolio' }
  },
  {
    slug: 'control-creditos',
    name: 'Control de creditos',
    activeModules: ['accounting', 'contracts', 'staff'],
    baseModules: ['accounting', 'contracts'],
    features: [
      'Gestion de solicitudes y scoring.',
      'Seguimiento de pagos y cuotas.',
      'Calculo de intereses y mora.',
      'Generacion de contratos de prestamo.',
      'Alertas de impagos y gestion de cobros.',
      'Informes de cartera vencida.',
      'Integracion con bureaux de credito.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#F39C12'
    },
    labels: { staff: 'Analista', service: 'Credito' }
  },
  {
    slug: 'arquitectos-ingenieros',
    name: 'Arquitectos e ingenieros',
    activeModules: ['projects', 'tasks', 'staff', 'assets_management', 'contracts', 'accounting'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion de proyectos con fases e hitos.',
      'Planos y documentos tecnicos centralizados.',
      'Control de presupuestos y certificaciones.',
      'Asignacion de tareas a equipo y subcontratas.',
      'Seguimiento de tiempos y costes.',
      'Gestion de cambios y modificaciones.',
      'Informes para clientes.'
    ],
    theme: {
      primary: '#5D6D7E',
      secondary: '#F39C12'
    },
    labels: { staff: 'Profesional', service: 'Proyecto' }
  },
  {
    slug: 'constructoras',
    name: 'Constructoras',
    activeModules: ['projects', 'tasks', 'staff', 'assets_management', 'contracts'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Planificacion de obras con Gantt.',
      'Control de costes de materiales y mano de obra.',
      'Gestion de subcontratas y proveedores.',
      'Seguridad y salud con registro de incidentes.',
      'Certificaciones de obra y facturacion.',
      'Historial de mantenimiento de maquinaria.',
      'Informes de avance y rentabilidad.'
    ],
    theme: {
      primary: '#F39C12',
      secondary: '#2C3E50'
    },
    labels: { staff: 'Supervisor', service: 'Obra' }
  },
  {
    slug: 'inmobiliarias',
    name: 'Inmobiliarias',
    activeModules: ['contracts', 'projects', 'staff', 'assets_management'],
    baseModules: ['contracts', 'projects'],
    features: [
      'Gestion de cartera de inmuebles.',
      'Ficha de propiedades con fotos y planos.',
      'Agenda de visitas con clientes.',
      'Contratos de arras y compraventa.',
      'Seguimiento de leads y oportunidades.',
      'Integracion con portales inmobiliarios.',
      'Informes de mercado.'
    ],
    theme: {
      primary: '#2980B9',
      secondary: '#27AE60'
    },
    labels: { staff: 'Agente', service: 'Propiedad' }
  },
  {
    slug: 'administracion-fincas',
    name: 'Administradores de fincas y edificios',
    activeModules: ['assets_management', 'contracts', 'tasks', 'staff'],
    baseModules: ['assets_management', 'contracts'],
    features: [
      'Gestion de comunidades de propietarios.',
      'Cobro de cuotas y gastos comunitarios.',
      'Control de incidencias y mantenimiento.',
      'Contratos con proveedores.',
      'Juntas: convocatorias, actas y votaciones.',
      'Informes de morosidad y cuentas.',
      'Portal del propietario.'
    ],
    theme: {
      primary: '#117A65',
      secondary: '#BDC3C7'
    },
    labels: { staff: 'Administrador', service: 'Contrato' }
  },
  {
    slug: 'agencias-marketing',
    name: 'Agencias de marketing',
    activeModules: ['projects', 'tasks', 'staff', 'assets_management', 'accounting', 'contracts'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion de campanas por cliente.',
      'Planificacion de contenidos y calendario editorial.',
      'Seguimiento de KPIs y ROI.',
      'Facturacion por proyectos o retainer.',
      'Gestion de proveedores y creativos.',
      'Aprobaciones de clientes.',
      'Informes personalizados.'
    ],
    theme: {
      primary: '#D2527F',
      secondary: '#F7DC6F'
    },
    labels: { staff: 'Especialista', service: 'Campana' }
  },
  {
    slug: 'fotografos-videografos',
    name: 'Fotografos y videografos',
    activeModules: ['projects', 'tasks', 'staff', 'assets_management'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion de sesiones y eventos.',
      'Calendario de reservas.',
      'Entrega de galerias online con contraseña.',
      'Facturacion por paquetes y extras.',
      'Gestion de derechos de autor.',
      'Seguimiento de postproduccion.',
      'Presupuestos y contratos digitales.'
    ],
    theme: {
      primary: '#1C1C1C',
      secondary: '#8E44AD'
    },
    labels: { staff: 'Fotografo', service: 'Sesion' }
  },
  {
    slug: 'organizadores-eventos',
    name: 'Organizadores de eventos',
    activeModules: ['projects', 'tasks', 'staff', 'inventory'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion integral de eventos.',
      'Proveedores y presupuestos.',
      'Cronograma y asignacion de tareas.',
      'Gestion de invitados y confirmaciones.',
      'Check-in digital el dia del evento.',
      'Facturacion a clientes.',
      'Encuestas post-evento.'
    ],
    theme: {
      primary: '#B7950B',
      secondary: '#FADADD'
    },
    labels: { staff: 'Productor', service: 'Evento' }
  },
  {
    slug: 'mudanzas-fletes',
    name: 'Mudanzas y fletes',
    activeModules: [
      'projects',
      'tasks',
      'staff',
      'assets_management',
      'inventory',
      'contracts',
      'shipping_tracking'
    ],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion de servicios de mudanza.',
      'Asignacion de vehiculos y equipos.',
      'Inventario de objetos con fotos.',
      'Presupuestos y contratos.',
      'Seguimiento en tiempo real de flota.',
      'Facturacion por volumen o distancia.',
      'Gestion de incidencias y daños.'
    ],
    theme: {
      primary: '#E67E22',
      secondary: '#3498DB'
    },
    labels: { staff: 'Operador', service: 'Servicio' }
  },
  {
    slug: 'mensajeria-ultima-milla',
    name: 'Mensajeria y ultima milla',
    activeModules: ['projects', 'tasks', 'staff', 'assets_management', 'contracts', 'shipping_tracking'],
    baseModules: ['projects', 'tasks'],
    features: [
      'Gestion de pedidos y rutas de reparto.',
      'Asignacion a repartidores con app movil.',
      'Seguimiento en tiempo real para el cliente.',
      'Prueba de entrega con firma o foto.',
      'Calculo de tarifas por distancia y peso.',
      'Gestion de devoluciones.',
      'Informes de productividad por repartidor.'
    ],
    theme: {
      primary: '#E74C3C',
      secondary: '#F1C40F'
    },
    labels: { staff: 'Mensajero', service: 'Envio' }
  },
  {
    slug: 'gestion-flotas',
    name: 'Gestion de flotas',
    activeModules: ['assets_management', 'projects', 'staff'],
    baseModules: ['assets_management', 'projects'],
    features: [
      'Control de vehiculos, seguros e ITV.',
      'Asignacion de conductores y rutas.',
      'Seguimiento GPS en tiempo real.',
      'Control de combustible y consumo.',
      'Alertas de mantenimiento preventivo.',
      'Partes de trabajo e incidencias.',
      'Informes de costes por vehiculo.'
    ],
    theme: {
      primary: '#2C3E50',
      secondary: '#27AE60'
    },
    labels: { staff: 'Coordinador', service: 'Ruta' }
  },
  {
    slug: 'alquiler-vehiculos',
    name: 'Alquiler de vehiculos',
    activeModules: ['assets_management', 'contracts', 'pos', 'inventory', 'staff', 'shipping_tracking'],
    baseModules: ['assets_management', 'contracts'],
    features: [
      'Gestion de flota de vehiculos.',
      'Calendario de reservas y disponibilidad.',
      'Contratos de alquiler con condiciones.',
      'Control de entregas y devoluciones.',
      'Facturacion por dias y seguros extras.',
      'Integracion con pasarelas de pago.',
      'Informes de ocupacion y rentabilidad.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#F7DC6F'
    },
    labels: { staff: 'Agente', service: 'Reserva' }
  },
  {
    slug: 'parqueaderos',
    name: 'Parqueaderos',
    activeModules: ['pos', 'staff', 'access_control'],
    baseModules: ['pos', 'staff'],
    features: [
      'Control de entrada y salida de vehiculos.',
      'Calculo de tarifas por tiempo.',
      'Gestion de abonados mensuales.',
      'Control de plazas libres y ocupadas.',
      'Integracion con barreras y lectores.',
      'Informes de ingresos y ocupacion.',
      'Modulo de incidencias.'
    ],
    theme: {
      primary: '#2C3E50',
      secondary: '#ECF0F1'
    },
    labels: { staff: 'Operador', service: 'Ingreso' }
  },
  {
    slug: 'alquiler-mobiliario-sonido',
    name: 'Alquiler de mobiliario y sonido',
    activeModules: ['inventory', 'pos', 'contracts', 'staff', 'assets_management', 'shipping_tracking'],
    baseModules: ['inventory', 'pos'],
    features: [
      'Activos alquilables con estado y disponibilidad.',
      'Calendario de reservas por evento.',
      'Contratos de alquiler con condiciones.',
      'Control de entregas y recogidas.',
      'Mantenimiento y estado de equipos.',
      'Facturacion por dias o eventos.',
      'Informes de rotacion.'
    ],
    theme: {
      primary: '#8E44AD',
      secondary: '#2C3E50'
    },
    labels: { staff: 'Tecnico', service: 'Alquiler' }
  },
  {
    slug: 'teatros-cines',
    name: 'Teatros y cines independientes',
    activeModules: [
      'pos',
      'inventory',
      'staff',
      'access_control',
      'kitchen_display',
      'digital_menu',
      'ecommerce_storefront'
    ],
    baseModules: ['pos', 'inventory'],
    features: [
      'Venta de entradas por funcion.',
      'Programacion de peliculas y obras.',
      'Gestion de salas y aforo.',
      'Venta de confiteria y bebidas.',
      'Fidelizacion de espectadores.',
      'Informes de taquilla y ocupacion.',
      'Integracion con plataformas online.'
    ],
    theme: {
      primary: '#C0392B',
      secondary: '#B7950B'
    },
    labels: { staff: 'Taquillero', service: 'Funcion' }
  },
  {
    slug: 'parques-atracciones',
    name: 'Parques de atracciones',
    activeModules: ['pos', 'inventory', 'staff', 'access_control'],
    baseModules: ['pos', 'inventory'],
    features: [
      'Venta de entradas y pases anuales.',
      'Gestion de colas virtuales.',
      'Control de accesos por tornos.',
      'Venta de food & beverage y souvenirs.',
      'Eventos especiales por temporada.',
      'Informes de afluencia y rentabilidad.',
      'App para visitantes con mapa y tiempos.'
    ],
    theme: {
      primary: '#FF6B6B',
      secondary: '#4D96FF'
    },
    labels: { staff: 'Operador', service: 'Entrada' }
  },
  {
    slug: 'servicios-domesticos',
    name: 'Servicios domesticos',
    activeModules: ['agenda', 'staff', 'services', 'subscriptions'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de servicios por categoria.',
      'Asignacion de profesionales por zona.',
      'Ficha del cliente con preferencias.',
      'Cotizaciones y presupuestos.',
      'Facturacion por servicio o abono.',
      'Seguimiento de calidad con fotos.',
      'Valoraciones y reseñas.'
    ],
    theme: {
      primary: '#85C1E9',
      secondary: '#A9DFBF'
    },
    labels: { staff: 'Operador', service: 'Servicio' }
  },
  {
    slug: 'cuidadores-adultos',
    name: 'Cuidadores de adultos mayores',
    activeModules: ['agenda', 'staff', 'services', 'subscriptions'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Perfil del paciente con necesidades medicas.',
      'Asignacion de cuidadores por turnos.',
      'Registro de actividades diarias.',
      'Comunicacion con familiares.',
      'Facturacion por horas o paquetes.',
      'Alertas de emergencia.',
      'Gestion de incidencias.'
    ],
    theme: {
      primary: '#AED6F1',
      secondary: '#D7BDE2'
    },
    labels: { staff: 'Cuidador', service: 'Servicio' }
  },
  {
    slug: 'paseadores-perros',
    name: 'Paseadores de perros',
    activeModules: ['agenda', 'staff', 'services'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Perfil de cada perro con comportamiento.',
      'Planificacion de rutas y paseos.',
      'Seguimiento GPS durante el paseo.',
      'Fotos y reportes para el dueño.',
      'Facturacion por paseo o paquete.',
      'Gestion de llaves y accesos.',
      'Alertas de recogida.'
    ],
    theme: {
      primary: '#7DCEA0',
      secondary: '#BA6B25'
    },
    labels: { staff: 'Paseador', service: 'Paseo' }
  },
  {
    slug: 'reparaciones-hogar',
    name: 'Reparaciones del hogar',
    activeModules: ['agenda', 'staff', 'services', 'inventory'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de solicitudes de reparacion.',
      'Asignacion de tecnicos por zona.',
      'Presupuestos in situ con aprobacion digital.',
      'Facturacion con desglose de materiales.',
      'Seguimiento de incidencias post-reparacion.',
      'Historial del cliente.',
      'Valoraciones.'
    ],
    theme: {
      primary: '#F39C12',
      secondary: '#7F8C8D'
    },
    labels: { staff: 'Tecnico', service: 'Servicio' }
  },
  {
    slug: 'fincas-cultivos',
    name: 'Fincas y cultivos',
    activeModules: ['assets_management', 'inventory', 'projects', 'staff'],
    baseModules: ['assets_management', 'inventory'],
    features: [
      'Gestion de parcelas y cultivos.',
      'Control de insumos y fertilizantes.',
      'Seguimiento de labores con asignacion.',
      'Inventario de maquinaria y mantenimiento.',
      'Trazabilidad de cosechas y ventas.',
      'Informes de rendimiento por hectarea.',
      'Alertas meteorologicas.'
    ],
    theme: {
      primary: '#28B463',
      secondary: '#8B4513'
    },
    labels: { staff: 'Operador', service: 'Actividad' }
  },
  {
    slug: 'guias-turisticos',
    name: 'Guias turisticos',
    activeModules: ['agenda', 'staff', 'services'],
    baseModules: ['agenda', 'staff'],
    features: [
      'Gestion de tours y excursiones.',
      'Calendario de disponibilidad de guias.',
      'Reservas con idioma preferido.',
      'Facturacion por persona o grupo.',
      'Gestion de puntos de encuentro.',
      'Comentarios y valoraciones.',
      'Integracion con mapas y rutas.'
    ],
    theme: {
      primary: '#F7DC6F',
      secondary: '#3498DB'
    },
    labels: { staff: 'Guia', service: 'Tour' }
  },
  {
    slug: 'agencias-viajes',
    name: 'Agencias de viajes',
    activeModules: ['projects', 'staff', 'services', 'contracts'],
    baseModules: ['projects', 'staff'],
    features: [
      'Gestion de reservas de vuelos y hoteles.',
      'Creacion de paquetes turisticos.',
      'Cotizaciones y facturacion.',
      'Seguimiento de itinerarios y confirmaciones.',
      'Gestion de proveedores.',
      'Integracion con GDS.',
      'Informes de ventas y comisiones.'
    ],
    theme: {
      primary: '#1ABC9C',
      secondary: '#F39C12'
    },
    labels: { staff: 'Agente', service: 'Paquete' }
  },
  {
    slug: 'ecommerce',
    name: 'Tienda en Linea',
    activeModules: ['ecommerce_storefront', 'shopping_cart', 'order_management', 'inventory', 'shipping_tracking'],
    baseModules: ['ecommerce_storefront', 'shopping_cart'],
    features: [
      'Catalogo de productos con filtros.',
      'Carrito de compras y checkout seguro.',
      'Metodos de pago multiples.',
      'Gestion de envios y tracking.',
      'Cupones de descuento y promociones.',
      'Panel de administracion de pedidos.',
      'SEO y analiticas integradas.',
      'Reseñas de clientes.'
    ],
    theme: {
      primary: '#3498DB',
      secondary: '#F39C12'
    },
    labels: { staff: 'Asesor', service: 'Producto', category: 'Categoria' }
  },
  {
    slug: 'marketplace',
    name: 'Marketplace Multi-Vendedor',
    activeModules: [
      'ecommerce_storefront',
      'shopping_cart',
      'order_management',
      'inventory',
      'shipping_tracking',
      'multi_vendor',
      'commissions',
      'accounting'
    ],
    baseModules: ['ecommerce_storefront', 'shopping_cart'],
    features: [
      'Registro y gestion de vendedores.',
      'Catalogo unificado multi-vendedor.',
      'Comisiones y liquidaciones automaticas.',
      'Division de pedidos por vendedor.',
      'Sistema de valoraciones y reputacion.',
      'Logistica centralizada o por vendedor.',
      'Paneles de control para vendedores.'
    ],
    theme: {
      primary: '#27AE60',
      secondary: '#2980B9'
    },
    labels: { staff: 'Vendedor/Tienda', service: 'Publicacion', category: 'Departamento' }
  }
];

export const VERTICALS_REGISTRY: VerticalConfig[] = RAW_VERTICALS_REGISTRY.map((vertical) => ({
  ...vertical,
  family: VERTICAL_FAMILY_BY_SLUG[vertical.slug] ?? 'General',
  exclusiveFeatures: EXCLUSIVE_FEATURES_BY_SLUG[vertical.slug] ?? []
}));
