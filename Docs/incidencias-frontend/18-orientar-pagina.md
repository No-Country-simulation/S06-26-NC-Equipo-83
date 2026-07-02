## INCIDENCIA 18 — Pagina de orientacion `/orientation`

## Resumen

Esta incidencia reescribe completamente la pagina de orientacion (`/orientation`) para usar el nuevo endpoint y el nuevo componente `OrientationJobCard`. La pagina actual muestra datos hardcodeados con una UI generica (circulo de gap, 3 course cards, lista de vacantes). La nueva pagina tiene un hero con identidad de marca, muestra hasta 3 vacantes con las cards de la incidencia 17, y deriva la etiqueta de areas desde los datos reales de las vacantes (no desde los intereses del usuario).

**Rama:** `incidencia/18-orientar-pagina`
**Duracion estimada:** 3-4 horas.
**Depende de:** Incidencias 15 y 17 mergeadas.
**Asignada a:** 1 dev frontend.

### Que vas a aprender de React en esta incidencia

| Concepto | Que es |
|----------|--------|
| Datos derivados con `useMemo` / `Set` | Como extraer areas unicas de un array de objetos sin duplicados |
| Estados de UI (loading, error, empty, success) | Como manejar los 4 estados de una pagina que depende de datos async |
| Composicion de componentes | Como armar una pagina combinando layout, hero, cards y footer |
| `useEffect` + `fetchAnalysis` | Como disparar una llamada a la API cuando el usuario esta autenticado |

### Pre-lectura (15 min)

| Archivo | Por que |
|---------|----------|
| `frontend/src/modules/orientation/orientationPage.tsx` | Vas a reescribirlo completo |
| `frontend/src/store/useOrientarStore.ts` | Vas a usar `data`, `isLoading`, `error`, `fetchAnalysis` |
| `frontend/src/store/useAuthStore.ts` | Vas a leer `user` para el nombre y los parametros del fetch |
| `frontend/src/components/orientation/OrientationJobCard.tsx` | El componente que creo el dev de 17 |
| `frontend/src/types/api.ts` | Los tipos `OrientarResponse`, `JobMatchDetail` que creo el dev de 15 |

### Antes de codear: flujo git

```bash
git checkout main
git pull origin main            # 15 y 17 ya deben estar mergeados
git checkout -b incidencia/18-orientar-pagina
```

### Paso a paso

#### Archivo unico: `frontend/src/modules/orientation/orientationPage.tsx` (REESCRIBIR)

Borra TODO el contenido actual y reescribilo desde cero.

#### 1. Imports

```typescript
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, GraduationCap, Compass, TrendingUp,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { OrientationJobCard } from "../../components/orientation/OrientationJobCard";
```

#### 2. Constante de labels de areas

Necesaria para formatear el texto "en Frontend y Backend". Copia exactamente esto (misma constante que en incidencia 17, pero aca hace falta para el `formatInterests`):

```typescript
const AREA_LABEL: Record<string, string> = {
  frontend: "Frontend", backend: "Backend", fullstack: "Full Stack",
  mobile: "Mobile", ai_ml: "IA / ML", data_science: "Ciencia de datos",
  devops: "DevOps", cloud: "Cloud", cybersecurity: "Ciberseguridad",
  qa_testing: "QA / Testing", ux_ui: "UI / UX", product_management: "Product Mgmt",
  blockchain: "Blockchain", iot: "IoT", game_development: "Game Dev",
};

function formatInterests(areas: string[]): string {
  if (areas.length === 0) return "tu area";
  const labels = areas.map((a) => AREA_LABEL[a] ?? a);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  const last = labels.pop();
  return `${labels.join(", ")} y ${last}`;
}
```

> **Importante:** `formatInterests` recibe keys de area (ej: `["frontend", "fullstack"]`) y devuelve texto legible ("Frontend y Full Stack"). Usa `AREA_LABEL` para el mapeo.

#### 3. Componente principal

```typescript
export const OrientationPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchAnalysis } = useOrientarStore();

  // Disparar el fetch cuando el usuario esta cargado
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

  const firstName = user?.full_name?.split(" ")[0] ?? "";

  // ... estados de loading, error, success (ver abajo) ...
};
```

> **Nota sobre los parametros del fetch:** Aunque el backend usa `user.known_technologies` para el matching (leidas del JWT), el frontend sigue enviando `perfil` y `nivel` como referencia. Usa `user.interest_areas[0]` y `user.current_situation` que son los campos nuevos del modelo v3. Si no existen, cae en los campos legacy.

#### 4. Estado: Loading

```tsx
if (isLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-[#A04E2D]/10 animate-pulse" />
          <Compass className="w-16 h-16 text-[#A04E2D]/30 relative z-10" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-[#A04E2D] mx-auto" />
        <p className="text-sm text-stone-500 font-medium">Buscando las mejores oportunidades para vos...</p>
      </motion.div>
    </main>
  );
}
```

#### 5. Estado: Error o sin datos

```tsx
if (error || !data) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-sm text-red-600 font-medium">{error || "No se pudo cargar el analisis."}</p>
        <button
          onClick={() => fetchAnalysis({
            perfil: user?.interest_areas?.[0] || user?.tech_area || "frontend",
            nivel: user?.current_situation || user?.professional_level || "junior",
            region: "LATAM", idioma: "es", lat: 0, lng: 0,
          })}
          className="inline-flex px-5 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
        >
          Reintentar
        </button>
      </motion.div>
    </main>
  );
}
```

> **Nota:** El boton "Reintentar" vuelve a llamar a `fetchAnalysis` con los parametros del perfil actual.

#### 6. Estado: Success

```tsx
const jobs = data.vacantes_compatibles;

// Derivar areas desde las vacantes reales, no desde intereses del usuario
const matchedAreas = [...new Set(jobs.map((j) => j.area))];
const areaLabel = formatInterests(matchedAreas);

return (
  <main className="min-h-screen bg-[#FDFBF7]">
    {/* === HERO SECTION === */}
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F3EE] via-[#FBF9F4] to-[#FDFBF7] border-b border-stone-200/60">
      {/* Patron de puntos decorativo sutil */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #A04E2D 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

      <div className="relative max-w-[800px] mx-auto px-4 sm:px-6 py-10 md:py-14 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="space-y-5">

          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-px bg-[#A04E2D]/30" />
            <span className="text-[10px] font-extrabold text-[#A04E2D] uppercase tracking-[0.2em]">
              Orientacion profesional
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
            {firstName ? (
              <>{firstName}, encontramos<br /><span className="text-[#A04E2D]">estas vacantes para vos</span></>
            ) : (
              <>Encontramos<br /><span className="text-[#A04E2D]">estas vacantes para vos</span></>
            )}
          </h1>

          {/* Subtitulo */}
          <p className="text-base sm:text-lg text-stone-500 leading-relaxed max-w-xl">
            Seleccionamos estas oportunidades en{" "}
            <span className="font-bold text-stone-700">{areaLabel}</span>{" "}
            tras analizar tu perfil, tus tecnologias y tus areas de interes.
            Cada una incluye un analisis detallado para que sepas exactamente que pasos seguir.
          </p>

          {/* Stats pill */}
          {jobs.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl border border-stone-200/80 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <TrendingUp className="w-4 h-4 text-[#A04E2D]" />
                {jobs.length} {jobs.length === 1 ? "oportunidad" : "oportunidades"}
              </div>
              <span className="w-px h-4 bg-stone-200" />
              <span className="text-sm font-medium text-stone-400">en {areaLabel}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>

    {/* === JOB CARDS === */}
    <section className="max-w-[800px] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-4">
      {/* Section header */}
      <div className="space-y-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="w-6 h-px bg-[#A04E2D]/30" />
          <span className="text-[10px] font-extrabold text-[#A04E2D] uppercase tracking-[0.2em]">
            Recomendaciones para tu perfil
          </span>
        </div>
        <p className="text-xs text-stone-400 pl-8">
          Ordenadas por menor gap: primero las que estan mas cerca de tu alcance.
        </p>
      </div>

      {jobs.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-3 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center">
            <Compass className="w-6 h-6 text-stone-300" />
          </div>
          <p className="text-stone-400 font-medium">No encontramos vacantes en tus areas de interes.</p>
          <p className="text-sm text-stone-400">Proba ampliando tus areas de interes en tu perfil.</p>
        </motion.div>
      ) : (
        jobs.map((job, i) => <OrientationJobCard key={job.id} job={job} index={i} />)
      )}
    </section>

    {/* === MOTIVATIONAL FOOTER === */}
    <section className="max-w-[800px] mx-auto px-4 sm:px-6 pb-12 md:pb-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gradient-to-r from-[#A04E2D]/5 via-[#C87A53]/5 to-amber-100/30 rounded-2xl border border-[#A04E2D]/10 p-5 sm:p-6 flex items-start gap-4">
        <div className="p-2.5 bg-white rounded-xl text-[#A04E2D] shadow-sm flex-shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-stone-800">Cada curso te transforma.</p>
          <p className="text-sm text-stone-500 leading-relaxed">
            Las personas que completan al menos un curso de su plan de aprendizaje tienen 3 veces mas
            probabilidades de conseguir una entrevista. El primer paso es el que mas te acerca.
          </p>
        </div>
      </motion.div>
    </section>
  </main>
);
```

#### 7. Resumen de la logica de areas

El usuario se registra con `interest_areas: ["frontend", "backend"]`. El backend filtra vacantes que requieran esos skills y devuelve 3 `JobMatchDetail`. Si las 3 vacantes son todas del area `"fullstack"`, el label del hero DEBE decir "Full Stack" (no "Frontend y Backend").

Para lograr esto:
```typescript
const matchedAreas = [...new Set(jobs.map((j) => j.area))];
const areaLabel = formatInterests(matchedAreas);
```

El `new Set(...)` elimina duplicados. Si las 3 vacantes tienen `area: "fullstack"`, `matchedAreas` es `["fullstack"]` y `formatInterests` devuelve `"Full Stack"`.

### Verificacion completa

```bash
cd frontend
npx tsc --noEmit
# Esperado: 0 errores
npm run dev
# Abri http://localhost:5173/orientation (necesitas estar logueado)
```

**Pruebas manuales:**

| Escenario | Que esperar |
|-----------|------------|
| Entrar a /orientation sin backend | Si los mocks de 15 estan bien, ves 3 cards con datos mock |
| Entrar a /orientation con backend | Ves 3 cards con datos reales del endpoint |
| Estado de carga | Ves el spinner con "Buscando las mejores oportunidades..." |
| Error de red | Ves el mensaje de error con boton "Reintentar" |
| 0 vacantes (sin matches) | Ves "No encontramos vacantes en tus areas de interes" |
| Hero section | Muestra el nombre del usuario y las areas DERIVADAS de las vacantes reales |
| Stats pill | Muestra "3 oportunidades en Full Stack" (derivado, no desde intereses) |
| Footer | Muestra el mensaje motivacional con la estadistica de 3x |

### Errores que te vas a encontrar

| Error | Causa | Solucion |
|-------|-------|----------|
| `Property 'interest_areas' does not exist on type 'User'` | El `User` type no tiene ese campo | Verifica que la incidencia 09/10 este mergeada (agrego `interest_areas` al modelo) |
| `Cannot find module '../../components/orientation/OrientationJobCard'` | La incidencia 17 no esta mergeada | Asegurate de que 17 este en main antes de arrancar |
| La pagina hace loop infinito de fetchs | `useEffect` se dispara en cada render | Agrega `!data` a la condicion del `if` dentro del efecto |
| `areaLabel` muestra areas incorrectas | Estas usando `user.interest_areas` en vez de derivar de `jobs` | Usa `[...new Set(jobs.map(j => j.area))]` |
| El boton "Reintentar" no hace nada | `fetchAnalysis` no esta en el scope del error state | El error state tambien tiene acceso a `fetchAnalysis` via el store |

### Criterios de aceptacion Incidencia 18

- [ ] La pagina carga y muestra el hero con nombre del usuario y titulo "encontramos estas vacantes para vos"
- [ ] La etiqueta de areas en el hero se deriva de `jobs[].area`, no de `user.interest_areas`
- [ ] Muestra hasta 3 `OrientationJobCard` con datos reales del endpoint
- [ ] La seccion de cards tiene el header "Recomendaciones para tu perfil"
- [ ] Estados de loading, error, empty (0 vacantes) y success funcionan correctamente
- [ ] El footer motivacional aparece al final
- [ ] La pagina usa fondo `bg-[#FDFBF7]` (nunca blanco puro)
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(orientar): redisenar pagina de orientacion con nuevo endpoint`
