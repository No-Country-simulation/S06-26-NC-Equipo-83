import React from 'react';
import { Home, Compass, Heart, User, Handshake } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
    id: string;
    label: string;
    path: string; // Añadimos la ruta de destino
    icon: React.ComponentType<any>;
}

export const BottomNavbar: React.FC = () => {
    const location = useLocation(); // Obtenemos la ruta actual para saber qué resaltar

    const navItems: NavItem[] = [
        { id: 'inicio', label: 'Inicio', path: '/dashboard', icon: Home },
        { id: 'orientacion', label: 'Orientación', path: '/orientation', icon: Compass },
        { id: 'bienestar', label: 'Bienestar', path: '/mental-health', icon: Heart },
        { id: 'mentoría', label: 'Mentoría', path: '/mentorship', icon: Handshake },
        { id: 'perfil', label: 'Perfil', path: '/profile', icon: User },
    ];

    return (
        <nav
            aria-label="Navegación principal inferior"
            className="bg-white border-t border-gray-100 fixed bottom-0 w-full z-40 h-20 px-4 flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
        >
            <ul className="flex items-center justify-between w-full h-full max-w-md mx-auto sm:max-w-2xl lg:max-w-7xl gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Comparamos la ubicación actual con el path del ítem
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.id} className="flex-1 flex justify-center">
                            {/* Cambiamos el <button> por <Link> */}
                            <Link
                                to={item.path}
                                className="flex flex-col items-center justify-center w-full max-w-[88px] py-1.5 rounded-xl transition-all duration-200 active:scale-95 focus:ring-0 focus-visible:outline-none group"
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <div
                                    className={`px-5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center
                                        ${isActive
                                            ? 'bg-[#C87A53] text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 
                                        ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`}
                                    />
                                </div>

                                <span
                                    className={`text-[11px] mt-1 transition-colors duration-200 tracking-wide font-medium truncate w-full text-center
                                        ${isActive
                                            ? 'text-[#8B4513] font-semibold'
                                            : 'text-gray-500 font-medium'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};