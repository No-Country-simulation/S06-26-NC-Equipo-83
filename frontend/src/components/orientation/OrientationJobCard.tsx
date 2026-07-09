import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
    MapPin, Star, DollarSign, ChevronDown, GraduationCap,
    BookOpen, ArrowUpRight, Sparkles, CheckCircle2, X,
} from "lucide-react";
import type { JobMatchDetail, CourseRecommendation } from "../../types/api";
import { useDashboardStore } from "../../store/useDashboardStore";
import { SKILL_LABELS } from "../../lib/skillLabels";

const MiniDonut = ({ percent, size = 52 }: { percent: number; size?: number }) => {
    const radius = (size - 5) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent >= 75 ? "var(--color-accent-green)" : percent >= 50 ? "var(--color-accent-amber)" : "var(--color-accent-pink)";
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-primary-light)" strokeOpacity="0.5" strokeWidth="4" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.7s ease-out" }} />
            </svg>
            <span className="absolute text-xs font-extrabold text-[var(--color-heading)] tabular-nums font-display"
                style={{ letterSpacing: "-0.02em" }}>{percent}%</span>
        </div>
    );
};

const SkillChip = ({ label, variant }: { label: string; variant: "matched" | "pending" }) => {
    const styles = {
        matched: "bg-[var(--color-accent-green-bg)] text-[var(--color-accent-green)] border-[var(--color-accent-green-light)]",
        pending: "bg-[var(--color-accent-amber-bg)] text-[var(--color-accent-amber)] border-[var(--color-accent-amber-light)]",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${styles[variant]}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${variant === "matched" ? "bg-[var(--color-accent-green)]" : "bg-[var(--color-accent-amber)]"}`} />
            {label}
        </span>
    );
};

const CourseRow = ({ course }: { course: CourseRecommendation }) => (
    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-100 hover:border-[var(--color-primary-light)] transition-colors duration-200 group">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-lighter)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-primary-light)] transition-colors duration-200">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--color-heading)] truncate font-display"
                style={{ letterSpacing: "-0.01em" }}>{course.title}</p>
            <p className="text-[10px] text-[var(--color-muted)]">{course.provider} · {course.duration}</p>
        </div>
        {course.url && (
            <a href={course.url} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-lighter)] rounded-lg transition-colors duration-200 flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
        )}
    </div>
);

interface Props { job: JobMatchDetail; index: number; }

export const OrientationJobCard = ({ job, index: _index }: Props) => {
    const { t } = useTranslation("app");
    const [showDetails, setShowDetails] = useState(false);
    const { selectedVacancy, selectVacancy, clearVacancy } = useDashboardStore();
    const isSelected = selectedVacancy?.id === job.id;

    const getSkillLabel = (key: string): string => {
      const raw = SKILL_LABELS[key];
      if (!raw) return key;
      if (raw.startsWith("__")) return t(raw.slice(2));
      return raw;
    };

    const seniorityMap: Record<string, string> = {
        trainee: t("app:jobCard.seniority.trainee"),
        junior: t("app:jobCard.seniority.junior"),
        "semi-senior": t("app:jobCard.seniority.semi_senior"),
        senior: t("app:jobCard.seniority.senior"),
    };

    const areaMap: Record<string, string> = {
        frontend: t("app:jobCard.areaLabels.frontend"),
        backend: t("app:jobCard.areaLabels.backend"),
        fullstack: t("app:jobCard.areaLabels.fullstack"),
        mobile: t("app:jobCard.areaLabels.mobile"),
        ai_ml: t("app:jobCard.areaLabels.ai_ml"),
        data_science: t("app:jobCard.areaLabels.data_science"),
        devops: t("app:jobCard.areaLabels.devops"),
        cloud: t("app:jobCard.areaLabels.cloud"),
        cybersecurity: t("app:jobCard.areaLabels.cybersecurity"),
        qa_testing: t("app:jobCard.areaLabels.qa_testing"),
        ux_ui: t("app:jobCard.areaLabels.ux_ui"),
        product_management: t("app:jobCard.areaLabels.product_management"),
        blockchain: t("app:jobCard.areaLabels.blockchain"),
        iot: t("app:jobCard.areaLabels.iot"),
        game_development: t("app:jobCard.areaLabels.game_development"),
    };

    const compatPercent = Math.round(100 - job.gap_porcentual);
    const matchedCount = job.matched_skills.length;
    const requiredCount = job.required_skills.length;
    const missingPreview = job.missing_skills.slice(0, 3).map(s => getSkillLabel(s));
    const extraMissing = Math.max(0, job.missing_skills.length - 3);
    const courseCount = job.recommended_courses.length;

    return (
        <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden
            shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(30,41,59,0.12)] transition-shadow duration-300">
            <div className="flex items-center gap-4 p-4 sm:p-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-xs"
                    style={{ background: "var(--gradient-button)" }}>
                    {job.company.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider truncate">{job.company}</p>
                        {job.area && (
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-[var(--color-primary-lighter)] text-[10px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider">
                                {areaMap[job.area] ?? job.area}
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[var(--color-heading)] leading-snug truncate mt-0.5 font-display"
                        style={{ letterSpacing: "-0.01em" }}>{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] font-medium text-[var(--color-body)]">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-[var(--color-muted)]" />{job.location}</span>
                        <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-[var(--color-muted)]" />{seniorityMap[job.seniority] ?? job.seniority}</span>
                        {job.salary && <span className="inline-flex items-center gap-1"><DollarSign className="w-3 h-3 text-[var(--color-muted)]" />{job.salary}</span>}
                    </div>
                    {job.required_skills.length > 0 && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-body)]">
                            <span className="font-semibold">{t("app:jobCard.requirements")}</span>
                            {job.required_skills.map((s, i) => (
                                <span key={s}>{getSkillLabel(s)}{i < job.required_skills.length - 1 ? ", " : ""}</span>
                            ))}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] font-semibold text-[var(--color-body)]">
                            {t("app:jobCard.skillsMetLabel", { matched: matchedCount, required: requiredCount })}
                        </span>
                        {job.missing_skills.length > 0 && (
                            <span className="text-[11px] text-[var(--color-accent-amber)] font-medium truncate">
                                {job.missing_skills.length === 1
                                    ? t("app:jobCard.missingSkills_one", { skills: `${missingPreview.join(", ")}${extraMissing > 0 ? ` +${extraMissing}` : ""}` })
                                    : t("app:jobCard.missingSkills_other", { skills: `${missingPreview.join(", ")}${extraMissing > 0 ? ` +${extraMissing}` : ""}` })
                                }
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center gap-2.5">
                    <MiniDonut percent={compatPercent} />
                    {isSelected ? (
                        <button
                            onClick={clearVacancy}
                            className="relative flex items-center justify-center px-4 py-2 font-bold text-[11px] rounded-full transition-all duration-200 active:scale-[0.97] group"
                            style={{
                                background: "var(--color-accent-green-bg)",
                                color: "var(--color-accent-green)",
                                boxShadow: "inset 0 0 0 1px var(--color-accent-green-light)",
                            }}
                            title={t("app:jobCard.cancelTitle")}>
                            <span className="flex items-center gap-1.5 group-hover:invisible">
                                <CheckCircle2 className="w-3 h-3" />
                                {t("app:jobCard.selectedButton")}
                            </span>
                            <span className="absolute inset-0 flex items-center justify-center gap-1.5 invisible group-hover:visible">
                                <X className="w-3 h-3" />
                                {t("app:jobCard.cancelButton")}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => selectVacancy(job)}
                            className="flex items-center gap-1.5 px-4 py-2 text-white font-bold text-[11px] rounded-full transition-all duration-200 hover:shadow-[0_4px_12px_-2px_rgba(47,117,220,0.4)] active:scale-[0.97]"
                            style={{
                                background: "var(--gradient-button)",
                                boxShadow: "0 2px 8px -2px rgba(47,117,220,0.25)",
                            }}>
                            <Sparkles className="w-3 h-3" />
                            {t("app:jobCard.selectButton")}
                        </button>
                    )}
                    <button onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-200">
                        {t("app:jobCard.detailsButton")}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-5 py-4 space-y-4">
                            <p className="text-xs text-[var(--color-body)] leading-relaxed">{job.description}</p>

                            <div className="flex items-start gap-2.5">
                                <Sparkles className="w-3 h-3 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-[var(--color-body)] leading-relaxed">
                                    {t("app:jobCard.recommendedDescription", { percent: compatPercent })}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-extrabold text-[var(--color-accent-green)] uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]" />
                                        {t("app:jobCard.alreadyMet", { count: matchedCount })}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.matched_skills.map((s) => <SkillChip key={s} label={getSkillLabel(s)} variant="matched" />)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-extrabold text-[var(--color-accent-amber)] uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-amber)]" />
                                        {t("app:jobCard.toDevelop", { count: job.missing_skills.length })}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.missing_skills.map((s) => <SkillChip key={s} label={getSkillLabel(s)} variant="pending" />)}
                                    </div>
                                </div>
                            </div>

                            {job.missing_skills.length > 0 && courseCount > 0 && (
                                <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--color-primary-lighter)] rounded-xl border border-[var(--color-primary-light)]/50">
                                    <GraduationCap className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                                    <p className="text-[11px] font-semibold text-[var(--color-primary)]">
                                        {courseCount === 1
                                            ? t("app:jobCard.closeGap_one", { count: courseCount })
                                            : t("app:jobCard.closeGap_other", { count: courseCount })
                                        }
                                    </p>
                                </div>
                            )}

                            {courseCount > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-extrabold text-[var(--color-heading)] uppercase tracking-wider flex items-center gap-1.5 font-display"
                                        style={{ letterSpacing: "0.05em" }}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />{t("app:jobCard.learningPath")}
                                    </p>
                                    <div className="space-y-2">
                                        {job.recommended_courses.map((c, i) => <CourseRow key={`${c.title}-${i}`} course={c} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </article>
    );
};
