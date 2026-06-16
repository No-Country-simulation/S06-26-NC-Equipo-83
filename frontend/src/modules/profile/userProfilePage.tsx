import React from 'react';
import {
    User,
    MapPin,
    Briefcase,
    FileText,
    Settings,
    Lock,
    Bell,
    Eye,
    Trash2,
    Globe,
    Calendar,
    Check,
    Camera
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
    return (
        <main className="min-h-screen bg-[#F9F6F0]/40 pb-24 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-gray-800">
            {/* Contenedor Principal Adaptable */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* =========================================================================
            COLUMNA IZQUIERDA (ASIDE)
           ========================================================================= */}
                <aside className="lg:col-span-4 space-y-6 w-full">

                    {/* Tarjeta de Presentación / Avatar */}
                    <article className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative group mb-4">
                            <div className="w-28 h-28 rounded-full p-0.5 border border-amber-800/20 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                                    alt="Foto de perfil de Ana García"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            {/* Botón de edición flotante */}
                            <button
                                type="button"
                                aria-label="Cambiar foto de perfil"
                                className="absolute bottom-1 right-1 bg-[#A04E2D] text-white p-2 rounded-full shadow-md hover:bg-[#853F22] transition-colors"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 mb-1">Ana García</h1>
                        <span className="inline-block bg-[#FDF2EC] text-[#A04E2D] text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-[#F5DFD3]">
                            Plan Premium
                        </span>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            Enfocada en el crecimiento profesional y el bienestar emocional.
                        </p>
                    </article>

                    {/* Tarjeta de Configuración de Idioma */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Configuración de Idioma
                        </h2>
                        <div className="space-y-2">
                            {/* Opción Seleccionada (Español) */}
                            <button type="button" className="w-full flex items-center justify-between p-3 rounded-xl border border-[#A04E2D]/30 bg-[#FDF2EC]/40 text-[#A04E2D] font-medium text-sm transition-colors text-left">
                                <span className="flex items-center gap-2.5">
                                    <Globe className="h-4 w-4 text-[#A04E2D]" /> Español (ES)
                                </span>
                                <span className="bg-[#A04E2D] text-white rounded-full p-0.5">
                                    <Check className="h-3 w-3" />
                                </span>
                            </button>

                            {/* Opción Portugués */}
                            <button type="button" className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors text-left">
                                <Globe className="h-4 w-4 text-gray-400 mr-2.5" /> Português (PT)
                            </button>

                            {/* Opción Inglés */}
                            <button type="button" className="w-full flex items-center p-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors text-left">
                                <Globe className="h-4 w-4 text-gray-400 mr-2.5" /> Inglés (EN)
                            </button>
                        </div>
                    </section>
                </aside>

                {/* =========================================================================
            COLUMNA DERECHA (CONTENIDO PRINCIPAL)
           ========================================================================= */}
                <div className="lg:col-span-8 space-y-6 w-full">

                    {/* SECCIÓN 1: Datos Personales */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
                            <User className="text-[#A04E2D] h-5 w-5" />
                            <h2 className="text-base font-bold text-gray-900">Datos Personales</h2>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Nombre completo</label>
                                <input type="text" readOnly value="Ana García" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Correo electrónico</label>
                                <input type="email" readOnly value="ana.garcia@example.com" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">WhatsApp</label>
                                <input type="text" readOnly value="+34 600 000 000" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">Fecha de nacimiento</label>
                                <div className="relative">
                                    <input type="text" readOnly value="15/05/1992" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 2: Ubicación */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
                            <MapPin className="text-[#A04E2D] h-5 w-5" />
                            <h2 className="text-base font-bold text-gray-900">Ubicación</h2>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Continente</label>
                                <input type="text" readOnly value="Europa" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">País</label>
                                <input type="text" readOnly value="España" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Ciudad</label>
                                <input type="text" readOnly value="Madrid" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 3: Perfil Profesional */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
                            <Briefcase className="text-[#A04E2D] h-5 w-5" />
                            <h2 className="text-base font-bold text-gray-900">Perfil Profesional</h2>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Nivel Educativo</label>
                                <input type="text" readOnly value="Grado Universitario" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Nivel Profesional</label>
                                <input type="text" readOnly value="Senior" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Área Tecnológica</label>
                                <input type="text" readOnly value="Desarrollo Web (Frontend)" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Objetivo de Carrera</label>
                                <input type="text" readOnly value="Liderazgo Técnico (Tech Lead)" className="w-full px-4 py-2.5 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-800 outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 4: Biografía / Intereses */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-5">
                            <FileText className="text-[#A04E2D] h-5 w-5" />
                            <h2 className="text-base font-bold text-gray-900">Biografía / Intereses</h2>
                        </header>

                        <div className="space-y-4">
                            <textarea
                                readOnly
                                rows={3}
                                value="Apasionada por crear interfaces de usuario accesibles y centradas en el ser humano. Busco equilibrar mi carrera técnica con prácticas de mindfulness."
                                className="w-full p-4 bg-[#F4F1EC]/60 rounded-xl text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed"
                            />

                            <div className="flex justify-end">
                                <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-[#A04E2D] hover:bg-[#853F22] text-white font-medium text-sm rounded-full shadow-sm transition-all duration-200 active:scale-[0.99]">
                                    Guardar cambios
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 5: Ajustes de Cuenta */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3 mb-4">
                            <Settings className="text-[#A04E2D] h-5 w-5" />
                            <h2 className="text-base font-bold text-gray-900">Ajustes de Cuenta</h2>
                        </header>

                        <div className="divide-y divide-gray-100">
                            {/* Contraseña */}
                            <div className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="bg-emerald-50 text-emerald-600 rounded-full p-2 mt-0.5">
                                        <Lock className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Contraseña</h3>
                                        <p className="text-xs text-gray-400 font-medium">Cambiada hace 3 meses</p>
                                    </div>
                                </div>
                                <button type="button" className="text-xs font-bold text-[#A04E2D] hover:underline">Actualizar</button>
                            </div>

                            {/* Notificaciones */}
                            <div className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="bg-emerald-50 text-emerald-600 rounded-full p-2 mt-0.5">
                                        <Bell className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                                        <p className="text-xs text-gray-400 font-medium">Alertas de comunidad y mensajes</p>
                                    </div>
                                </div>
                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer" aria-label="Alternar notificaciones">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {/* Privacidad */}
                            <div className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="bg-emerald-50 text-emerald-600 rounded-full p-2 mt-0.5">
                                        <Eye className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">Privacidad</h3>
                                        <p className="text-xs text-gray-400 font-medium">Perfil público para la comunidad</p>
                                    </div>
                                </div>
                                {/* Toggle Switch */}
                                <label className="relative inline-flex items-center cursor-pointer" aria-label="Alternar privacidad">
                                    <input type="checkbox" defaultChecked className="sr-only peer" />
                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>

                            {/* Eliminar Cuenta */}
                            <div className="py-4 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className="bg-rose-50 text-rose-600 rounded-full p-2 mt-0.5">
                                        <Trash2 className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-rose-600">Eliminar cuenta</h3>
                                        <p className="text-xs text-gray-400 font-medium">Borrar permanentemente tus datos</p>
                                    </div>
                                </div>
                                <button type="button" className="text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors">Gestionar</button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
};