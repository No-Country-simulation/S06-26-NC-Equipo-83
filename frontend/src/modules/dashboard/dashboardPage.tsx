import React, { useState } from 'react';
import { ArrowRight, Sparkles, Smile, Brain, Lightbulb, TrendingUp, CheckCircle2 } from 'lucide-react';

// Importación unificada desde tu index.ts de mocks
import { mockSaludResponses, mockOrientarResponses } from '../../mocks';

interface MoodOption {
    id: string;
    label: string;
    emoji: string;
    bgClass: string;
}

export const DashboardPage: React.FC = () => {
    // Estados para el flujo interactivo de ánimo
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [aiResponse, setAiResponse] = useState<typeof mockSaludResponses[0] | null>(null);

    // Datos de orientación (mock de Ariel correspondiente al 70%/72.5%)
    const orientarData = mockOrientarResponses[0];

    // Lista de los 7 estados de ánimo (4 originales de la captura + 3 nuevos solicitados)
    const moods: MoodOption[] = [
        { id: 'feliz', label: 'Feliz', emoji: '😊', bgClass: 'hover:bg-yellow-50' },
        { id: 'cansado', label: 'Cansado', emoji: '🥱', bgClass: 'hover:bg-amber-50' },
        { id: 'triste', label: 'Triste', emoji: '😢', bgClass: 'hover:bg-blue-50' },
        { id: 'ansioso', label: 'Ansioso', emoji: '😰', bgClass: 'hover:bg-indigo-50' },
        { id: 'estresado', label: 'Estresado', emoji: '🤯', bgClass: 'hover:bg-orange-50' },
        { id: 'enojado', label: 'Enojado', emoji: '😡', bgClass: 'hover:bg-red-50' },
        { id: 'deprimido', label: 'Deprimido', emoji: '😔', bgClass: 'hover:bg-purple-50' },
    ];

    // Manejador del envío seguro a la IA
    const handleMoodSubmit = () => {
        if (!selectedMood) return;

        // Simulación de análisis inteligente: mapeamos variaciones usando el historial del mock de salud
        let responseIndex = 0;
        if (selectedMood === 'cansado') responseIndex = 1;
        if (selectedMood === 'triste' || selectedMood === 'deprimido') responseIndex = 2;
        if (selectedMood === 'ansioso' || selectedMood === 'estresado') responseIndex = 3;
        if (selectedMood === 'enojado') responseIndex = 4;

        setAiResponse(mockSaludResponses[responseIndex]);
        setIsSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-[#FDFBF7] py-6 px-4 font-sans antialiased text-gray-800 sm:px-6 md:py-10 lg:px-8">
            <div className="max-w-[1024px] mx-auto space-y-8">

                {/* ================= SALUDO DE BIENVENIDA ================= */}
                <header className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#A04E2D] tracking-tight">
                        ¡Hola de nuevo, Ana!
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">
                        Es un buen día para seguir creciendo profesionalmente.
                    </p>
                </header>

                {/* ================= RECUADROS PRINCIPALES (GRID RESPONSIVO) ================= */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                    {/* TARJETA IZQUIERDA: CONTROL DE ESTADO DE ÁNIMO */}
                    <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 min-h-[400px] flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-800">
                                <Smile className="w-5 h-5 text-[#A04E2D]" />
                                <h2 className="font-bold text-lg tracking-tight">¿Cómo estás hoy?</h2>
                            </div>

                            {/* Grid adaptativo para los 7 elementos */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                                {moods.map((mood) => {
                                    const isCurrent = selectedMood === mood.id;
                                    return (
                                        <button
                                            key={mood.id}
                                            onClick={() => !isSubmitted && setSelectedMood(mood.id)}
                                            disabled={isSubmitted}
                                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all group ${isCurrent
                                                    ? 'border-[#A04E2D] bg-[#FAF4EE] shadow-xs scale-105'
                                                    : 'border-gray-100 bg-white ' + mood.bgClass
                                                } ${isSubmitted ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className="text-3xl md:text-4xl transition-transform group-hover:scale-110">
                                                {mood.emoji}
                                            </span>
                                            <span className={`text-xs font-bold tracking-tight ${isCurrent ? 'text-[#A04E2D]' : 'text-gray-500'}`}>
                                                {mood.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Botón de acción con validación de seguridad */}
                        <div className="pt-4">
                            {!isSubmitted ? (
                                <button
                                    onClick={handleMoodSubmit}
                                    disabled={!selectedMood}
                                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${selectedMood
                                            ? 'bg-[#A04E2D] hover:bg-[#853F22] text-white cursor-pointer active:scale-[0.99]'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                                        }`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Analizar mi estado con IA
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 py-2 text-emerald-700 font-bold text-sm bg-emerald-50 rounded-xl border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Estado registrado exitosamente
                                </div>
                            )}
                        </div>
                    </article>

                    {/* TARJETA DERECHA: PROGRESO DEL CAMINO */}
                    <article className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[400px]">
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <h2 className="font-extrabold text-lg md:text-xl text-gray-900 tracking-tight max-w-[200px]">
                                    Tu camino hacia el éxito
                                </h2>
                                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                Cumples el <span className="font-extrabold text-emerald-700">{Math.round(orientarData.gap_porcentual)}%</span> de los requisitos para <span className="font-bold text-gray-900 block sm:inline">Desarrolladora Frontend Senior</span>.
                            </p>

                            {/* Barra de Progreso Fiel a la Captura */}
                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-[#6B8471] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${orientarData.gap_porcentual}%` }}
                                />
                            </div>
                        </div>

                        {/* Enlace o botón de navegación a la Hoja de Ruta */}
                        <div className="pt-6">
                            <button className="w-full py-3 bg-[#A04E2D] hover:bg-[#853F22] text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group">
                                Ver hoja de ruta completa
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </article>
                </section>

                {/* PIE DE TARJETA: FRASES DE INSPIRACIÓN ESTÁTICAS */}
                {!isSubmitted && (
                    <div className="bg-[#F3F6F3] rounded-xl border border-emerald-100/50 p-4 flex items-center gap-3 shadow-xs">
                        <div className="p-2 bg-white rounded-lg text-emerald-800 shadow-2xs">
                            <Lightbulb className="w-4 h-4" />
                        </div>
                        <p className="text-xs md:text-sm text-emerald-950 font-medium italic leading-snug">
                            "Pequeños pasos hoy construyen grandes futuros mañana. Tu constancia es tu mayor superpoder."
                        </p>
                    </div>
                )}

                {/* ================= SECCIÓN DINÁMICA: RECOMENDACIONES DE LA IA ================= */}
                {isSubmitted && aiResponse && (
                    <section className="bg-gradient-to-br from-[#FAF6F0] to-[#F5ECE2] rounded-2xl border border-orange-100 p-6 shadow-sm space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 text-[#853F22]">
                            <Brain className="w-5 h-5" />
                            <h3 className="font-extrabold text-base md:text-lg tracking-tight">
                                Análisis y Recomendación de AppBiT IA
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
                                {aiResponse.mensaje}
                            </p>

                            <div className="bg-white/80 backdrop-blur-xs border border-orange-100/60 rounded-xl p-4 space-y-1.5">
                                <span className="text-[10px] font-extrabold tracking-wider text-[#A04E2D] uppercase block">
                                    Acción sugerida para tu día
                                </span>
                                <p className="text-xs md:text-sm text-gray-700 font-semibold leading-normal">
                                    {aiResponse.accion_sugerida}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

            </div>
        </main>
    );
};