import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, GraduationCap, Compass, TrendingUp,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { OrientationJobCard } from "../../components/orientation/OrientationJobCard";

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

  // ... estados de loading, error, success ...
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
};