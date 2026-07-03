import React, { useEffect } from "react";
import {
  Clock, Briefcase, GraduationCap,
  SlidersHorizontal, Loader2, AlertCircle,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";

export const OrientationPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchAnalysis } = useOrientarStore();

  useEffect(() => {
    if (user && !data) {
      fetchAnalysis({
        perfil: user.tech_area || "frontend",
        nivel: user.professional_level || "junior",
        region: user.country_name || "LATAM",
        idioma: "es",
        lat: 0,
        lng: 0,
      });
    }
  }, [user]);

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

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm text-red-600 font-medium">{error || "No se pudo cargar el análisis."}</p>
          <button onClick={() => fetchAnalysis({ perfil: user?.tech_area || "frontend", nivel: user?.professional_level || "junior", region: "LATAM", idioma: "es", lat: 0, lng: 0 })} className="px-4 py-2 bg-[#A04E2D] text-white font-semibold text-sm rounded-xl">Reintentar</button>
        </div>
      </main>
    );
  }

  const getCourseDetails = (courseString: string) => {
    if (courseString.includes("Google Cloud") || courseString.includes("GEAR")) return { title: courseString, duration: "12-18 horas", category: "Cloud", bg: "bg-orange-200/40" };
    if (courseString.includes("Oracle") || courseString.includes("ONE")) return { title: courseString, duration: "20-40 horas", category: "Formación", bg: "bg-yellow-700/20" };
    return { title: courseString, duration: "Variable", category: "General", bg: "bg-emerald-200/40" };
  };

  return (
    <main className="min-h-screen py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
      <div className="max-w-[1024px] mx-auto space-y-8 md:space-y-12">

        <section className="bg-[#853F22]/5 rounded-2xl border border-[#853F22]/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative flex-shrink-0 w-32 h-32 md:w-36 md:h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" className="stroke-gray-200 fill-none" strokeWidth="10" />
              <circle cx="50%" cy="50%" r="42%" className="stroke-[#A04E2D] fill-none" strokeWidth="12" strokeDasharray="264" strokeDashoffset={264 - (264 * Math.round(data.gap_porcentual)) / 100} strokeLinecap="round" />
            </svg>
            <span className="absolute text-2xl md:text-3xl font-bold text-gray-800">{Math.round(data.gap_porcentual)}%</span>
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 leading-tight">Cumples el {Math.round(100 - data.gap_porcentual)}% de los requisitos para {user?.tech_area || "tu área"}</h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[680px]">Tu perfil está en camino. Te recomendamos enfocarte en las habilidades restantes.</p>
            <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start">
              {data.gap_items.slice(0, 2).map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-100/70 text-emerald-800 font-medium text-xs rounded-full border border-emerald-200/40">{item.length > 30 ? item.slice(0, 30) + "..." : item}</span>
              ))}
              {data.gap_items.length > 2 && <span className="px-3 py-1 bg-gray-200/60 text-gray-600 font-medium text-xs rounded-full italic">+{data.gap_items.length - 2} brechas</span>}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-baseline">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Cierra la brecha del {Math.round(100 - data.gap_porcentual)}%</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {data.trayectoria_sugerida.slice(0, 3).map((item, idx) => {
              const details = getCourseDetails(item);
              return (
                <article key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className={`h-40 ${details.bg} relative flex items-center justify-center p-4`}>
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-wide text-gray-600 rounded-md shadow-sm">{details.category}</span>
                    <GraduationCap className="w-12 h-12 text-[#A04E2D]/40" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 leading-snug">{details.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium"><Clock className="w-3.5 h-3.5" /><span>{details.duration}</span></div>
                    </div>
                    <button className="w-full py-2 bg-[#A04E2D] hover:bg-[#853F22] text-white font-semibold text-xs md:text-sm rounded-xl transition-all shadow-sm">Empezar</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">Oportunidades compatibles</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="font-medium">Filtrar por:</span><button className="flex items-center gap-1 px-2.5 py-1 bg-gray-200/60 font-semibold text-gray-700 rounded-md">Relevancia<SlidersHorizontal className="w-3 h-3" /></button></div>
          </div>
          {data.vacantes_compatibles.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">No hay vacantes disponibles para tu área en este momento.</div>
          ) : (
            <div className="space-y-3">
              {data.vacantes_compatibles.map((vacante) => (
                <article key={vacante.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-200/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-50 text-emerald-700"><Briefcase className="w-5 h-5" /></div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm md:text-base text-gray-800 leading-tight">{vacante.title}</h3>
                      <p className="text-xs font-semibold text-gray-500">{vacante.company} • <span className="font-medium text-gray-400">Remoto</span></p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 font-bold text-[10px] rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100">{100 - vacante.match_percentage}% de Match</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200/40 font-bold text-[10px] rounded-md">Full-time</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 sm:text-right order-1">Consultar salario</span>
                    <button className="px-6 py-2 bg-[#3A5343] hover:bg-[#2C3F33] text-white font-bold text-xs md:text-sm rounded-xl transition-all shadow-sm order-2">Postular</button>
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
