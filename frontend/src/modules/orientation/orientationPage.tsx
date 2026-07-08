import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, GraduationCap, Compass, TrendingUp,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { OrientationJobCard } from "../../components/orientation/OrientationJobCard";
import { PageBackground } from "../../components/layout/PageBackground";

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

  if (isLoading) {
    return (
      <PageBackground>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)] mx-auto" />
            <div>
              <p className="text-base font-display font-bold text-[var(--color-heading)]"
                style={{ letterSpacing: "-0.02em" }}>Analizando tu perfil</p>
              <p className="text-sm text-[var(--color-body)] mt-1">Buscando las mejores oportunidades para vos…</p>
            </div>
          </div>
        </div>
      </PageBackground>
    );
  }

  if (error || !data) {
    return (
      <PageBackground>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-md py-20">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <p className="text-base font-display font-bold text-[var(--color-heading)]"
                style={{ letterSpacing: "-0.02em" }}>Algo salió mal</p>
              <p className="text-sm text-[var(--color-body)] mt-1">{error || "No se pudo cargar el análisis."}</p>
            </div>
            <button
              onClick={() => fetchAnalysis({
                perfil: user?.interest_areas?.[0] || user?.tech_area || "frontend",
                nivel: user?.current_situation || user?.professional_level || "junior",
                region: "LATAM", idioma: "es", lat: 0, lng: 0,
              })}
              className="btn-primary text-sm">
              <Loader2 className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </PageBackground>
    );
  }

  const jobs = data.vacantes_compatibles;
  const matchedAreas = [...new Set(jobs.map((j) => j.area))];
  const interestAreas = user?.interest_areas ?? [];

  // Mostramos solo las áreas de interés que efectivamente tuvieron resultados.
  // Una vacante fullstack cuenta como match si el usuario eligió frontend y backend.
  const hasFullstackVacancy = matchedAreas.includes("fullstack");
  const displayedInterestAreas = interestAreas.filter((area) => {
    if (matchedAreas.includes(area)) return true;
    if (hasFullstackVacancy && (area === "frontend" || area === "backend")) {
      const hasPair =
        interestAreas.includes("frontend") && interestAreas.includes("backend");
      return hasPair;
    }
    return false;
  });

  const interestAreaLabel = formatInterests(
    displayedInterestAreas.length > 0 ? displayedInterestAreas : interestAreas,
  );

  return (
    <PageBackground>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <section className="border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full bg-[var(--color-accent-purple)]" />
              <span className="text-[11px] font-extrabold text-[var(--color-accent-purple)] uppercase tracking-[0.15em]">
                Orientación profesional
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.12] text-[var(--color-heading)]"
              style={{ letterSpacing: "-0.02em" }}>
              {firstName ? (
                <>{firstName}, encontramos<br />
                  <span className="text-[var(--color-primary)]">estas vacantes para vos</span>
                </>
              ) : (
                <>Encontramos<br />
                  <span className="text-[var(--color-primary)]">estas vacantes para vos</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-body)] leading-relaxed max-w-xl">
              Seleccionamos estas oportunidades porque elegiste{" "}
              <span className="font-bold text-[var(--color-heading)]">{interestAreaLabel}</span>.{" "}
              Cada una incluye un análisis detallado para que sepas exactamente qué pasos seguir.
            </p>

            {jobs.length > 0 && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-heading)]">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-accent-green-bg)] flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
                  </div>
                  {jobs.length} {jobs.length === 1 ? "oportunidad" : "oportunidades"}
                </div>
                <span className="w-px h-4 bg-gray-200" />
                <span className="text-sm font-medium text-[var(--color-muted)]">en {interestAreaLabel}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-[800px] mx-auto px-4 sm:px-6 py-10 md:py-12 space-y-4">
        <div className="space-y-1.5 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-px bg-[var(--color-primary)]/30" />
            <span className="text-[10px] font-extrabold text-[var(--color-primary)] uppercase tracking-[0.2em]">
              Recomendaciones para tu perfil
            </span>
          </div>
          <p className="text-xs text-[var(--color-muted)] pl-[2.1rem]">
            Ordenadas por menor gap: primero las que están más cerca de tu alcance.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
              <Compass className="w-7 h-7 text-[var(--color-primary)]/25" />
            </div>
            <div>
              <p className="font-display font-bold text-[var(--color-heading)] text-base"
                style={{ letterSpacing: "-0.02em" }}>No hay vacantes aún</p>
              <p className="text-sm text-[var(--color-body)] max-w-xs mx-auto mt-1">
                No encontramos vacantes en tus áreas de interés. Probá ampliando tus áreas de interés en tu perfil.
              </p>
            </div>
          </div>
        ) : (
          jobs.map((job, i) => <OrientationJobCard key={job.id} job={job} index={i} />)
        )}
      </section>

      <section className="max-w-[800px] mx-auto px-4 sm:px-6 pb-14 md:pb-20">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 flex flex-col sm:flex-row items-start gap-5">
          <div className="p-3 bg-[var(--color-primary-lighter)] rounded-xl text-[var(--color-primary)] flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <p className="font-display font-bold text-[var(--color-heading)] text-sm"
              style={{ letterSpacing: "-0.02em" }}>Cada curso te transforma.</p>
            <p className="text-sm text-[var(--color-body)] leading-relaxed">
              Las personas que completan al menos un curso de su plan de aprendizaje tienen 3 veces más
              probabilidades de conseguir una entrevista. El primer paso es el que más te acerca.
            </p>
          </div>
        </div>
      </section>
      </motion.div>
    </PageBackground>
  );
};
