## INCIDENCIA INT-06 — Dashboard Conectado a `/salud` y `/orientar`

## Resumen

Esta incidencia reemplaza los mocks del Dashboard con datos reales del backend. Conecta el selector de mood (7 emojis) al endpoint `POST /salud`, elimina `mockSaludResponses` y `mockOrientarResponses`, muestra la respuesta real de la IA después del check-in, conecta la barra de progreso profesional al endpoint `POST /orientar`, y reemplaza el nombre hardcodeado "Ana" por el `full_name` del usuario autenticado. También agrega un selector de nota semanal (1-10) que actualmente no existe en el dashboard.

**Rama:** `incidencia/int-06-dashboard`  
**Duración estimada:** 4-5 horas.  
**Depende de:** INT-04 (auth store con `user`) + INT-05 (salud y orientar stores).  
**Asignada a:** 1 dev frontend.

### ¿Qué vas a aprender?

| Concepto | ¿Qué es? |
|----------|---------|
| Composición de stores | Usar `useAuthStore`, `useSaludStore` y `useOrientarStore` en un mismo componente |
| `useEffect` para carga inicial | Disparar `fetchAnalysis` al montar la página |
| Mapeo de moods frontend → backend | `feliz` → `Mood.HAPPY`, `estresado` → `Mood.STRESSED`, etc. |
| Estado local + store global | `selectedMood` es local (solo para este componente). El resultado de la API va al store global. |

### Pre-lectura (15 min)

| Archivo | Pregunta que responde |
|---------|----------------------|
| `frontend/src/store/useAuthStore.ts` | ¿Cómo obtengo el usuario? `useAuthStore((s) => s.user)` |
| `frontend/src/store/useSaludStore.ts` | ¿Cómo envío un check-in? `sendCheckin({ humor, nota_semanal, contexto })` |
| `frontend/src/store/useOrientarStore.ts` | ¿Cómo obtengo el análisis? `fetchAnalysis({ perfil, nivel, region, ... })` |
| `frontend/src/types/api.ts` | `Mood` enum: `HAPPY`, `TIRED`, `SAD`, `ANXIOUS`, `OVERWHELMED`, `STRESSED`, `ANGRY`, `DEPRESSED` |
| `frontend/src/modules/dashboard/dashboardPage.tsx` | Código actual que usa mocks |

### Antes de codear: flujo git

```bash
git checkout incidencia/int-05-services-frontend
git pull origin incidencia/int-05-services-frontend
git checkout -b incidencia/int-06-dashboard
```

### Paso a paso

#### Archivo único: `frontend/src/modules/dashboard/dashboardPage.tsx`

El cambio es grande. Vas a reescribir las partes que usan mocks. Estructura del nuevo archivo:

```typescript
import React, { useState, useEffect } from "react";
import {
  ArrowRight, Sparkles, Smile, Brain, Lightbulb,
  TrendingUp, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSaludStore } from "../../store/useSaludStore";
import { useOrientarStore } from "../../store/useOrientarStore";
import { Mood } from "../../types/api";

// ... (interfaz MoodOption se mantiene igual)

export const DashboardPage: React.FC = () => {
  // ─── Auth ───
  const user = useAuthStore((s) => s.user);

  // ─── Salud ───
  const {
    currentResponse: aiResponse,
    isLoading: isSaludLoading,
    error: saludError,
    sendCheckin,
  } = useSaludStore();

  // ─── Orientar ───
  const {
    data: orientarData,
    isLoading: isOrientarLoading,
    fetchAnalysis,
  } = useOrientarStore();

  // ─── Estado local ───
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [weeklyScore, setWeeklyScore] = useState<number>(7);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // ─── Cargar análisis al montar ───
  useEffect(() => {
    if (user) {
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

  // ─── Mapeo de moods del frontend al backend ───
  const moodToApi: Record<string, string> = {
    feliz: Mood.HAPPY,
    cansado: Mood.TIRED,
    triste: Mood.SAD,
    ansioso: Mood.ANXIOUS,
    estresado: Mood.STRESSED,
    enojado: Mood.ANGRY,
    deprimido: Mood.DEPRESSED,
  };

  const moods: MoodOption[] = [
    { id: "feliz", label: "Feliz", emoji: "😊", bgClass: "hover:bg-yellow-50" },
    { id: "cansado", label: "Cansado", emoji: "🥱", bgClass: "hover:bg-amber-50" },
    { id: "triste", label: "Triste", emoji: "😢", bgClass: "hover:bg-blue-50" },
    { id: "ansioso", label: "Ansioso", emoji: "😰", bgClass: "hover:bg-indigo-50" },
    { id: "estresado", label: "Estresado", emoji: "🤯", bgClass: "hover:bg-orange-50" },
    { id: "enojado", label: "Enojado", emoji: "😡", bgClass: "hover:bg-red-50" },
    { id: "deprimido", label: "Deprimido", emoji: "😔", bgClass: "hover:bg-purple-50" },
  ];

  // ─── Enviar check-in ───
  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    const apiMood = moodToApi[selectedMood] || Mood.HAPPY;

    await sendCheckin({
      humor: apiMood as Mood,
      nota_semanal: weeklyScore,
      contexto: null,
    });

    setIsSubmitted(true);
  };

  // ─── Render ───
  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-8">

        {/* ================= SALUDO DE BIENVENIDA (DINÁMICO) ================= */}
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#A04E2D] tracking-tight">
            ¡Hola de nuevo{user ? `, ${user.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Es un buen día para seguir creciendo profesionalmente.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* ================= TARJETA IZQUIERDA: CONTROL DE ÁNIMO ================= */}
          <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#A04E2D]" />
                <h2 className="font-bold text-lg text-gray-900 tracking-tight">¿Cómo estás hoy?</h2>
              </div>

              {/* Grid de moods (se mantiene igual) */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {moods.map((mood) => {
                  const isCurrent = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => !isSubmitted && setSelectedMood(mood.id)}
                      disabled={isSubmitted}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all group ${
                        isCurrent
                          ? "border-[#A04E2D] bg-[#FAF4EE] shadow-xs scale-105"
                          : "border-gray-100 bg-white " + mood.bgClass
                      } ${isSubmitted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="text-3xl md:text-4xl transition-transform group-hover:scale-110">
                        {mood.emoji}
                      </span>
                      <span className={`text-xs font-bold tracking-tight ${isCurrent ? "text-[#A04E2D]" : "text-gray-500"}`}>
                        {mood.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* NUEVO: Selector de nota semanal */}
              {selectedMood && !isSubmitted && (
                <div className="pt-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    ¿Cómo calificás tu semana? (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={weeklyScore}
                    onChange={(e) => setWeeklyScore(Number(e.target.value))}
                    className="w-full accent-[#A04E2D]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 font-bold">
                    <span>1</span>
                    <span className="text-[#A04E2D] font-extrabold text-sm">{weeklyScore}</span>
                    <span>10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de submit */}
            <div className="pt-4">
              {!isSubmitted ? (
                <button
                  onClick={handleMoodSubmit}
                  disabled={!selectedMood || isSaludLoading}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
                    selectedMood && !isSaludLoading
                      ? "bg-[#A04E2D] hover:bg-[#853F22] text-white cursor-pointer active:scale-[0.99]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70"
                  }`}
                >
                  {isSaludLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analizar mi estado con IA
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-700 font-bold text-sm bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                  Estado registrado exitosamente
                </div>
              )}
            </div>
          </article>

          {/* ================= TARJETA DERECHA: PROGRESO DEL CAMINO ================= */}
          <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[400px]">
            {isOrientarLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#A04E2D]" />
              </div>
            ) : orientarData ? (
              <>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="font-extrabold text-lg md:text-xl text-gray-900 tracking-tight max-w-[200px]">
                      Tu camino hacia el éxito
                    </h2>
                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Cumples el{" "}
                    <span className="font-extrabold text-emerald-700">
                      {Math.round(orientarData.gap_porcentual)}%
                    </span>{" "}
                    de los requisitos para{" "}
                    <span className="font-bold text-gray-900">{user?.tech_area || "tu área"}</span>.
                  </p>

                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#6B8471] h-full rounded-full transition-all duration-500"
                      style={{ width: `${orientarData.gap_porcentual}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                No se pudo cargar el análisis.
              </div>
            )}

            <div className="pt-6">
              <button className="w-full py-3 bg-[#A04E2D] hover:bg-[#853F22] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group">
                Ver hoja de ruta completa
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        </section>

        {/* ================= FRASE INSPIRADORA (se mantiene) ================= */}
        {!isSubmitted && (
          <div className="bg-[#F3F6F3] rounded-xl border border-emerald-100/50 p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2 bg-white rounded-lg text-emerald-800 shadow-2xs">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="text-xs md:text-sm text-emerald-950 font-medium italic leading-snug">
              "Pequeños pasos hoy construyen grandes futuros mañana. Tu constancia es tu mayor superpoder."
            </p>
          </div>
        )}

        {/* ================= RESPUESTA DE LA IA (AHORA CON DATOS REALES) ================= */}
        {isSubmitted && aiResponse && (
          <section className="bg-[#A04E2D]/5 rounded-2xl border border-[#A04E2D]/10 p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#853F22]">
              <Brain className="w-5 h-5" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                Análisis y Recomendación de AppBiT IA
              </h3>
            </div>

            <div className="space-y-3">
              <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
                {aiResponse.mensaje}
              </p>

              {/* NUEVO: Alerta de crisis si derivar_cvv es true */}
              {aiResponse.derivar_cvv && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-extrabold tracking-wider text-red-600 uppercase block">
                    ⚠️ Alerta de Bienestar
                  </span>
                  <p className="text-sm text-red-800 font-semibold">
                    CVV — Centro de Valorización de la Vida: llama al 188 (24h, gratuito, confidencial).
                  </p>
                </div>
              )}

              <div className="bg-white/80 backdrop-blur-xs border border-orange-100/60 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-extrabold tracking-wider text-[#A04E2D] uppercase block">
                  Acción sugerida para tu día
                </span>
                <p className="text-xs md:text-sm text-gray-700 font-semibold leading-normal">
                  {aiResponse.accion_sugerida}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Error de salud */}
        {saludError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
            {saludError}
          </div>
        )}
      </div>
    </main>
  );
};
```

**Cambios clave respecto al original:**
1. **Eliminados:** imports de `mockSaludResponses` y `mockOrientarResponses`, `handleMoodSubmit` con `responseIndex`, `orientarData = mockOrientarResponses[0]`.
2. **Nuevo:** `useAuthStore` para `user.full_name`, `useSaludStore` para check-in, `useOrientarStore` para gap, `useEffect` para carga inicial, `weeklyScore` slider.
3. **Nuevo:** `moodToApi` — mapea los IDs en español del frontend a los valores del enum `Mood`.
4. **Nuevo:** alerta visual cuando `aiResponse.derivar_cvv === true`.

### Verificación

Con backend corriendo y un usuario logueado:

**A) Check-in feliz:**
1. Seleccionar 😊 Feliz, score 8
2. Click "Analizar mi estado con IA"
3. **Esperado:** Spinner mientras carga. Respuesta de IA abajo. `derivar_cvv: false`.

**B) Check-in crisis:**
1. Seleccionar 😔 Deprimido, score 2
2. Click "Analizar mi estado con IA"
3. **Esperado:** Alerta roja de CVV visible. `derivar_cvv: true`.

**C) Barra de progreso:**
1. Al cargar la página, la barra muestra `gap_porcentual` del endpoint `/orientar`
2. El porcentaje coincide con el `professional_level` del usuario

**D) Nombre dinámico:**
1. El header muestra "¡Hola de nuevo, [nombre]!" con el nombre real del usuario

### Errores que te vas a encontrar

| Error | Causa | Solución |
|-------|-------|----------|
| `useAuthStore(...).user is null` al cargar | `fetchMe` todavía no terminó | El `useEffect` de `fetchAnalysis` se dispara cuando `user` cambia. Si es null, no se ejecuta. |
| `TypeError: orientarData.gap_porcentual is undefined` | `fetchAnalysis` falló o no se llamó | Verificá que `user` no sea null al llamar `fetchAnalysis`. Agregá `if (user)` en el `useEffect`. |
| 401 en `/salud` o `/orientar` | Token no se está enviando | El interceptor de axios lo agrega automáticamente. Verificá que `localStorage` tenga `token`. |
| 422 en `/salud` | `humor` no es un valor válido del enum `Mood` | Usá `moodToApi` para convertir. Los valores deben ser: `happy`, `tired`, `sad`, `anxious`, `overwhelmed`, `stressed`, `angry`, `depressed`. |

### Criterios de aceptación INT-06

- [ ] Selector de 7 moods envía el valor correcto al backend (inglés, no español)
- [ ] Slider de nota semanal (1-10) visible al seleccionar un mood
- [ ] `POST /salud` se llama con `humor`, `nota_semanal` (sin `usuario_id`)
- [ ] Respuesta de IA se muestra después del check-in (reemplaza el mock)
- [ ] Alerta de crisis (CVV) visible cuando `derivar_cvv === true`
- [ ] Barra de progreso usa `gap_porcentual` real de `/orientar`
- [ ] Header muestra `full_name` del usuario autenticado
- [ ] Estados de carga: spinner en botón de check-in y en tarjeta de progreso
- [ ] Estados de error: mensaje visible si `/salud` falla
- [ ] Eliminados todos los imports de `../../mocks`
- [ ] `npx tsc --noEmit` compila sin errores
- [ ] Commit con: `feat(dashboard): conectar check-in y progreso a API real`

---
