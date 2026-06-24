import React, { useState } from "react";
import { Play, ArrowRight, HeartHandshake, BookOpen, Navigation, Loader2 } from "lucide-react";
import { useSaludStore } from "../../store/useSaludStore";
import { Mood } from "../../types/api";

interface DayMood {
  day: string;
  emoji: string;
  label: string;
  isActive?: boolean;
}

export const MentalHealthPage: React.FC = () => {
  const { currentResponse: saludData, isLoading, sendCheckin } = useSaludStore();
  const [crisisSent, setCrisisSent] = useState(false);
  const [viewMode, setViewMode] = useState<"semana" | "mes">("semana");

  const handleCrisis = async () => {
    await sendCheckin({ humor: Mood.SAD, nota_semanal: 1, contexto: "Botón de crisis activado por el usuario" });
    setCrisisSent(true);
  };

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
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#A04E2D] tracking-tight">Tu Bienestar Mental</h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-[720px]">
            {saludData?.mensaje || "Este es un espacio seguro diseñado para escucharte y apoyarte. Tómate un momento para respirar, registrar cómo te sientes y explorar recursos creados especialmente para ti."}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-sm md:col-span-2 flex flex-col justify-between space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Historial de Ánimo</h2>
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold text-gray-500">
                <button onClick={() => setViewMode("semana")} className={`px-3 py-1 rounded-md transition-all ${viewMode === "semana" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800"}`}>Semana</button>
                <button onClick={() => setViewMode("mes")} className={`px-3 py-1 rounded-md transition-all ${viewMode === "mes" ? "bg-white text-gray-800 shadow-sm" : "hover:text-gray-800"}`}>Mes</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-4">
              {weekMoods.map((mood, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all ${mood.isActive ? "bg-orange-50 border-2 border-[#A04E2D]/80 scale-110 shadow-sm" : "bg-gray-50/50 hover:bg-gray-100/70 cursor-pointer"}`}>{mood.emoji}</div>
                  <span className={`text-xs font-bold ${mood.isActive ? "text-[#A04E2D]" : "text-gray-400"}`}>{mood.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#853F22]/5 rounded-2xl border border-[#853F22]/10 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#A04E2D]"><HeartHandshake className="w-5 h-5 flex-shrink-0" /><h2 className="font-bold text-lg text-[#853F22] tracking-tight">Apoyo en Crisis</h2></div>
              <p className="text-xs md:text-sm text-[#A04E2D] font-medium leading-relaxed">Si te sentís abrumado o necesitás hablar con alguien de inmediato, estamos acá.</p>
            </div>
            <div className="space-y-3">
              {crisisSent && saludData?.derivar_cvv ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold">✅ Derivación activada. CVV: llamá al 188 (24h, gratuito).</div>
              ) : (
                <button onClick={handleCrisis} disabled={isLoading} className="w-full py-3 bg-[#A04E2D] hover:bg-[#853F22] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
                  {isLoading ? "Procesando..." : "Botón de Crisis"}
                </button>
              )}
              <p className="text-[11px] text-center font-bold text-gray-400 tracking-wide">Referencia automática a CVV 24/7</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Sugerencias de Bienestar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col shadow-sm">
              <div className="h-44 bg-gradient-to-br from-amber-900/30 to-amber-950/70 relative flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#A04E2D] shadow-lg cursor-pointer hover:scale-105 transition-transform"><Play className="w-5 h-5 fill-current ml-0.5" /></div></div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <span className="text-[10px] font-extrabold tracking-widest text-[#A04E2D] uppercase">El Podcast de Hoy</span>
                <h3 className="font-extrabold text-base md:text-lg text-gray-900">Navegando la Ansiedad</h3>
                <p className="text-xs font-bold text-gray-400">12 min • Dra. Sofia Ruiz</p>
              </div>
            </article>
            <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between space-y-6">
              <div><span className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase">Lectura Recomendada</span>
              <h3 className="font-extrabold text-lg md:text-xl text-gray-900">{saludData?.accion_sugerida?.includes("Buenas Ideas") ? "De Dónde Vienen las Buenas Ideas" : "El Poder del Presente"}</h3></div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold"><span className="text-gray-400 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> 5 min</span><button className="text-[#A04E2D]">Leer ahora<ArrowRight className="w-3.5 h-3.5 inline ml-1" /></button></div>
            </article>
            <article className="bg-[#F3F6F3] rounded-2xl border border-emerald-100/50 p-5 shadow-sm flex flex-col justify-between space-y-8">
              <div><span className="text-[10px] font-extrabold tracking-widest text-emerald-800/80 uppercase">Caminata Consciente</span><Navigation className="w-5 h-5 text-emerald-800 rotate-45 mt-1" /><h3 className="font-extrabold text-lg md:text-xl text-emerald-950">Ruta en la Naturaleza</h3></div>
              <div className="space-y-4"><div className="flex items-center gap-4 border-b border-emerald-900/10 pb-4"><div><span className="block font-extrabold text-sm text-emerald-950">2.4 km</span><span className="text-[10px] font-bold text-emerald-800/60 uppercase">Distancia ideal</span></div><div className="border-l border-emerald-900/10 pl-4"><span className="block font-extrabold text-sm text-emerald-950">30 min</span><span className="text-[10px] font-bold text-emerald-800/60 uppercase">Tiempo</span></div></div><button className="w-full py-2.5 bg-white border border-emerald-800/20 hover:bg-emerald-50 text-emerald-900 font-bold text-xs md:text-sm rounded-xl">Ver mapa de ruta</button></div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
};
