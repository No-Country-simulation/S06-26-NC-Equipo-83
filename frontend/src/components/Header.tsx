import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, User, LogOut, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLLIElement>(null);

    // Tipado básico para simular notificaciones reales más adelante
    interface NotificationItem {
        id: number;
        text: string;
        time: string;
        unread: boolean;
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Cambiado a Node para que evalúe correctamente cualquier elemento del DOM
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationsClick = () => console.log('Abrir modal de notificaciones');
    const handleSettingsClick = () => console.log('Navegar a editar perfil');
    const handleViewProfile = () => {
        setIsProfileMenuOpen(false);
        console.log('Navegar a ver perfil');
    };
    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        console.log('Cerrar sesión');
    };

    //abrir/cerrar modal de notificaciones
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    // Datos simulados alineados al core de App BiT (Bitácoras y Hábitos)
    const [notifications] = useState<NotificationItem[]>([
        { id: 1, text: "¡Felicidades! Completaste tu racha de 7 días de registro continuo.", time: "Hace 5 min", unread: true },
        { id: 2, text: "Recordatorio: Es hora de registrar tu bitácora de la tarde.", time: "Hace 2 horas", unread: true },
        { id: 3, text: "Tu resumen semanal de bienestar ya está disponible para descargar.", time: "Ayer", unread: false },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        // <header> define la cabecera global de la página
        <header className="bg-white border-b border-gray-100 fixed top-0 w-full z-40 h-16 px-4 flex items-center justify-between shadow-sm">

            {/* Sección del Logo (Envoltura semántica para la identidad del sitio) */}
            <div className="flex items-center">
                <Link to='/dashboard'>
                    <img src="/Logo.png" alt="BiT App Logo" className="w-12 h-12 object-contain" />
                </Link>
            </div>

            {/* <nav> indica que este bloque contiene elementos de navegación y acciones de usuario */}
            <nav aria-label="Navegación de cabecera e usuario" className="h-full flex items-center">
                {/* Lista semántica <ul> para agrupar las acciones disponibles */}
                <ul className="flex items-center gap-2 sm:gap-4 h-full">

                    {/* Acción: Notificaciones */}
                    <li>
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
                            aria-label="Ver notificaciones"
                        >
                            <Bell className="w-6 h-6 stroke-[1.75]" />
                        </button>
                    </li>

                    {/* Acción: Ajustes */}
                    <li>
                        <button
                            onClick={handleSettingsClick}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
                            aria-label="Ir a ajustes de perfil"
                        >
                            <Settings className="w-6 h-6 stroke-[1.75]" />
                        </button>
                    </li>

                    {/* Menú de Usuario con Dropdown */}
                    <li className="relative h-full flex items-center" ref={menuRef}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="w-10 h-10 rounded-full border-2 border-[#D2B48C] overflow-hidden bg-slate-100 flex items-center justify-center transition-transform focus:outline-none shadow-inner"
                            aria-expanded={isProfileMenuOpen}
                            aria-haspopup="menu"
                            aria-label="Menú de usuario"
                        >
                            {/* <figure> se usa para envolver contenido gráfico con significado */}
                            <figure className="w-full h-full">
                                <img
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                                    alt="Avatar del usuario logueado"
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                        </button>

                        {/* Menú flotante condicional */}
                        {isProfileMenuOpen && (
                            // Usamos un contenedor con rol de menú para accesibilidad
                            <div
                                role="menu"
                                className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150
                           w-[160px] md:w-[192px]" /* Adaptabilidad responsiva del tamaño del menú si se requiere */
                            >
                                <button
                                    role="menuitem"
                                    onClick={handleViewProfile}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors focus:bg-gray-50 focus:outline-none"
                                >
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Ver perfil</span>
                                </button>

                                <hr className="border-gray-100 my-1" role="presentation" />

                                <button
                                    role="menuitem"
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors focus:bg-red-50 focus:outline-none"
                                >
                                    <LogOut className="w-4 h-4 text-red-500" />
                                    <span>Cerrar sesión</span>
                                </button>
                            </div>
                        )}
                    </li>

                </ul>
            </nav>
            {/* ========================================================================= */}
            {/*                   MODAL SEMÁNTICO DE NOTIFICACIONES                       */}
            {/* ========================================================================= */}
            {isNotificationsOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] landscape:max-h-[68vh] landscape:mb-16 animate-in zoom-in-95 duration-200">

                        {/* Cabecera del Modal (Compactada para ganar espacio) */}
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
                            <h2 id="modal-title" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                Notificaciones
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-normal px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                                        {unreadCount} nuevas
                                    </span>
                                )}
                            </h2>
                            <button
                                onClick={() => setIsNotificationsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                                aria-label="Cerrar modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cuerpo del Modal con Scroll Interno Obligatorio */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0 custom-scrollbar">
                            {notifications.length > 0 ? (
                                <ul className="w-full">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/80 ${notif.unread ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="flex-shrink-0 mt-1.5">
                                                <span className={`block w-2 h-2 rounded-full ${notif.unread ? 'bg-indigo-600' : 'bg-transparent'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 leading-snug">{notif.text}</p>
                                                <span className="text-xs text-gray-400 block mt-1">{notif.time}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="py-8 text-center text-gray-400">
                                    <p className="text-sm">No tienes notificaciones por el momento.</p>
                                </div>
                            )}
                        </div>

                        {/* Pie del Modal (Fijo arriba del Navbar) */}
                        <div className="px-5 py-2.5 border-t border-gray-100 bg-slate-50 text-right flex-shrink-0">
                            <button
                                onClick={() => setIsNotificationsOpen(false)}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                Marcar todas como leídas
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </header >
    );
};