# 🤝 CONTRIBUTING - ESSENCE SOFTWARE FACTORY

Gracias por contribuir. Este repositorio es multi-tenant, multi-industria y exige consistencia tecnica y visual.

---

## 🌿 GitFlow (Ramas)

| Rama | Proposito | Proteccion |
| --- | --- | --- |
| main | Produccion | Solo merge con aprobacion |
| develop | Integracion | Base de trabajo del equipo |
| feature/* | Funcionalidades | PR obligatorio |
| fix/* | Correcciones criticas | PR obligatorio |

**Reglas:**
- Prohibido subir a `main` o `develop` sin aprobacion de un par.
- Todo PR debe incluir descripcion tecnica, impacto y prueba realizada.

---

## 🧩 Pull Requests

**Requerimientos minimos:**
- 1 aprobacion de un par (minimo).
- Sin conflictos ni warnings criticos.
- Evidencia de pruebas o nota de verificacion manual.

---

## 🎯 Estandar de Nitidez (UI Essence)

- Regla de los 4px para alineaciones y espacios alrededor de `EssenceMicroSymbol`.
- Uso obligatorio de variables de marca: `--primary`, `--secondary`, `--primary-glow`.
- Animaciones GSAP con cleanup (no memory leaks) y sin layout thrashing.
- Scroll performance: evita `getBoundingClientRect` en loops frecuentes.

---

## 🧾 Convencion de Commits

Usa prefijos estandar:

```text
feat: agrega modulo de reportes
fix: corrige validacion de reservas
docs: actualiza README legal
style: ajusta spacing en landing
refactor: optimiza repositorio de citas
```

---

## 🛡 Blindaje Legal (Obligatorio)

Si un modulo recolecta datos personales en Colombia, debe incluir referencia a la PTD y obtener consentimiento.

---

## ✅ Checklist de PR

- [ ] Compila localmente
- [ ] No hay errores de lint
- [ ] Legal/PTD considerada si hay datos personales
- [ ] Cambios documentados si afectan al cliente
