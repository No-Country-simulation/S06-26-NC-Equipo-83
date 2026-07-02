# Frontend: Rediseñar la página de orientación `/orientation`

## Contexto

El endpoint `POST /orientar` ahora devuelve datos reales calculados por un motor de matching determinístico. La respuesta incluye hasta 3 vacantes con gap porcentual, skills matcheadas/faltantes y cursos recomendados por vacante.

La página actual (`orientationPage.tsx`) muestra datos hardcodeados con una UI genérica. Hay que rediseñarla completamente para reflejar el nuevo contrato del backend y el tono cálido y humano del proyecto.

## Contrato del backend

**Request** `POST /orientar` (requiere auth):
```json
{ "perfil": "frontend", "nivel": "junior", "region": "LATAM", "idioma": "es", "lat": 0, "lng": 0 }
```

> Los parámetros `perfil`, `nivel`, `region` se envían pero el backend ya no los usa para el matching — lee `user.known_technologies` directamente del token JWT. Se mantienen por compatibilidad.

**Response** `OrientarResponse`:
```typescript
{
  gap_porcentual: number;        // promedio de gap de las vacantes mostradas
  gap_items: string[];           // top 6 skills faltantes más comunes
  trayectoria_sugerida: string[];// títulos de cursos del roadmap combinado
  vacantes_compatibles: JobMatchDetail[];  // máximo 3, ordenadas por menor gap
  confianza: number;             // 0-1, qué % de tecnologías del usuario fueron reconocidas
}
```

Donde `JobMatchDetail` incluye por vacante:
- `id`, `title`, `company`, `location`, `description`, `area`, `seniority`, `salary`
- `gap_porcentual` (0-100, menor = mejor)
- `matched_skills`, `missing_skills`, `required_skills`, `optional_skills` (strings con labels legibles)
- `recommended_courses: CourseRecommendation[]` (title, provider, duration, url)

La compatibilidad real es `100 - gap_porcentual`. Ej: gap 25% = 75% compatible.

## Prerrequisitos

Antes de empezar esta incidencia, debe estar completada:
- **frontend-06** (tipos de API: `JobMatchDetail`, `CourseRecommendation`, `OrientarResponse` actualizado)

## Qué hay que construir

### 1. Componente `OrientationJobCard`

**Ubicación:** `src/components/orientation/OrientationJobCard.tsx`

Componente que recibe `{ job: JobMatchDetail; index: number }` y renderiza una card compacta y escaneable.

#### Vista principal (cerrada)

Layout horizontal con 3 zonas:

```
┌──────────────────────────────────────────────────────────┐
│ [AVATAR]  EMPRESA  [BADGE ÁREA]          ┌─────┐        │
│           Título del puesto              │ 75% │ donut  │
│           📍Remoto · Semi Senior · $$$   └─────┘        │
│           3/5 skills · Te faltan: CSS, Next.js          │
│                                    [✨ Elegir vacante]  │
│                                    [▾ Ver detalles]     │
└──────────────────────────────────────────────────────────┘
```

Elementos requeridos:
- **Avatar**: iniciales de la empresa (2 letras) en gradiente terracota (`from-[#A04E2D] to-[#C87A53]`), `w-10 h-10 rounded-xl`
- **Empresa**: `text-[11px] font-bold text-[#A04E2D] uppercase tracking-wider`
- **Badge de área**: pill con `bg-[#A04E2D]/10`, mismo valor de `INTEREST_AREAS` del registro (usar `AREA_LABEL` para mostrar nombre legible)
- **Título**: `text-sm sm:text-base font-extrabold text-stone-900`
- **Meta línea**: ubicación, seniority, salario con íconos `MapPin`, `Star`, `Clock` de lucide-react, `text-[11px] text-stone-400`
- **Skills micro-summary**: `"3/5 skills cumplidas · Te faltan: React, TypeScript"` (mostrar solo 3 skills faltantes, si hay más agregar `+N`)
- **Mini donut SVG**: círculo de ~56px con anillo de progreso coloreado por severidad (verde ≥75%, ámbar ≥50%, rojo <50%) y porcentaje centrado
- **Botón principal**: `Elegir vacante` con ícono `Sparkles`, gradiente terracota, `rounded-lg`, `text-[11px] font-bold`
- **Link secundario**: `Ver detalles` con `ChevronDown` que rota 180° al expandir

#### Panel expandible (al clickear "Ver detalles" o "Elegir vacante")

Animación con `AnimatePresence` + `motion.div` (height 0 → auto, opacity 0 → 1, duration 0.25s).

Contenido del panel (sobre fondo `bg-stone-50/60`, borde superior `border-t border-stone-100`):

1. **Descripción del puesto** (`text-xs text-stone-500`)
2. **Motivo de recomendación**: `<Sparkles />` ámbar + texto itálico: "Recomendada porque coincide con tus áreas de interés y tecnologías. Tu perfil tiene un X% de compatibilidad."
3. **Skills en 2 columnas** (`grid grid-cols-2`):
   - Izquierda: `Ya cumplís (N)` con chips verdes (`bg-emerald-50 text-emerald-700`)
   - Derecha: `Por desarrollar (N)` con chips ámbar (`bg-amber-50 text-amber-700`)
   - Cada chip: `rounded-md`, `text-[11px] font-semibold`, puntito de color
4. **CTA accionable**: si hay skills faltantes Y hay cursos: pill con ícono `GraduationCap` + texto "Con N cursos podés cerrar este gap y postularte."
5. **Camino de aprendizaje**: lista de cursos con ícono `BookOpen`, título, provider + duración, y link externo con `ArrowUpRight`

#### Constantes auxiliares (en el mismo archivo)

```typescript
const seniorityLabel: Record<string, string> = {
  trainee: "Trainee", junior: "Junior", "semi-senior": "Semi Senior", senior: "Senior",
};

const AREA_LABEL: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", fullstack: "Full Stack",
  mobile: "Mobile", ai_ml: "IA / ML", data_science: "Ciencia de datos",
  devops: "DevOps", cloud: "Cloud", cybersecurity: "Ciberseguridad",
  qa_testing: "QA / Testing", ux_ui: "UI / UX", product_management: "Product Mgmt",
  blockchain: "Blockchain", iot: "IoT", game_development: "Game Dev",
};
```

#### Estados del componente

- **Stagger animation**: `motion.article` con `initial={{ opacity: 0, y: 16 }}` y `delay: index * 0.06`
- **Hover**: `hover:shadow-md` en la card
- **Expand/collapse**: `AnimatePresence` con `motion.div` para altura y opacidad
- **Botón active**: `active:scale-[0.97]`
- **Sin cursos**: mostrar "No hay cursos disponibles para las skills faltantes." en itálico

### 2. Página `orientationPage.tsx`

**Ubicación:** `src/modules/orientation/orientationPage.tsx`

Reescribir completamente. Conservar la lógica de fetching (usa `useOrientarStore` y `useAuthStore`) pero rediseñar todo el markup.

#### Sección Hero

Fondo con gradiente cálido `from-[#F5F3EE] via-[#FBF9F4] to-[#FDFBF7]` + patrón de puntos sutil (`backgroundImage: radial-gradient(circle, #A04E2D 1px, transparent 1px)` con opacidad 0.03).

```
┌─────────────────────────────────────────────────┐
│ ── Orientación profesional                      │
│                                                 │
│ María, encontramos                              │
│ estas vacantes para vos                         │
│                                                 │
│ Seleccionamos estas oportunidades en Frontend   │
│ y Full Stack tras analizar tu perfil, tus       │
│ tecnologías y tus áreas de interés.             │
│                                                 │
│ ┌─────────────────────────────┐                 │
│ │ 📈 3 oportunidades │ Frontend y Full Stack │  │
│ └─────────────────────────────┘                 │
└─────────────────────────────────────────────────┘
```

Elementos:
- **Eyebrow**: línea decorativa + "Orientación profesional" en `text-[10px] font-extrabold text-[#A04E2D] uppercase tracking-[0.2em]`
- **Heading**: `text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900` con nombre del usuario y palabra clave en `text-[#A04E2D]`
- **Subtítulo**: `text-base sm:text-lg text-stone-500` explicando que las vacantes fueron seleccionadas tras analizar el perfil
- **Stats pill**: `bg-white rounded-2xl border border-stone-200/80 shadow-sm` con conteo de oportunidades + áreas (derivadas de los jobs reales, no de los intereses del usuario)

#### Calcular `areaLabel` desde los datos reales

```typescript
const jobs = data.vacantes_compatibles;
const matchedAreas = [...new Set(jobs.map((j) => j.area))];
const areaLabel = formatInterests(matchedAreas);
```

Donde `formatInterests` une áreas con "y":
```typescript
function formatInterests(areas: string[]): string {
  if (areas.length === 0) return "tu área";
  const labels = areas.map((a) => AREA_LABEL[a] ?? a);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  const last = labels.pop();
  return `${labels.join(", ")} y ${last}`;
}
```

#### Sección de cards

Encabezado de sección con eyebrow + explicación:
```
── Recomendaciones para tu perfil
   Ordenadas por menor gap: primero las que están más cerca de tu alcance.
```

Luego 3 `<OrientationJobCard>` con espaciado `space-y-4`.

#### Footer motivacional

Card con gradiente suave `from-[#A04E2D]/5 via-[#C87A53]/5 to-amber-100/30`, borde `border-[#A04E2D]/10`. Ícono `GraduationCap` en contenedor blanco con sombra. Texto: "Cada curso te transforma. Las personas que completan al menos un curso de su plan de aprendizaje tienen 3 veces más probabilidades de conseguir una entrevista."

#### Estados

- **Loading**: spinner `Loader2` + texto "Buscando las mejores oportunidades para vos..." sobre fondo `bg-[#FDFBF7]`
- **Error / sin datos**: ícono `AlertCircle` en `bg-red-50 rounded-2xl` + mensaje + botón "Reintentar"
- **Sin vacantes**: ícono `Compass` en `bg-stone-100 rounded-2xl` + "No encontramos vacantes en tus áreas de interés. Probá ampliando tus áreas de interés en tu perfil."

#### Actualizar `useEffect`

Cambiar los parámetros del fetch para usar los campos nuevos del usuario:

```typescript
useEffect(() => {
  if (user && !data) {
    const primaryArea = user.interest_areas?.[0] || user.tech_area || "frontend";
    fetchAnalysis({
      perfil: primaryArea,
      nivel: user.current_situation || user.professional_level || "junior",
      region: user.country_name || "LATAM",
      idioma: user.language_code || "es",
      lat: 0,
      lng: 0,
    });
  }
}, [user]);
```

## Diseño visual

Seguir el design system del proyecto:
- **Color firma**: terracota `#A04E2D` / `#853F22` / `#C87A53`
- **Fondos**: nunca blanco puro. Usar `#FDFBF7`, `#FBF9F4`, `#F5F3EE`
- **Cards**: `rounded-2xl`, `shadow-sm`, borde `stone-200/80`
- **Tipografía**: `font-extrabold` para headings, `font-sans antialiased` en contenedores
- **Badges**: `rounded-full`, `text-[10px] font-extrabold tracking-widest uppercase`
- **Íconos**: lucide-react exclusivamente
- **Animaciones**: framer-motion para entradas, Tailwind `animate-*` para micro-interacciones

## Criterios de aceptación

- [ ] La página carga y muestra 3 cards con datos reales del endpoint
- [ ] Cada card muestra: empresa, título, ubicación, seniority, salario, área, donut de compatibilidad
- [ ] El micro-summary de skills se actualiza correctamente (ej: "Te faltan: React, CSS")
- [ ] Al clickear "Ver detalles" se expande el panel con skills y cursos
- [ ] "Elegir vacante" también expande el panel
- [ ] El área en el hero se deriva de las vacantes reales, no de los intereses del usuario
- [ ] La página es responsive (mobile-first, hasta `max-w-[800px]`)
- [ ] Los estados de loading, error y vacío se muestran correctamente
- [ ] No hay errores de TypeScript
