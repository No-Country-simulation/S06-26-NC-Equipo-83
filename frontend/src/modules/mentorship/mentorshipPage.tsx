import  { useState } from 'react';
import { Calendar, Video, User, Star, X, Search } from 'lucide-react';

interface Mentor {
    id: number;
    name: string;
    role: string;
    rating: number;
    sessions: number;
    description: string;
    tags: string[];
}

const mentors: Mentor[] = [

    { id: 1, name: 'Ana Martínez', role: 'SENIOR FRONTEND ENGINEER', rating: 4.9, sessions: 48, description: 'Apasionada por crear interfaces accesibles y mentorizar a nuevos talentos en el ecosistema de JavaScript.', tags: ['React', 'TypeScript', 'Career Growth'] },

    { id: 2, name: 'Carlos Ruiz', role: 'DATA SCIENCE LEAD', rating: 5.0, sessions: 32, description: 'Especialista en modelos predictivos y Big Data. Mi enfoque es ayudarte a transicionar al mundo de los datos.', tags: ['Python', 'Machine Learning', 'Soft Skills'] },

    { id: 3, name: 'Elena Gomez', role: 'U/I DESIGN MENTOR', rating: 4.8, sessions: 25, description: 'Enfocada en el diseño centrado en el usuario. Te ayudare a que puedas construir un portafolio de calidad impactante.', tags: ['Figma', 'Disegn Systems', 'UX Research'] },

    { id: 4, name: 'Diego Forlán', role: 'BACKEND ARCHITECT', rating: 5.0, sessions: 64, description: 'Especialista en arquitecturas escalables y microservicios con Go y Node.js. Mi misión es ayudarte a pensar de forma sistemática en la estructura backend de tu proyecto.', tags: ['Go', 'Microservices', 'System Design'] }

];

export const MentorshipPage = () => {
    const [modalData, setModalData] = useState<{ isOpen: boolean; type: 'schedule' | 'profile' | null; mentor: Mentor | null }>({
        isOpen: false,
        type: null,
        mentor: null
    });

    const openModal = (mentor: Mentor, type: 'schedule' | 'profile') => setModalData({ isOpen: true, type, mentor });
    const closeModal = () => setModalData({ isOpen: false, type: null, mentor: null });

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-sans text-gray-900">
            <header className="max-w-7xl mx-auto mb-8">
                <h1 className="text-black text-3xl font-bold mb-2">Encuentra tu Mentor</h1>
                <p className="text-gray-600">Conecta con profesionales que te guiarán en tu crecimiento tecnológico.</p>
            </header>

            <main className="w-full grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8">
                <section className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="text" placeholder="Ej. React, Backend, Arquitectura..." className="w-full pl-10 p-3 bg-gray-50 rounded-xl outline-none border border-gray-100" />
                        </div>
                        <select className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"><option>Área Tecnológica</option></select>
                        <select className="p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"><option>Nivel Profesional</option></select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mentors.map((mentor) => (
                            <article key={mentor.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center"><User className="text-gray-500" /></div>
                                    <div>
                                        <h3 className="font-bold text-lg">{mentor.name}</h3>
                                        <p className="text-[10px] font-bold text-[#8B3D25] tracking-widest">{mentor.role}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500"><Star size={12} className="fill-yellow-400 text-yellow-400" /> {mentor.rating} ({mentor.sessions} sesiones)</div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mentor.description}</p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {mentor.tags.map(tag => <span key={tag} className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-xs font-semibold">{tag}</span>)}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(mentor, 'schedule')} className="flex-1 bg-[#8B3D25] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#6d301d]">Agendar Sesión</button>
                                    <button onClick={() => openModal(mentor, 'profile')} className="flex-1 border border-gray-300 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">Ver Perfil</button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="bg-[#D97757]/50 p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                            <Calendar size={20} /> Mis Próximas Sesiones
                        </h2>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner">
                            <span className="text-[10px] font-bold bg-gray-200 px-2 py-0.5 rounded uppercase">Mañana</span>
                            <p className="font-bold text-sm mt-1 text-gray-900">Ana Martínez</p>
                            <p className="text-xs text-gray-500">Revisión de Portafolio • 17:00 - 18:00</p>
                            <button className="w-full mt-3 bg-[#D97757] text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                <Video size={16} /> Unirse a llamada
                            </button>
                        </div>
                    </div>
                    <div className="bg-[#E8F5E9] p-6 rounded-2xl border border-[#C8E6C9]">
                        <h2 className="font-bold text-sm mb-2 text-[#2E7D32]">Progreso de Mentoría</h2>
                        <div className="w-full bg-[#C8E6C9] h-2 rounded-full overflow-hidden"><div className="bg-[#2E7D32] h-2 w-[80%]"></div></div>
                        <p className="text-xs text-[#2E7D32] mt-2 font-medium">Has completado 12 de tus 15 horas mensuales. ¡Sigue así!</p>
                    </div>
                </aside>
            </main>

            {modalData.isOpen && modalData.mentor && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl relative">
                        <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X /></button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">
                            {modalData.type === 'schedule' ? 'Agendar Sesión' : 'Perfil Profesional'}
                        </h2>

                        {modalData.type === 'schedule' ? (
                            <div className="space-y-6">
                                <p className="text-gray-600">
                                    Selecciona un horario disponible para mentoría con <span className="font-bold text-gray-900">{modalData.mentor.name}</span>.
                                </p>

                                {/* Selector de Fecha y Hora */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Fecha</label>
                                        <input type="date" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Hora</label>
                                        <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none">
                                            <option>10:00 AM</option>
                                            <option>02:00 PM</option>
                                            <option>04:00 PM</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="flex-1 py-3 bg-[#8B3D25] text-white rounded-xl font-bold hover:bg-[#6d301d] transition"
                                    >
                                        Confirmar Sesión
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"><User size={32} /></div>
                                    <div>
                                        <h3 className="font-bold text-lg">{modalData.mentor.name}</h3>
                                        <p className="text-sm text-[#8B3D25] font-bold">{modalData.mentor.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">{modalData.mentor.description}</p>
                                <div className="text-sm text-gray-500 font-medium pt-2">Sesiones completadas: {modalData.mentor.sessions}</div>
                                <button onClick={closeModal} className="mt-8 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition">Cerrar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};