import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, Lightbulb,
  Compass, MapPin, Star,
  DollarSign, BookOpen, ArrowUpRight, GraduationCap, X, Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { CourseRecommendation } from "../../types/api";
import { PageBackground } from "../../components/layout/PageBackground";

const CourseCard = ({ course }: { course: CourseRecommendation }) => (
  <div className="flex-shrink-0 w-[220px] bg-white rounded-xl border border-gray-100 p-3.5 flex flex-col gap-2.5 hover:border-[var(--color-primary-light)] transition-colors duration-200 group">
    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-lighter)] flex items-center justify-center group-hover:bg-[var(--color-primary-light)] transition-colors">
      <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
    </div>
    <div className="flex-1 space-y-1">
      <p className="text-xs font-semibold text-[var(--color-heading)] leading-snug line-clamp-2 font-display"
        style={{ letterSpacing: "-0.01em" }}>{course.title}</p>
      <p className="text-[10px] text-[var(--color-muted)]">{course.provider}</p>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-medium text-[var(--color-muted)] bg-gray-50 px-2 py-0.5 rounded-md">{course.duration}</span>
      {course.url && (
        <a href={course.url} target="_blank" rel="noopener noreferrer"
          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] rounded-md transition-colors">
          <ArrowUpRight className="w-3 h-3" />
        </a>
      )}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation("app");
  const user = useAuthStore((s) => s.user);
  const { selectedVacancy, clearVacancy } = useDashboardStore();

  const firstName = user?.full_name?.split(" ")[0] ?? "";
  const compatPercent = selectedVacancy ? Math.round(100 - selectedVacancy.gap_porcentual) : 0;
  const matchedCount = selectedVacancy?.matched_skills.length ?? 0;
  const requiredCount = selectedVacancy?.required_skills.length ?? 0;
  const courseCount = selectedVacancy?.recommended_courses.length ?? 0;

  const seniorityMap: Record<string, string> = {
    trainee: t("app:jobCard.seniority.trainee"),
    junior: t("app:jobCard.seniority.junior"),
    "semi-senior": t("app:jobCard.seniority.semi_senior"),
    senior: t("app:jobCard.seniority.senior"),
  };

  return (
    <PageBackground>
      <div className="max-w-[900px] mx-auto space-y-8 py-6 md:py-10">
        <header className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-heading)]"
          style={{ letterSpacing: "-0.02em" }}>
          {t("app:dashboard.greeting", { name: firstName })}
        </h1>
        <p className="text-sm md:text-base text-[var(--color-body)]">
          {t("app:dashboard.subtitle")}
        </p>
      </header>

      <section>
        {selectedVacancy ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-[var(--color-heading)] uppercase tracking-wider flex items-center gap-2"
                style={{ letterSpacing: "0.05em" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                {t("app:dashboard.careerObjective")}
              </h2>
              <button
                onClick={clearVacancy}
                className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-body)] transition-colors flex items-center gap-1">
                <X className="w-3 h-3" />{t("app:dashboard.changeButton")}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 4px 20px -4px rgba(30,41,59,0.10)" }}>

              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: "var(--gradient-button)" }}>
                    {selectedVacancy.company.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">{selectedVacancy.company}</p>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-lighter)] text-[10px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider">
                        {selectedVacancy.area}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[var(--color-heading)] mt-0.5 font-display"
                      style={{ letterSpacing: "-0.01em" }}>{selectedVacancy.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] font-medium text-[var(--color-body)]">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--color-muted)]" />{selectedVacancy.location}</span>
                      <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-[var(--color-muted)]" />{seniorityMap[selectedVacancy.seniority] ?? selectedVacancy.seniority}</span>
                      {selectedVacancy.salary && <span className="inline-flex items-center gap-1"><DollarSign className="w-3 h-3 text-[var(--color-muted)]" />{selectedVacancy.salary}</span>}
                    </div>
                    {selectedVacancy.required_skills.length > 0 && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-body)]">
                        <span className="font-semibold">{t("app:dashboard.requirements")}</span>
                        {selectedVacancy.required_skills.map((s, i) => (
                          <span key={s}>{s}{i < selectedVacancy.required_skills.length - 1 ? ", " : ""}</span>
                        ))}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-extrabold text-[var(--color-heading)] font-display tabular-nums"
                      style={{ letterSpacing: "-0.02em" }}>{compatPercent}%</span>
                    <p className="text-[10px] text-[var(--color-muted)] font-medium">{t("app:dashboard.compatible")}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${compatPercent}%`,
                        background: compatPercent >= 75
                          ? "var(--color-accent-green)"
                          : compatPercent >= 50
                            ? "var(--color-accent-amber)"
                            : "var(--color-accent-pink)",
                      }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--color-body)]">
                      {t("app:dashboard.skillsMet", { matched: matchedCount, required: requiredCount })}
                    </span>
                    {selectedVacancy.missing_skills.length > 0 && (
                      <span className="text-[var(--color-accent-amber)] font-medium">
                        {selectedVacancy.missing_skills.length === 1
                          ? t("app:dashboard.missingSkills_one", { skills: selectedVacancy.missing_skills[0] })
                          : t("app:dashboard.missingSkills_other", { skills: `${selectedVacancy.missing_skills.slice(0, 2).join(", ")}${selectedVacancy.missing_skills.length > 2 ? ` +${selectedVacancy.missing_skills.length - 2}` : ""}` })
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {courseCount > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-5 sm:px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-[var(--color-primary)]" />
                    <p className="text-xs font-extrabold text-[var(--color-heading)] uppercase tracking-wider font-display"
                      style={{ letterSpacing: "0.05em" }}>
                      {courseCount === 1
                        ? t("app:dashboard.learningPlan_one", { count: courseCount })
                        : t("app:dashboard.learningPlan_other", { count: courseCount })
                      }
                    </p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                    {selectedVacancy.recommended_courses.map((c, i) => (
                      <CourseCard key={`${c.title}-${i}`} course={c} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/orientation"
            className="block bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 text-center space-y-4 hover:border-[var(--color-primary-light)] transition-colors duration-200 group"
            style={{ boxShadow: "0 4px 20px -4px rgba(30,41,59,0.08)" }}>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--color-primary-lighter)] flex items-center justify-center group-hover:bg-[var(--color-primary-light)] transition-colors">
              <Compass className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[var(--color-heading)] text-lg"
                style={{ letterSpacing: "-0.02em" }}>{t("app:dashboard.discoverTitle")}</h2>
              <p className="text-sm text-[var(--color-body)] max-w-sm mx-auto mt-1.5">
                {t("app:dashboard.discoverDescription")}
              </p>
            </div>
            <span className="btn-primary text-sm inline-flex mx-auto">
              {t("app:dashboard.discoverButton")} <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <Link to="/mental-health"
          className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-[var(--color-accent-pink)] transition-colors duration-200 group"
          style={{ boxShadow: "0 4px 20px -4px rgba(30,41,59,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-pink-bg)] flex items-center justify-center">
              <Heart className="w-4 h-4 text-[var(--color-accent-pink)]" />
            </div>
            <h2 className="font-display font-bold text-[var(--color-heading)] text-sm"
              style={{ letterSpacing: "-0.02em" }}>{t("app:dashboard.checkInTitle")}</h2>
          </div>
          <p className="text-sm text-[var(--color-body)] leading-relaxed mb-4">
            {t("app:dashboard.checkInDescription")}
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-pink)] group-hover:gap-3 transition-all">
            {t("app:dashboard.checkInButton")} <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <div className="bg-[var(--color-primary-lighter)]/50 rounded-2xl border border-[var(--color-primary-light)]/50 p-5 flex flex-col justify-center items-center text-center space-y-3">
          <Lightbulb className="w-5 h-5 text-[var(--color-primary)]" />
          <p className="text-xs text-[var(--color-heading)] font-medium leading-relaxed italic">
            "{t("app:dashboard.quote")}"
          </p>
        </div>
      </section>

      </div>
    </PageBackground>
  );
};
