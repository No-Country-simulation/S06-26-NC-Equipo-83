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
| 11 | [11-public-layout-navbar-footer.md](./11-public-layout-navbar-footer.md) | PublicLayout: Navbar y Footer unificados para landing, login y register |
| 15 | [15-orientar-tipos-mocks.md](./15-orientar-tipos-mocks.md) | Tipos `JobMatchDetail` y `CourseRecommendation`, actualizar `OrientarResponse`, reescribir mocks |
| 16 | [16-skills-normalizados-registro.md](./16-skills-normalizados-registro.md) | Skills normalizados en el formulario de registro, archivo `skillLabels.ts` |
| 17 | [17-orientar-job-card.md](./17-orientar-job-card.md) | Componente `OrientationJobCard`: card compacta con SVG donut, panel expandible, skills y cursos |
| 18 | [18-orientar-pagina.md](./18-orientar-pagina.md) | Página `/orientation` completa: hero, cards, área derivada de datos reales |

## Mapa de Dependencias

```
Día 1        │  09-fundamentos (Dev A)           15-tipos-mocks (Dev C)
             │  Construye tipos, schemas,         Agrega tipos y mocks
             │  componentes base                  para el nuevo /orientar
             │
Día 2        │  10-formulario (Dev B)            16-skills-registro (Dev D)
             │  Depende de 09 mergeado            Independiente, actualiza
             │  Usa los componentes de Dev A      PREDEFINED_TECHNOLOGIES
             │
Día 3        │  11-public-layout (Dev A/B)       17-job-card (Dev E)
             │  Independiente                     Depende de 15 mergeado
             │                                    Crea OrientationJobCard
             │
Día 4        │                                    18-pagina (Dev F)
             │                                    Depende de 15 y 17 mergeados
             │                                    Arma la página completa
```

**15 y 16 son independientes entre sí.** 16 también es independiente del resto. Esto permite 2 devs en paralelo el primer día.

**17 depende de 15.** Sin los tipos, el componente no compila.

**18 depende de 15 y 17.** Sin los tipos y el componente, la página no compila.

## Relación con Backend

| Incidencia Frontend | Necesita de Backend |
|---------------------|-------------------|
| 09 | Incidencia 07 mergeada (para conocer los nombres de los nuevos campos del modelo `User`) |
| 10 | Incidencia 07 mergeada |
| 15 | Endpoint `POST /orientar` desplegado (para conocer el contrato de respuesta) |
| 16 | Ninguno (es solo cambio de datos del formulario) |
| 17 | Incidencia 15 mergeada |
| 18 | Incidencias 15 y 17 mergeadas. Endpoint `/orientar` disponible para pruebas. |
