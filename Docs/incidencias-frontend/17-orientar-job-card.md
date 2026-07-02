## INCIDENCIA 17 — Componente OrientationJobCard para la pagina de orientacion

## Resumen

Esta incidencia crea el componente `OrientationJobCard` que muestra una vacante compatible con el perfil del usuario. El componente es compacto y escaneable: prioriza velocidad de decision sobre explicacion. Muestra titulo, empresa, compatibilidad (SVG donut), contexto laboral (ubicacion, seniority, salario) y un micro-resumen de skills. Todo el detalle (descripcion completa, skills matcheadas vs faltantes, cursos recomendados) va en un panel expandible que se abre con "Ver detalles".

**Rama:** `incidencia/17-orientar-job-card`
**Duracion estimada:** 3-4 horas.
**Depende de:** Incidencia 15 mergeada (necesitas los tipos `JobMatchDetail` y `CourseRecommendation`).
**Asignada a:** 1 dev frontend.

### Que vas a aprender de React en esta incidencia

| Concepto | Que es |
|----------|--------|
| AnimatePresence + motion.div | Como animar la apertura/cierre de un panel con altura dinamica sin conocer su tamano |
| SVG donut chart inline | Como dibujar un grafico de anillo con `<circle>` y `strokeDasharray` sin librerias externas |
| Stagger animation con Framer Motion | Como hacer que varias cards entren con delay progresivo (`delay: index * 0.06`) |
| Estado local vs global | Cuando usar `useState` en un componente en vez de Zustand |

### Pre-lectura (15 min)

| Archivo | Por que |
|---------|----------|
| `frontend/src/types/api.ts` | Los tipos `JobMatchDetail` y `CourseRecommendation` que creo el dev de 15 |
| `frontend/src/components/dashboard/JobMatchCard.tsx` | Referencia de como ya se muestran cards de empleo en el dashboard |
| `frontend/package.json` | Verifica que `framer-motion` esta instalado (version 12.x) y `lucide-react` (version 1.x) |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main            # 15 ya debe estar mergeado
git checkout -b incidencia/17-orientar-job-card
```

### Paso a paso

#### Archivo unico: `frontend/src/components/orientation/OrientationJobCard.tsx` (NUEVO)

Creá la carpeta `src/components/orientation/` y este archivo dentro.

El componente recibe `{ job: JobMatchDetail; index: number }`. El `index` se usa para el delay del stagger.

#### Estructura visual (cerrada)

```
+-- Avatar empresa (iniciales, gradiente terracota, w-10 h-10 rounded-xl)
|   Empresa [BADGE AREA]                                +-------+
|   Titulo del puesto                                    |  75%  |  <-- SVG donut
|   Ubicacion · Seniority · Salario                       +-------+
|   3/5 skills cumplidas · Te faltan: CSS, Next.js
|                                          [Elegir vacante]
|                                          [Ver detalles v]
+----------------------------------------------------------+
```

#### Estructura visual (expandida al clickear "Ver detalles")

El panel expandible aparece debajo de la card, con fondo `bg-stone-50/60` y borde superior `border-t border-stone-100`. Contenido:

1. **Descripcion del puesto** (texto completo del backend)
2. **Motivo de recomendacion** (icono sparkles ambar + texto italico: "Recomendada porque coincide con tus areas de interes y tecnologias.")
3. **Skills en 2 columnas** (grid-cols-2):
   - Izquierda: "Ya cumplis (N)" con chips verdes (`bg-emerald-50 text-emerald-700 border-emerald-200`)
   - Derecha: "Por desarrollar (N)" con chips ambar (`bg-amber-50 text-amber-700 border-amber-200`)
4. **CTA accionable**: pill con icono GraduationCap + "Con N cursos podes cerrar este gap y postularte." (solo si hay skills faltantes y cursos)
5. **Camino de aprendizaje**: lista de cursos con icono BookOpen, titulo, provider + duracion, link externo

#### Implementacion

**Imports necesarios:**

```typescript
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Star, Clock, ChevronDown, GraduationCap,
  BookOpen, ArrowUpRight, Sparkles,
} from "lucide-react";
import type { JobMatchDetail, CourseRecommendation } from "../../types/api";
```

**Constantes auxiliares (en el mismo archivo, fuera del componente):**

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

**SVG Donut (sub-componente interno):**

```typescript
const MiniDonut = ({ percent, size = 56 }: { percent: number; size?: number }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 75 ? "#059669" : percent >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out" />
      </svg>
      <span className="absolute text-sm font-extrabold text-stone-700 tabular-nums">{percent}%</span>
    </div>
  );
};
```

> **Nota sobre el color:** verde si >= 75% (cerca de calificar), ambar si >= 50% (camino por recorrer), rojo si < 50% (gap grande). Este es un indicador visual rapido, no un juicio.

**SkillChip (sub-componente):**

```typescript
const SkillChip = ({ label, variant }: { label: string; variant: "matched" | "pending" }) => {
  const styles = {
    matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles[variant]}`}>
      {variant === "matched" ? <span className="w-1 h-1 rounded-full bg-emerald-500" /> : <span className="w-1 h-1 rounded-full bg-amber-500" />}
      {label}
    </span>
  );
};
```

**CourseRow (sub-componente para cada curso en el panel expandible):**

```typescript
const CourseRow = ({ course }: { course: CourseRecommendation }) => (
  <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-stone-100 hover:border-stone-200 transition-colors group">
    <div className="w-7 h-7 rounded-md bg-[#A04E2D]/10 flex items-center justify-center flex-shrink-0">
      <BookOpen className="w-3.5 h-3.5 text-[#A04E2D]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-stone-700 truncate">{course.title}</p>
      <p className="text-[10px] text-stone-400">{course.provider} · {course.duration}</p>
    </div>
    {course.url && (
      <a href={course.url} target="_blank" rel="noopener noreferrer"
        className="p-1 text-stone-300 hover:text-[#A04E2D] transition-colors flex-shrink-0">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    )}
  </div>
);
```

**Componente principal:**

```typescript
interface Props { job: JobMatchDetail; index: number; }

export const OrientationJobCard = ({ job, index }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  const compatPercent = Math.round(100 - job.gap_porcentual);
  const matchedCount = job.matched_skills.length;
  const requiredCount = job.required_skills.length;
  const missingPreview = job.missing_skills.slice(0, 3);
  const extraMissing = Math.max(0, job.missing_skills.length - 3);
  const courseCount = job.recommended_courses.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      {/* FILA PRINCIPAL (siempre visible) */}
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Avatar empresa */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#A04E2D] to-[#C87A53] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
          {job.company.slice(0, 2).toUpperCase()}
        </div>

        {/* Info central */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold text-[#A04E2D] uppercase tracking-wider truncate">{job.company}</p>
            {job.area && (
              <span className="flex-shrink-0 px-1.5 py-px rounded-full bg-[#A04E2D]/10 text-[9px] font-extrabold text-[#A04E2D]/70 uppercase tracking-wider">
                {AREA_LABEL[job.area] ?? job.area}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug truncate mt-0.5">{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] font-medium text-stone-400">
            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className="capitalize"><Star className="w-3 h-3 inline mr-0.5" />{seniorityLabel[job.seniority] ?? job.seniority}</span>
            {job.salary && <span><Clock className="w-3 h-3 inline mr-0.5" />{job.salary}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-semibold text-stone-500">{matchedCount}/{requiredCount} skills cumplidas</span>
            {missingPreview.length > 0 && (
              <span className="text-[11px] text-amber-600 font-medium truncate">
                · Te falta{missingPreview.length === 1 ? "" : "n"}: {missingPreview.join(", ")}{extraMissing > 0 ? ` +${extraMissing}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Donut + botones */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <MiniDonut percent={compatPercent} />
          <button onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#A04E2D] to-[#C87A53] hover:from-[#853F22] hover:to-[#A04E2D] text-white font-bold text-[11px] rounded-lg transition-all duration-200 shadow-sm active:scale-[0.97]">
            <Sparkles className="w-3 h-3" />
            Elegir vacante
          </button>
          <button onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors">
            Ver detalles
            <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* PANEL EXPANDIBLE */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-100 bg-stone-50/60 px-4 sm:px-5 py-4 space-y-4">
              {/* Descripcion */}
              <p className="text-xs text-stone-500 leading-relaxed">{job.description}</p>

              {/* Motivo recomendacion */}
              <div className="flex items-start gap-2">
                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-400 italic leading-relaxed">
                  Recomendada porque coincide con tus areas de interes y tecnologias. Tu perfil tiene un {compatPercent}% de compatibilidad.
                </p>
              </div>

              {/* Skills en 2 columnas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    Ya cumplis ({matchedCount})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {job.matched_skills.map((s) => <SkillChip key={s} label={s} variant="matched" />)}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                    Por desarrollar ({job.missing_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {job.missing_skills.map((s) => <SkillChip key={s} label={s} variant="pending" />)}
                  </div>
                </div>
              </div>

              {/* CTA accionable */}
              {job.missing_skills.length > 0 && courseCount > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-2 bg-[#A04E2D]/5 rounded-lg border border-[#A04E2D]/10">
                  <GraduationCap className="w-3.5 h-3.5 text-[#A04E2D] flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-[#A04E2D]">
                    Con {courseCount} {courseCount === 1 ? "curso" : "cursos"} podes cerrar este gap y postularte.
                  </p>
                </div>
              )}

              {/* Cursos */}
              {courseCount > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#A04E2D]" />Camino de aprendizaje
                  </p>
                  <div className="space-y-1.5">
                    {job.recommended_courses.map((c, i) => <CourseRow key={`${c.title}-${i}`} course={c} />)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
```

### Verificacion completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores
```

Como el componente no se renderiza en ninguna ruta todavia, no hay prueba visual hasta la incidencia 18. Pero podes verificarlo temporalmente importandolo en `App.tsx` con datos mock.

### Errores que te vas a encontrar

| Error | Causa | Solucion |
|-------|-------|----------|
| `framer-motion` no esta instalado | Falta la dependencia | `npm install framer-motion` (ya deberia estar en package.json) |
| `Cannot find module '../../types/api'` | La ruta de import no coincide con la estructura de carpetas | La ruta correcta desde `components/orientation/` es `../../types/api` |
| El SVG donut no se ve | `strokeDasharray` o `strokeDashoffset` mal calculados | Verifica que `circumference = 2 * Math.PI * radius`. El offset debe ser `circumference - (percent/100) * circumference`. |
| El panel expandible parpadea al abrir/cerrar | `AnimatePresence` no envuelve a `motion.div` | `AnimatePresence` debe ser el padre DIRECTO del `motion.div` condicional |
| `AREA_LABEL` no cubre un area nueva | El backend devuelve un area que no esta en el Record | Agregala al diccionario. Si no sabes el nombre exacto, usa `?? job.area` como fallback. |

### Criterios de aceptacion Incidencia 17

- [ ] El componente existe en `src/components/orientation/OrientationJobCard.tsx`
- [ ] Muestra avatar de empresa con iniciales en gradiente terracota
- [ ] Muestra nombre de empresa, titulo del puesto y badge de area
- [ ] Muestra ubicacion, seniority y salario en una linea compacta
- [ ] Muestra micro-resumen de skills: "3/5 skills cumplidas · Te faltan: CSS, Next.js"
- [ ] Muestra SVG donut con porcentaje de compatibilidad coloreado por severidad
- [ ] El boton "Elegir vacante" y "Ver detalles" alternan el panel expandible
- [ ] El panel expandible muestra: descripcion, motivo de recomendacion, skills en 2 columnas, CTA accionable y cursos
- [ ] Las skills matcheadas usan chips verdes, las faltantes usan chips ambar
- [ ] Los cursos muestran titulo, provider, duracion y link externo con icono
- [ ] La animacion de entrada usa stagger con `index * 0.06`
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(orientar): crear componente OrientationJobCard`
