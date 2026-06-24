import React, { useState, useEffect } from "react";
import {
  ArrowRight, Sparkles, Smile, Brain, Lightbulb,
  TrendingUp, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSaludStore } from "../../store/useSaludStore";
import { useOrientarStore } from "../../store/useOrientarStore";
import { Mood } from "../../types/api";

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  bgClass: string;
}

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const {
    currentResponse: aiResponse,
    isLoading: isSaludLoading,
    error: saludError,
    sendCheckin,
  } = useSaludStore();
  const {
    data: orientarData,
    isLoading: isOrientarLoading,
    fetchAnalysis,
  } = useOrientarStore();

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [weeklyScore, setWeeklyScore] = useState<number>(7);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

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

  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#A04E2D] tracking-tight">
            ¡Hola de nuevo{user ? `, ${user.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">
            Es un buen día para seguir creciendo profesionalmente.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* TARJETA IZQUIERDA: CONTROL DE ÁNIMO */}
          <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#A04E2D]" />
                <h2 className="font-bold text-lg text-gray-900 tracking-tight">¿Cómo estás hoy?</h2>
              </div>

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
                      <span className="text-3xl md:text-4xl transition-transform group-hover:scale-110">{mood.emoji}</span>
                      <span className={`text-xs font-bold tracking-tight ${isCurrent ? "text-[#A04E2D]" : "text-gray-500"}`}>{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedMood && !isSubmitted && (
                <div className="pt-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700">¿Cómo calificás tu semana? (1-10)</label>
                  <input type="range" min="1" max="10" value={weeklyScore} onChange={(e) => setWeeklyScore(Number(e.target.value))} className="w-full accent-[#A04E2D]" />
                  <div className="flex justify-between text-xs text-gray-400 font-bold">
                    <span>1</span>
                    <span className="text-[#A04E2D] font-extrabold text-sm">{weeklyScore}</span>
                    <span>10</span>
                  </div>
                </div>
              )}
            </div>

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
                    <><Loader2 className="w-4 h-4 animate-spin" />Analizando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" />Analizar mi estado con IA</>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-700 font-bold text-sm bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />Estado registrado exitosamente
                </div>
              )}
            </div>
          </article>

          {/* TARJETA DERECHA: PROGRESO */}
          <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[400px]">
            {isOrientarLoading ? (
              <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#A04E2D]" /></div>
            ) : orientarData ? (
              <>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="font-extrabold text-lg md:text-xl text-gray-900 tracking-tight max-w-[200px]">Tu camino hacia el éxito</h2>
                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Cumples el <span className="font-extrabold text-emerald-700">{Math.round(orientarData.gap_porcentual)}%</span> de los requisitos para <span className="font-bold text-gray-900">{user?.tech_area || "tu área"}</span>.
                  </p>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#6B8471] h-full rounded-full transition-all duration-500" style={{ width: `${orientarData.gap_porcentual}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No se pudo cargar el análisis.</div>
            )}
            <div className="pt-6">
              <button className="w-full py-3 bg-[#A04E2D] hover:bg-[#853F22] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group">
                Ver hoja de ruta completa<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        </section>

        {!isSubmitted && (
          <div className="bg-[#F3F6F3] rounded-xl border border-emerald-100/50 p-4 flex items-center gap-3 shadow-xs">
            <div className="p-2 bg-white rounded-lg text-emerald-800 shadow-2xs"><Lightbulb className="w-4 h-4" /></div>
            <p className="text-xs md:text-sm text-emerald-950 font-medium italic leading-snug">"Pequeños pasos hoy construyen grandes futuros mañana. Tu constancia es tu mayor superpoder."</p>
          </div>
        )}

        {isSubmitted && aiResponse && (
          <section className="bg-[#A04E2D]/5 rounded-2xl border border-[#A04E2D]/10 p-6 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-[#853F22]">
              <Brain className="w-5 h-5" />
              <h3 className="font-extrabold text-base md:text-lg tracking-tight">Análisis y Recomendación de AppBiT IA</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">{aiResponse.mensaje}</p>
              {aiResponse.derivar_cvv && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
                  <span className="text-xs font-extrabold tracking-wider text-red-600 uppercase block">⚠️ Alerta de Bienestar</span>
                  <p className="text-sm text-red-800 font-semibold">CVV — Centro de Valorización de la Vida: llama al 188 (24h, gratuito, confidencial).</p>
                </div>
              )}
              <div className="bg-white/80 backdrop-blur-xs border border-orange-100/60 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] font-extrabold tracking-wider text-[#A04E2D] uppercase block">Acción sugerida para tu día</span>
                <p className="text-xs md:text-sm text-gray-700 font-semibold leading-normal">{aiResponse.accion_sugerida}</p>
              </div>
            </div>
          </section>
        )}

        {saludError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">{saludError}</div>
        )}
      </div>
    </main>
  );
};
