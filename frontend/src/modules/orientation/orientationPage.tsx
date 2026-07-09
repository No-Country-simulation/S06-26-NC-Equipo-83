import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, GraduationCap, Compass, TrendingUp,
} from "lucide-react";
import { useOrientarStore } from "../../store/useOrientarStore";
import { useAuthStore } from "../../store/useAuthStore";
import { OrientationJobCard } from "../../components/orientation/OrientationJobCard";
import { PageBackground } from "../../components/layout/PageBackground";
import i18n from "../../i18n";
import { INTEREST_AREAS } from "../../lib/registrationData";

export const OrientationPage: React.FC = () => {
  const { t } = useTranslation("app");
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, error, fetchAnalysis } = useOrientarStore();

  const areaLabelMap: Record<string, string> = {};
  INTEREST_AREAS.forEach((item) => {
    areaLabelMap[item.value] = t(item.labelKey);
  });

  function formatInterests(areas: string[]): string {
    if (areas.length === 0) return t("app:orientation.areaFallback");
    const labels = areas.map((a) => areaLabelMap[a] ?? a);
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
    const last = labels.pop();
    return `${labels.join(", ")} y ${last}`;
  }

  useEffect(() => {
    if (user) {
      const primaryArea = user.interest_areas?.[0] || user.tech_area || "frontend";
      fetchAnalysis({
        perfil: primaryArea,
        nivel: user.current_situation || user.professional_level || "junior",
        region: user.country_name || "LATAM",
        idioma: i18n.language,
        lat: 0,
        lng: 0,
      });
    }
  }, [user, i18n.language]);

  const firstName = user?.full_name?.split(" ")[0] ?? "";

  if (isLoading) {
    return (
      <PageBackground>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)] mx-auto" />
            <div>
              <p className="text-base font-display font-bold text-[var(--color-heading)]"
                style={{ letterSpacing: "-0.02em" }}>{t("app:orientation.loadingTitle")}</p>
              <p className="text-sm text-[var(--color-body)] mt-1">{t("app:orientation.loadingSubtitle")}</p>
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
                style={{ letterSpacing: "-0.02em" }}>{t("app:orientation.errorTitle")}</p>
              <p className="text-sm text-[var(--color-body)] mt-1">{error || t("app:orientation.errorFallback")}</p>
            </div>
            <button
              onClick={() => fetchAnalysis({
                perfil: user?.interest_areas?.[0] || user?.tech_area || "frontend",
                nivel: user?.current_situation || user?.professional_level || "junior",
                region: "LATAM", idioma: i18n.language, lat: 0, lng: 0,
              })}
              className="btn-primary text-sm">
              <Loader2 className="w-4 h-4" />
              {t("app:orientation.retry")}
            </button>
          </div>
        </div>
      </PageBackground>
    );
  }

  const jobs = data.vacantes_compatibles;
  const matchedAreas = [...new Set(jobs.map((j) => j.area))];
  const interestAreas = user?.interest_areas ?? [];

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
                {t("app:orientation.badge")}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.12] text-[var(--color-heading)]"
              style={{ letterSpacing: "-0.02em" }}>
              {firstName ? (
                <>{t("app:orientation.titleFirstLine", { name: firstName })}<br />
                  <span className="text-[var(--color-primary)]">{t("app:orientation.titleSecondLine")}</span>
                </>
              ) : (
                <>{t("app:orientation.titleFirstLineNo")}<br />
                  <span className="text-[var(--color-primary)]">{t("app:orientation.titleSecondLine")}</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-body)] leading-relaxed max-w-xl">
              {t("app:orientation.description", { area: interestAreaLabel })}
            </p>

            {jobs.length > 0 && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-heading)]">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-accent-green-bg)] flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
                  </div>
                  {jobs.length === 1
                    ? t("app:orientation.opportunities_one", { count: jobs.length })
                    : t("app:orientation.opportunities_other", { count: jobs.length })
                  }
                </div>
                <span className="w-px h-4 bg-gray-200" />
                <span className="text-sm font-medium text-[var(--color-muted)]">{t("app:orientation.inArea", { area: interestAreaLabel })}</span>
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
              {t("app:orientation.recommendationsTitle")}
            </span>
          </div>
          <p className="text-xs text-[var(--color-muted)] pl-[2.1rem]">
            {t("app:orientation.recommendationsHelp")}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center">
              <Compass className="w-7 h-7 text-[var(--color-primary)]/25" />
            </div>
            <div>
              <p className="font-display font-bold text-[var(--color-heading)] text-base"
                style={{ letterSpacing: "-0.02em" }}>{t("app:orientation.emptyTitle")}</p>
              <p className="text-sm text-[var(--color-body)] max-w-xs mx-auto mt-1">
                {t("app:orientation.emptyDescription")}
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
              style={{ letterSpacing: "-0.02em" }}>{t("app:orientation.ctaTitle")}</p>
            <p className="text-sm text-[var(--color-body)] leading-relaxed">
              {t("app:orientation.ctaDescription")}
            </p>
          </div>
        </div>
      </section>
      </motion.div>
    </PageBackground>
  );
};
