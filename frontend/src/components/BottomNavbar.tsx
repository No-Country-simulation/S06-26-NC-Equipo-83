import React, { useState } from 'react';
import { Home, Compass, Heart, User } from 'lucide-react';

// Tipado estricto para asegurar la estructura de los elementos de navegación
interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
}

export const BottomNavbar: React.FC = () => {
    // Estado para controlar qué pantalla/pestaña está activa en el MVP
    const [activeTab, setActiveTab] = useState<string>('inicio');

    // Configuración oficial de módulos con términos cortos e iconos semánticos
    const navItems: NavItem[] = [
        {
            id: 'inicio',
            label: 'Inicio',
            icon: Home
        },
        {
            id: 'orientacion',
            label: 'Orientación', // Representa la pantalla unificada de Orientación y Empleabilidad
            icon: Compass        // Brújula: ideal para guiar el camino profesional
        },
        {
            id: 'bienestar',
            label: 'Bienestar',   // Enfoque amigable y positivo para Salud Mental
            icon: Heart          // Corazón: transmite balance y cuidado integral
        },
        {
            id: 'perfil',
            label: 'Perfil',
            icon: User
        },
    ];

    return (
        // <nav> semántico posicionado de forma fija en la base. 
        // Mantiene un z-index alto para quedar siempre por encima del scroll del contenido.
        <nav
            aria-label="Navegación principal inferior"
            className="bg-white border-t border-gray-100 fixed bottom-0 w-full z-40 h-20 px-4 flex items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
        >

            {/* <ul> Lista semántica que agrupa los botones. Controla los anchos según breakpoints del PM */}
            <ul className="flex items-center justify-between w-full h-full max-w-md mx-auto sm:max-w-2xl lg:max-w-7xl gap-1">

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <li key={item.id} className="flex-1 flex justify-center">
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className="flex flex-col items-center justify-center w-full max-w-[88px] py-1.5 rounded-xl transition-all duration-200 active:scale-95 focus:ring-0 focus-visible:outline-none group"
                                aria-current={isActive ? 'page' : undefined}
                            >

                                {/* Contenedor del Icono: Dibuja la píldora/ovalo con el color tierra original si está activo */}
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

                                {/* Texto descriptivo inferior con tamaño optimizado y truncado de seguridad */}
                                <span
                                    className={`text-[11px] mt-1 transition-colors duration-200 tracking-wide font-medium truncate w-full text-center
                    ${isActive
                                            ? 'text-[#8B4513] font-semibold' // Tono café oscuro para garantizar el contraste de lectura
                                            : 'text-gray-500 font-medium'
                                        }`}
                                >
                                    {item.label}
                                </span>

                            </button>
                        </li>
                    );
                })}

            </ul>
        </nav>
    );
};