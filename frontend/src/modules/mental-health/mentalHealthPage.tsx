import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Loader2, Shield, Phone,
  Lightbulb, Send,
} from "lucide-react";
import { useSaludStore } from "../../store/useSaludStore";
import { Mood } from "../../types/api";
import { PageBackground } from "../../components/layout/PageBackground";

interface MoodOption {
  id: string;
  value: string;
  emoji: string;
  label: string;
}

const moodOptions: MoodOption[] = [
  { id: "happy", value: Mood.HAPPY, emoji: "😊", label: "Feliz" },
  { id: "tired", value: Mood.TIRED, emoji: "🥱", label: "Cansado" },
  { id: "sad", value: Mood.SAD, emoji: "😢", label: "Triste" },
  { id: "anxious", value: Mood.ANXIOUS, emoji: "😰", label: "Ansioso" },
  { id: "overwhelmed", value: Mood.OVERWHELMED, emoji: "😫", label: "Agobiado" },
  { id: "stressed", value: Mood.STRESSED, emoji: "🤯", label: "Estresado" },
  { id: "angry", value: Mood.ANGRY, emoji: "😡", label: "Enojado" },
  { id: "depressed", value: Mood.DEPRESSED, emoji: "😔", label: "Deprimido" },
];

const CARD_SHADOW = { boxShadow: "0 4px 20px -4px rgba(30,41,59,0.08)" };

export const MentalHealthPage: React.FC = () => {
  const { currentResponse: saludData, isLoading, error, sendCheckin, clearResponse } = useSaludStore();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [weeklyScore, setWeeklyScore] = useState<number>(7);
  const [contexto, setContexto] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCrisisScore = weeklyScore < 4;

  const handleSubmit = async () => {
    if (!selectedMood) return;
    await sendCheckin({
      humor: selectedMood as typeof Mood.HAPPY,
      nota_semanal: weeklyScore,
      contexto: contexto.trim() || null,
    });
    setIsSubmitted(true);
  };

  const handleReset = () => {
    clearResponse();
    setIsSubmitted(false);
    setSelectedMood(null);
    setWeeklyScore(7);
    setContexto("");
  };

  const handleCrisis = async () => {
    await sendCheckin({
      humor: Mood.DEPRESSED,
      nota_semanal: 1,
      contexto: "Botón de crisis activado por el usuario",
    });
    setIsSubmitted(true);
  };

  return (
    <PageBackground className="px-4 sm:px-6">
      <div className="max-w-[750px] mx-auto space-y-8 py-6 md:py-10">
        <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-pink-bg)] flex items-center justify-center">
            <Heart className="w-4 h-4 text-[var(--color-accent-pink)]" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-heading)]"
            style={{ letterSpacing: "-0.02em" }}>
            Tu Bienestar
          </h1>
        </div>
        <div className="flex items-start gap-3 pt-2">
          <img
            src="/pet-res.webp"
            alt="BiT"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl rounded-tl-md p-4 border border-gray-200 shadow-sm">
              <p className="text-sm text-[var(--color-body)] leading-relaxed">
                Este es un espacio seguro para escucharte. Tomate un momento para respirar, registrar cómo te sentís y recibir una recomendación pensada para vos.
              </p>
            </div>
            <p className="text-[10px] text-[var(--color-muted)] mt-1.5">BiT</p>
          </div>
        </div>
      </motion.div>

      {!isSubmitted ? (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-6"
          style={CARD_SHADOW}>

          <div>
            <h2 className="font-display font-bold text-[var(--color-heading)] text-base"
              style={{ letterSpacing: "-0.02em" }}>¿Cómo te sentís hoy?</h2>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Elegí el emoji que mejor describe tu estado actual.</p>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {moodOptions.map((mood) => {
              const isCurrent = selectedMood === mood.value;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200
                    ${isCurrent
                      ? "border-[var(--color-accent-pink)] bg-[var(--color-accent-pink-bg)] shadow-sm"
                      : "border-gray-100 bg-white hover:border-[var(--color-accent-pink)]/30 hover:bg-[var(--color-accent-pink-bg)]/50"
                    }`}>
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className={`text-[10px] font-semibold ${isCurrent ? "text-[var(--color-accent-pink)]" : "text-[var(--color-muted)]"}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-body)]">¿Cómo calificás tu día?</label>
                <span className={`text-sm font-extrabold tabular-nums ${isCrisisScore ? "text-red-500" : "text-[var(--color-accent-pink)]"}`}>
                  {weeklyScore}/10
                </span>
              </div>
              <input
                type="range" min="1" max="10" value={weeklyScore}
                onChange={(e) => setWeeklyScore(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: isCrisisScore ? "#EF4444" : "var(--color-accent-pink)" }} />
              <div className="flex justify-between text-[10px] text-[var(--color-muted)] font-medium">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--color-body)] block">
                ¿Querés contarnos algo más? <span className="text-[var(--color-muted)] font-normal">(opcional)</span>
              </label>
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ej: Tuve un día complicado en el trabajo..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[var(--color-body)] placeholder:text-[var(--color-muted)] resize-none focus:outline-none focus:border-[var(--color-accent-pink)]/40 focus:ring-2 focus:ring-[var(--color-accent-pink)]/10 transition-all" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedMood || isLoading}
            className="w-full py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={selectedMood && !isLoading ? {
              background: "linear-gradient(135deg, var(--color-accent-pink) 0%, #EC4899 100%)",
              color: "white",
              boxShadow: "0 4px 14px -2px rgba(219,39,119,0.3)",
            } : {
              background: "#F3F4F6",
              color: "var(--color-muted)",
            }}>
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Analizando tu estado...</>
            ) : (
              <><Send className="w-4 h-4" />Enviar check-in</>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">{error}</div>
          )}
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5">

          {saludData && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-5" style={CARD_SHADOW}>
              {/* Diálogo del usuario */}
              {selectedMood && (
                <div className="flex items-start gap-3 justify-end">
                  {(() => {
                    const moodOption = moodOptions.find((m) => m.value === selectedMood);
                    return (
                      <div className="flex-1 min-w-0 flex flex-col items-end">
                        <div className="bg-sky-100 rounded-2xl rounded-tr-md p-4 border border-sky-200">
                          <p className="text-sm text-[var(--color-body)] leading-relaxed whitespace-pre-line">
                            {`Estado de ánimo: ${moodOption?.label} ${moodOption?.emoji}\nPuntuación de la semana: ${weeklyScore}/10`}
                            {contexto?.trim() ? `\n\n${contexto.trim()}` : ""}
                          </p>
                        </div>
                        <p className="text-[10px] text-[var(--color-muted)] mt-1.5">Tu mensaje</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Diálogo de BiT */}
              <div className="flex items-start gap-3">
                <img
                  src="/pet-res.webp"
                  alt="BiT"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl rounded-tl-md p-4 border border-gray-200">
                    <p className="text-sm text-[var(--color-body)] leading-relaxed">{saludData.mensaje}</p>
                  </div>
                  <p className="text-[10px] text-[var(--color-muted)] mt-1.5">
                    Respuesta de BiT · {new Date(saludData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {saludData.derivar_cvv && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-extrabold tracking-wider text-red-600 uppercase">Derivación al CVV</span>
                  </div>
                  <p className="text-sm text-red-800 font-semibold leading-relaxed">
                    Llamá al <span className="text-lg font-extrabold">188</span> — Centro de Valorización de la Vida.
                  </p>
                  <p className="text-xs text-red-600">
                    Atención 24 horas, gratuita y confidencial.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 bg-[var(--color-accent-amber-bg)] border border-[var(--color-accent-amber-light)] rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />
                    <span className="text-[10px] font-extrabold tracking-wider text-[var(--color-accent-amber)] uppercase">
                      Acción sugerida
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-body)] font-semibold leading-relaxed">{saludData.accion_sugerida}</p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 text-[var(--color-body)] hover:bg-gray-50 active:scale-[0.98]">
                Hacer otro check-in
              </button>
            </div>
          )}
        </motion.section>
      )}

      {!isSubmitted && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4" style={CARD_SHADOW}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-red-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-[var(--color-heading)] text-sm"
                style={{ letterSpacing: "-0.02em" }}>¿Necesitás ayuda inmediata?</h3>
              <p className="text-xs text-[var(--color-muted)]">No estás solo. Activá el botón para derivación automática al CVV.</p>
            </div>
          </div>
          <button
            onClick={handleCrisis}
            disabled={isLoading}
            className="w-full py-3 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "white",
              color: "#DC2626",
              border: "2px solid #FECACA",
              boxShadow: "0 2px 8px -2px rgba(220,38,38,0.1)",
            }}>
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Procesando...</>
            ) : (
              <><Phone className="w-4 h-4" />Botón de Crisis — Llamar al 188</>
            )}
          </button>
        </motion.section>
      )}

      </div>
    </PageBackground>
  );
};
