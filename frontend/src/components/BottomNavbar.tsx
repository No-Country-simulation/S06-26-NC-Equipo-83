import React from 'react';
import { Home, Compass, Heart, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: React.ComponentType<any>;
}

export const BottomNavbar: React.FC = () => {
    const location = useLocation();

    const navItems: NavItem[] = [
        { id: 'inicio', label: 'Inicio', path: '/dashboard', icon: Home },
        { id: 'experiencias', label: 'Experiencias', path: '/experiencias', icon: Sparkles },
        { id: 'orientacion', label: 'Orientación', path: '/orientation', icon: Compass },
        { id: 'bienestar', label: 'Bienestar', path: '/mental-health', icon: Heart },
    ];

    return (
        <nav
            aria-label="Navegación principal inferior"
            className="bg-white border-t border-gray-100 fixed bottom-0 w-full z-40 h-16 px-2 flex items-center lg:hidden"
            style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.03)" }}>
            <ul className="flex items-center justify-between w-full h-full max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.id} className="flex-1 flex justify-center">
                            <Link
                                to={item.path}
                                className="flex flex-col items-center justify-center w-full max-w-[72px] py-1 rounded-xl transition-colors duration-200 active:scale-95 focus-visible:outline-none"
                                aria-current={isActive ? 'page' : undefined}>
                                <div
                                    className={`px-3 py-1 rounded-full transition-all duration-200 flex items-center justify-center
                                        ${isActive
                                            ? 'text-white'
                                            : 'text-[var(--color-muted)] hover:text-[var(--color-body)]'
                                        }`}
                                    style={isActive ? { background: "var(--gradient-button)" } : undefined}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                                </div>
                                <span
                                    className={`text-[10px] mt-1 transition-colors duration-200 font-medium truncate w-full text-center
                                        ${isActive
                                            ? 'text-[var(--color-primary)] font-semibold'
                                            : 'text-[var(--color-muted)]'
                                        }`}>
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
