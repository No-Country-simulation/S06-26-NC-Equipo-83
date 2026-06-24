## INCIDENCIA INT-07 — Páginas de Orientación y Salud Mental Conectadas

## Resumen

Esta incidencia conecta las dos páginas restantes del área de bienestar y crecimiento profesional con el backend real. La página de Orientación reemplaza `mockOrientarResponses` con datos del endpoint `POST /orientar`, mostrando el gap real, la trayectoria sugerida y las vacantes compatibles dinámicamente. La página de Salud Mental reemplaza `mockSaludResponses` con el último check-in del store o con una llamada directa a la API, y conecta el botón de crisis para que realice un check-in de emergencia con nota 1.

**Rama:** `incidencia/int-07-orientacion-salud`  
**Duración estimada:** 4-5 horas.  
**Depende de:** INT-05 (salud y orientar stores).  
**Asignada a:** 1 dev frontend.

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/store/useOrientarStore.ts` | `data.gap_porcentual`, `data.gap_items`, `data.trayectoria_sugerida`, `data.vacantes_compatibles` |
| `frontend/src/store/useSaludStore.ts` | `currentResponse` — último check-in. `sendCheckin()` — para botón de crisis. |
| `frontend/src/store/useAuthStore.ts` | `user` — para obtener `tech_area`, `professional_level` y pasarlos al análisis. |
| `frontend/src/modules/orientation/orientationPage.tsx` | Código actual con `mockOrientarResponses[0]` |
| `frontend/src/modules/mental-health/mentalHealthPage.tsx` | Código actual con `mockSaludResponses[0]` |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-05-services-frontend
git pull origin incidencia/int-05-services-frontend
git checkout -b incidencia/int-07-orientacion-salud
```

### Paso a paso

#### Archivo 1: `frontend/src/modules/orientation/orientationPage.tsx`

**Cambios:**
1. Eliminar `import { mockOrientarResponses } from '../../mocks/orientar'`
2. Importar `useOrientarStore` y `useAuthStore`
3. Reemplazar `const data = mockOrientarResponses[0]` por `const data = useOrientarStore((s) => s.data)`
4. Agregar `useEffect` para cargar el análisis al montar
5. Agregar loading state (spinner) mientras `data` es null
6. Agregar error state si falla

```typescript
import React, { useEffect } from "react";
import {
  ArrowRight, Clock, Briefcase, GraduationCap,
  Building2, SlidersHorizontal, Loader2, AlertCircle,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";

export const OrientationPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const {
    data,
    isLoading,
    error,
    fetchAnalysis,
  } = useOrientarStore();

  // Cargar análisis al montar
  useEffect(() => {
    if (user && !data) {
      fetchAnalysis({
        perfil: user.tech_area || "frontend",
        nivel: user.professional_level,
        region: user.country || "LATAM",
        idioma: "es",
        lat: 0,
        lng: 0,
      });
    }
  }, [user]);

  // ─── Loading ───
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#A04E2D] mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Analizando tu perfil profesional...</p>
        </div>
      </main>
    );
  }

  // ─── Error ───
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm text-red-600 font-medium">
            {error || "No se pudo cargar el análisis. Intentá de nuevo más tarde."}
          </p>
          <button
            onClick={() => fetchAnalysis({
              perfil: user?.tech_area || "frontend",
              nivel: user?.professional_level || "junior",
              region: "LATAM",
              idioma: "es",
              lat: 0,
              lng: 0,
            })}
            className="px-4 py-2 bg-[#A04E2D] text-white font-semibold text-sm rounded-xl"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  // ─── Función auxiliar para parsear cursos (se mantiene igual) ───
  const getCourseDetails = (courseString: string) => {
    if (courseString.includes("Google Cloud") || courseString.includes("GEAR")) {
      return { title: courseString, duration: "12-18 horas", category: "Cloud", bg: "bg-orange-200/40" };
    }
    if (courseString.includes("Oracle") || courseString.includes("ONE")) {
      return { title: courseString, duration: "20-40 horas", category: "Formación", bg: "bg-yellow-700/20" };
    }
    return { title: courseString, duration: "Variable", category: "General", bg: "bg-emerald-200/40" };
  };

  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-8 md:space-y-12">

        {/* ================= BANNER DE PORCENTAJE ================= */}
        <section className="bg-[#853F22]/5 rounded-2xl border border-[#853F22]/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Gráfico circular */}
          <div className="relative flex-shrink-0 w-32 h-32 md:w-36 md:h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" className="stroke-gray-200 fill-none" strokeWidth="10" />
              <circle
                cx="50%" cy="50%" r="42%" className="stroke-[#A04E2D] fill-none" strokeWidth="12"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * Math.round(data.gap_porcentual)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl md:text-3xl font-bold text-gray-800">
              {Math.round(data.gap_porcentual)}%
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 leading-tight">
              Cumples el {Math.round(data.gap_porcentual)}% de los requisitos para {user?.tech_area || "tu área"}
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[680px]">
              Tu perfil está en camino. Te recomendamos enfocarte en las habilidades restantes para aumentar tu visibilidad.
            </p>

            {/* Gap items dinámicos */}
            <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
              {data.gap_items.slice(0, 2).map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-100/70 text-emerald-800 font-medium text-xs rounded-full border border-emerald-200/40">
                  {item.length > 30 ? item.slice(0, 30) + "..." : item}
                </span>
              ))}
              {data.gap_items.length > 2 && (
                <span className="px-3 py-1 bg-gray-200/60 text-gray-600 font-medium text-xs rounded-full italic">
                  +{data.gap_items.length - 2} brechas detectadas
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ================= TRAYECTORIA SUGERIDA ================= */}
        <section className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              Cierra la brecha del {Math.round(100 - data.gap_porcentual)}%
            </h2>
            <button className="flex items-center gap-1 text-xs md:text-sm font-semibold text-[#A04E2D] hover:text-[#853F22] transition-colors group">
              Ver todos los cursos
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {data.trayectoria_sugerida.slice(0, 3).map((item, idx) => {
              const details = getCourseDetails(item);
              return (
                <article key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
                  <div className={`h-40 ${details.bg} relative flex items-center justify-center p-4`}>
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-wide text-gray-600 rounded-md shadow-sm">
                      {details.category}
                    </span>
                    <GraduationCap className="w-12 h-12 text-[#A04E2D]/40" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 leading-snug">
                        {details.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{details.duration}</span>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-[#A04E2D] hover:bg-[#853F22] text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-sm">
                      Empezar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ================= VACANTES COMPATIBLES ================= */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              Oportunidades compatibles
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="font-medium">Filtrar por:</span>
              <button className="flex items-center gap-1 px-2.5 py-1 bg-gray-200/60 font-semibold text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                Relevancia
                <SlidersHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>

          {data.vacantes_compatibles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              No hay vacantes disponibles para tu área en este momento.
            </div>
          ) : (
            <div className="space-y-3">
              {data.vacantes_compatibles.map((vacante) => (
                <article key={vacante.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-50 text-emerald-700">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm md:text-base text-gray-800 leading-tight">
                        {vacante.title}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500">
                        {vacante.company} • <span className="font-medium text-gray-400">Remoto</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 font-bold text-[10px] rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100">
                          {vacante.match_percentage}% de Match
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200/40 font-bold text-[10px] rounded-md">
                          Full-time
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 sm:text-right order-1">
                      Consultar salario
                    </span>
                    <button className="px-6 py-2 bg-[#3A5343] hover:bg-[#2C3F33] text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-sm order-2 sm:order-2">
                      Postular
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
};
```

#### Archivo 2: `frontend/src/modules/mental-health/mentalHealthPage.tsx`

**Cambios:**
1. Eliminar `import { mockSaludResponses } from '../../mocks/salud'`
2. Importar `useSaludStore`
3. Reemplazar `const saludData = mockSaludResponses[0]` por `const saludData = useSaludStore((s) => s.currentResponse)`
4. Conectar botón "Botón de Crisis" a `sendCheckin` con nota 1 (dispara protocolo CVV)
5. Mensaje de bienvenida usa datos reales del último check-in, o un texto por defecto

```typescript
import React, { useState } from "react";
import {
  Play, ArrowRight, HeartHandshake, BookOpen,
  Navigation, Loader2,
} from "lucide-react";
import { useSaludStore } from "../../store/useSaludStore";
import { Mood } from "../../types/api";

// ... (interfaz DayMood se mantiene igual)

export const MentalHealthPage: React.FC = () => {
  const {
    currentResponse: saludData,
    isLoading,
    sendCheckin,
  } = useSaludStore();

  const [crisisSent, setCrisisSent] = useState(false);
  const [viewMode, setViewMode] = useState<"semana" | "mes">("semana");

  // ─── Botón de Crisis ───
  const handleCrisis = async () => {
    await sendCheckin({
      humor: Mood.SAD,
      nota_semanal: 1,
      contexto: "Botón de crisis activado por el usuario",
    });
    setCrisisSent(true);
  };

  // ─── Datos del historial semanal (mock visual, el historial real requiere endpoint nuevo) ───
  const weekMoods: DayMood[] = [
    { day: "Lun", emoji: "😊", label: "Feliz" },
    { day: "Mar", emoji: "😡", label: "Enojado", isActive: true },
    { day: "Mié", emoji: "😀", label: "Alegre" },
    { day: "Jue", emoji: "🙂", label: "Neutral" },
    { day: "Vie", emoji: "😰", label: "Ansioso" },
    { day: "Sáb", emoji: "😀", label: "Alegre" },
    { day: "Dom", emoji: "😇", label: "Calmado" },
  ];

  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-10">

        {/* ================= CABECERA ================= */}
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#A04E2D] tracking-tight">
            Tu Bienestar Mental
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-[720px]">
            {saludData?.mensaje ||
              "Este es un espacio seguro diseñado para escucharte y apoyarte. Tómate un momento para respirar, registrar cómo te sientes y explorar recursos creados especialmente para ti."
            }
          </p>
        </header>

        {/* ================= HISTORIAL + CRISIS ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Historial de Ánimo (se mantiene el mock visual) */}
          <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm md:col-span-2 flex flex-col justify-between space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                Historial de Ánimo
              </h2>
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold text-gray-500">
                <button
                  onClick={() => setViewMode("semana")}
                  className={`px-3 py-1 rounded-md transition-all ${viewMode === "semana" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800"}`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setViewMode("mes")}
                  className={`px-3 py-1 rounded-md transition-all ${viewMode === "mes" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800"}`}
                >
                  Mes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-4">
              {weekMoods.map((mood, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all ${
                    mood.isActive
                      ? "bg-orange-50 border-2 border-[#A04E2D]/80 scale-110 shadow-sm"
                      : "bg-gray-50/50 hover:bg-gray-100/70 cursor-pointer"
                  }`}>
                    {mood.emoji}
                  </div>
                  <span className={`text-xs font-bold ${mood.isActive ? "text-[#A04E2D]" : "text-gray-400"}`}>
                    {mood.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta de Apoyo en Crisis */}
          <div className="bg-[#853F22]/5 rounded-2xl border border-[#853F22]/10 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#A04E2D]">
                <HeartHandshake className="w-5 h-5 flex-shrink-0" />
                <h2 className="font-bold text-lg text-[#853F22] tracking-tight">
                  Apoyo en Crisis
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#A04E2D] font-medium leading-relaxed">
                Si te sentís abrumado o necesitás hablar con alguien de inmediato, estamos acá. Este es un espacio seguro y confidencial.
              </p>
            </div>

            <div className="space-y-3">
              {crisisSent && saludData?.derivar_cvv ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold">
                  ✅ Derivación activada. CVV: llamá al 188 (24h, gratuito, confidencial).
                </div>
              ) : (
                <button
                  onClick={handleCrisis}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#A04E2D] hover:bg-[#853F22] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <HeartHandshake className="w-4 h-4" />
                  )}
                  {isLoading ? "Procesando..." : "Botón de Crisis"}
                </button>
              )}
              <p className="text-[11px] text-center font-bold text-gray-400 tracking-wide">
                Referencia automática a CVV 24/7
              </p>
            </div>
          </div>
        </section>

        {/* ================= SUGERENCIAS DE BIENESTAR ================= */}
        <section className="space-y-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Sugerencias de Bienestar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Tarjeta 1: Podcast (estática) */}
            <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 bg-gradient-to-br from-amber-900/30 to-amber-950/70 relative flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#A04E2D] shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#A04E2D] uppercase block">
                    El Podcast de Hoy
                  </span>
                  <h3 className="font-extrabold text-base md:text-lg text-gray-900 leading-tight">
                    Navegando la Ansiedad
                  </h3>
                  <p className="text-xs font-bold text-gray-400 pt-0.5">
                    12 min • Dra. Sofia Ruiz
                  </p>
                </div>
              </div>
            </article>

            {/* Tarjeta 2: Lectura Recomendada (usa acción sugerida del último check-in) */}
            <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase block">
                  Lectura Recomendada
                </span>
                <h3 className="font-extrabold text-lg md:text-xl text-gray-900 leading-tight">
                  {saludData?.accion_sugerida?.includes("Buenas Ideas")
                    ? "De Dónde Vienen las Buenas Ideas"
                    : "El Poder del Presente"}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                  Un extracto sobre cómo la atención plena puede transformar tu rutina diaria.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                <span className="text-gray-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> 5 min de lectura
                </span>
                <button className="text-[#A04E2D] hover:text-[#853F22] flex items-center gap-1 transition-colors group">
                  Leer ahora
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </article>

            {/* Tarjeta 3: Caminata Consciente (estática) */}
            <article className="bg-[#F3F6F3] rounded-2xl border border-emerald-100/50 p-5 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-colors space-y-8">
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-800/80 uppercase block">
                    Caminata Consciente
                  </span>
                  <Navigation className="w-5 h-5 text-emerald-800 rotate-45" />
                </div>
                <h3 className="font-extrabold text-lg md:text-xl text-emerald-950 tracking-tight pt-1">
                  Ruta en la Naturaleza
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-emerald-900/10 pb-4">
                  <div>
                    <span className="block font-extrabold text-sm text-emerald-950">2.4 km</span>
                    <span className="text-[10px] font-bold text-emerald-800/60 uppercase">Distancia ideal</span>
                  </div>
                  <div className="border-l border-emerald-900/10 pl-4">
                    <span className="block font-extrabold text-sm text-emerald-950">30 min</span>
                    <span className="text-[10px] font-bold text-emerald-800/60 uppercase">Tiempo estimado</span>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-white border border-emerald-800/20 hover:bg-emerald-50 text-emerald-900 font-bold text-xs md:text-sm rounded-xl transition-all shadow-xs text-center">
                  Ver mapa de ruta
                </button>
              </div>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
};
```

### Verificación

**Orientación:**
1. Navegar a `/orientation`
2. **Esperado:** Spinner mientras carga. Luego: gap circular, trayectoria con cursos, vacantes listadas. Todo con datos reales del backend.

**Salud Mental:**
1. Navegar a `/mental-health`
2. **Esperado:** Si hay un check-in previo, el mensaje de bienvenida muestra la respuesta de la IA.
3. Click en "Botón de Crisis"
4. **Esperado:** Spinner. Luego: confirmación de derivación CVV.

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `data is null` en Orientación | `fetchAnalysis` no se llamó o falló | Verificá que `user` no sea null. Agregá `if (user && !data)` en el `useEffect`. |
| 401 al cargar Orientación | Token expirado durante la navegación | El interceptor de axios debería redirigir al login. |
| `vacantes_compatibles` es `undefined` | El backend no devuelve el campo o la respuesta es 422 | Verificá Swagger. `POST /orientar` debe devolver `vacantes_compatibles` como lista. |
| El botón de crisis no hace nada | `sendCheckin` no se está llamando | Verificá que `useSaludStore` esté importado correctamente. |

### Criterios de aceptación INT-07

- [ ] Página de Orientación carga datos reales desde `POST /orientar`
- [ ] Gap porcentual, gap items, trayectoria y vacantes son dinámicos
- [ ] Loading spinner visible mientras carga
- [ ] Mensaje de error + botón "Reintentar" si falla
- [ ] Página de Salud Mental usa `currentResponse` del store (último check-in)
- [ ] Botón de Crisis envía `POST /salud` con nota 1 (activa protocolo CVV)
- [ ] Confirmación visual post-crisis (mensaje CVV)
- [ ] Eliminados todos los imports de `../../mocks` en ambas páginas
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(pages): conectar orientacion y salud mental a API real`

---

## 🔄 Actualizaciones durante la integración real

### Orientación: botón "Ver todos los cursos" eliminado

El spec incluía un botón "Ver todos los cursos" con ícono `ArrowRight` en el header de la sección de trayectoria. Durante la implementación se eliminó. La sección de trayectoria existe pero sin ese link.

### Orientación: simplificación visual

Se eliminaron algunos efectos hover y gradientes decorativos del spec original. Las cards de cursos mantienen el diseño base pero con menos ornamentación.

### Salud Mental: ajustes en cards

- **Podcast card:** eliminado `hover:shadow-md` y reducción de padding.
- **Caminata card:** layout compactado para los datos de distancia/tiempo.

### Ambas páginas pasaron por el commit de corrección de errores

**Commit `c4d5e90`** ("fix: correccion de errores y enrutamiento listo") modificó ambas páginas con ajustes menores de layout para consistencia con el resto de la app.

---
