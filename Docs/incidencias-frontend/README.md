# Incidencias Frontend — Guía para Desarrolladores React

> **LEÉ ESTO ANTES DE TOCAR UNA SOLA LÍNEA DE CÓDIGO.**

## Stack del proyecto

| Tecnología | Versión | ¿Para qué? |
|-----------|---------|------------|
| React | 19.x | UI |
| TypeScript | 6.x | Tipado estático |
| Vite | 8.x | Bundler y dev server |
| react-hook-form | 7.x | Manejo de formularios |
| Zod | 4.x | Validación de schemas |
| Zustand | 5.x | Estado global |
| react-select | 5.x | Selects avanzados (multiselect, creatable, async) |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Axios | 1.x | Cliente HTTP |

## Convenciones del proyecto

- **Nombres de campo:** camelCase en frontend (`currentSituation`), snake_case en API (`current_situation`). El mapeo lo hace `lib/fieldMappings.ts`.
- **Validación:** Zod schemas en `lib/validations.ts`. Un schema por step, mergeados en `register.tsx`.
- **Formularios:** react-hook-form con `useForm` + `zodResolver`. Componentes no nativos (react-select) usan `<Controller>`.
- **Estado global:** Zustand stores en `store/`. No usamos Redux ni Context para estado compartido.

## Índice de Incidencias

| # | Archivo | ¿Qué se construye? |
|---|---------|-------------------|
| 09 | [09-fundamentos-step3-v3.md](./09-fundamentos-step3-v3.md) | Tipos, schemas Zod, mapeo de campos, estilos compartidos, componentes SearchableSelect y CharCounter |
| 10 | [10-formulario-step3-v3.md](./10-formulario-step3-v3.md) | Formulario Step 3 completo, update de register.tsx, refactor de Step 2 |

## Mapa de Dependencias

```
Día 1        │  09-fundamentos (Dev A)
             │  Construye tipos, schemas, componentes base
             │
Día 2        │  10-formulario (Dev B)
             │  Depende de 09 mergeado
             │  Usa los componentes que creó Dev A
```

**El dev de 09 entrega rápido (componentes sin lógica de formulario).** El dev de 10 no se bloquea porque los componentes ya tienen una API definida.

## Relación con Backend

| Incidencia Frontend | Necesita de Backend |
|---------------------|-------------------|
| 09 | Incidencia 07 mergeada (para conocer los nombres de los nuevos campos del modelo `User`) |
| 10 | Incidencia 07 mergeada. 08a y 08b son independientes del frontend. |
