# Verticales y rutas dinamicas

Fecha: 2026-03-08

## Vertical Registry
Archivo: frontend/src/shared/constants/verticalsRegistry.ts
- Define slug, name, family, activeModules, baseModules, features, labels y theme.
- El frontend usa esta fuente unica para landings y chips por vertical.

## Rutas
- /landing/:slug (legacy)
- /:verticalId (dinamica por vertical)
- /404 (not found con estilo Essence)

## Notas
- VerticalLandingPage busca vertical por slug o verticalId y redirige a /404 si no existe.
- LandingLayout aplica transicion GSAP por ruta.

## Ejemplo de ruta
- /restaurantes -> carga vertical restaurantes
- /discotecas-bares -> carga vertical discotecas

## Ejemplo de entrada en registry
```ts
{
	slug: 'restaurantes',
	name: 'Restaurantes',
	activeModules: ['tables', 'pos', 'kitchen_display'],
	baseModules: ['tables', 'pos'],
	features: ['Mapa de mesas', 'Comandas a cocina'],
	labels: { staff: 'Mesero', service: 'Plato' },
	theme: { primary: '#F39237', secondary: '#D9381E' }
}
```
