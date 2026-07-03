import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Star, Clock, ChevronDown, GraduationCap,
    BookOpen, ArrowUpRight, Sparkles,
} from "lucide-react";
import type { JobMatchDetail, CourseRecommendation } from "../../types/api";

const seniorityLabel: Record<string, string> = {
    trainee: "Trainee", junior: "Junior", "semi-senior": "Semi Senior", senior: "Senior",
};

const AREA_LABEL: Record<string, string> = {
    frontend: "Frontend", backend: "Backend", fullstack: "Full Stack",
    mobile: "Mobile", ai_ml: "IA / ML", data_science: "Ciencia de datos",
    devops: "DevOps", cloud: "Cloud", cybersecurity: "Ciberseguridad",
    qa_testing: "QA / Testing", ux_ui: "UI / UX", product_management: "Product Mgmt",
    blockchain: "Blockchain", iot: "IoT", game_development: "Game Dev",
};

const MiniDonut = ({ percent, size = 56 }: { percent: number; size?: number }) => {
    const radius = (size - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent >= 75 ? "#059669" : percent >= 50 ? "#d97706" : "#dc2626";
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5"
                    strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out" />
            </svg>
            <span className="absolute text-sm font-extrabold text-stone-700 tabular-nums">{percent}%</span>
        </div>
    );
};

const SkillChip = ({ label, variant }: { label: string; variant: "matched" | "pending" }) => {
    const styles = {
        matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${styles[variant]}`}>
            {variant === "matched" ? <span className="w-1 h-1 rounded-full bg-emerald-500" /> : <span className="w-1 h-1 rounded-full bg-amber-500" />}
            {label}
        </span>
    );
};

const CourseRow = ({ course }: { course: CourseRecommendation }) => (
    <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-stone-100 hover:border-stone-200 transition-colors group">
        <div className="w-7 h-7 rounded-md bg-[#A04E2D]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-[#A04E2D]" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-700 truncate">{course.title}</p>
            <p className="text-[10px] text-stone-400">{course.provider} · {course.duration}</p>
        </div>
        {course.url && (
            <a href={course.url} target="_blank" rel="noopener noreferrer"
                className="p-1 text-stone-300 hover:text-[#A04E2D] transition-colors flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
        )}
    </div>
);

interface Props { job: JobMatchDetail; index: number; }

export const OrientationJobCard = ({ job, index }: Props) => {
    const [showDetails, setShowDetails] = useState(false);

    const compatPercent = Math.round(100 - job.gap_porcentual);
    const matchedCount = job.matched_skills.length;
    const requiredCount = job.required_skills.length;
    const missingPreview = job.missing_skills.slice(0, 3);
    const extraMissing = Math.max(0, job.missing_skills.length - 3);
    const courseCount = job.recommended_courses.length;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
            {/* FILA PRINCIPAL (siempre visible) */}
            <div className="flex items-center gap-4 p-4 sm:p-5">
                {/* Avatar empresa */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#A04E2D] to-[#C87A53] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                    {job.company.slice(0, 2).toUpperCase()}
                </div>

                {/* Info central */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-[#A04E2D] uppercase tracking-wider truncate">{job.company}</p>
                        {job.area && (
                            <span className="flex-shrink-0 px-1.5 py-px rounded-full bg-[#A04E2D]/10 text-[9px] font-extrabold text-[#A04E2D]/70 uppercase tracking-wider">
                                {AREA_LABEL[job.area] ?? job.area}
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug truncate mt-0.5">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] font-medium text-stone-400">
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="capitalize"><Star className="w-3 h-3 inline mr-0.5" />{seniorityLabel[job.seniority] ?? job.seniority}</span>
                        {job.salary && <span><Clock className="w-3 h-3 inline mr-0.5" />{job.salary}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] font-semibold text-stone-500">{matchedCount}/{requiredCount} skills cumplidas</span>
                        {missingPreview.length > 0 && (
                            <span className="text-[11px] text-amber-600 font-medium truncate">
                                · Te falta{missingPreview.length === 1 ? "" : "n"}: {missingPreview.join(", ")}{extraMissing > 0 ? ` +${extraMissing}` : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Donut + botones */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <MiniDonut percent={compatPercent} />
                    <button onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#A04E2D] to-[#C87A53] hover:from-[#853F22] hover:to-[#A04E2D] text-white font-bold text-[11px] rounded-lg transition-all duration-200 shadow-sm active:scale-[0.97]">
                        <Sparkles className="w-3 h-3" />
                        Elegir vacante
                    </button>
                    <button onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors">
                        Ver detalles
                        <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-3 h-3" />
                        </motion.span>
                    </button>
                </div>
            </div>

            {/* PANEL EXPANDIBLE */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-stone-100 bg-stone-50/60 px-4 sm:px-5 py-4 space-y-4">
                            {/* Descripcion */}
                            <p className="text-xs text-stone-500 leading-relaxed">{job.description}</p>

                            {/* Motivo recomendacion */}
                            <div className="flex items-start gap-2">
                                <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-stone-400 italic leading-relaxed">
                                    Recomendada porque coincide con tus areas de interes y tecnologias. Tu perfil tiene un {compatPercent}% de compatibilidad.
                                </p>
                            </div>

                            {/* Skills en 2 columnas */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                                        Ya cumplis ({matchedCount})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {job.matched_skills.map((s) => <SkillChip key={s} label={s} variant="matched" />)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                                        Por desarrollar ({job.missing_skills.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {job.missing_skills.map((s) => <SkillChip key={s} label={s} variant="pending" />)}
                                    </div>
                                </div>
                            </div>

                            {/* CTA accionable */}
                            {job.missing_skills.length > 0 && courseCount > 0 && (
                                <div className="flex items-center gap-2 px-2.5 py-2 bg-[#A04E2D]/5 rounded-lg border border-[#A04E2D]/10">
                                    <GraduationCap className="w-3.5 h-3.5 text-[#A04E2D] flex-shrink-0" />
                                    <p className="text-[11px] font-semibold text-[#A04E2D]">
                                        Con {courseCount} {courseCount === 1 ? "curso" : "cursos"} podes cerrar este gap y postularte.
                                    </p>
                                </div>
                            )}

                            {/* Cursos */}
                            {courseCount > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-[#A04E2D]" />Camino de aprendizaje
                                    </p>
                                    <div className="space-y-1.5">
                                        {job.recommended_courses.map((c, i) => <CourseRow key={`${c.title}-${i}`} course={c} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
};