import React from 'react';
import { Header } from '../components/Header';
import { BottomNavbar } from '../components/BottomNavbar';
//import { UserProfilePage } from '../modules/profile/userProfilePage';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
            {/* 1. Header Semántico superior fijo */}
            <Header />

            {/* 2. Contenido dinámico de la pantalla activa */}
            {/* pt-16 evita que el Header tape el contenido, pb-16 evita que lo tape el BottomNavbar */}
            <main className="flex-1 pt-16 pb-16 px-4 w-full max-w-md mx-auto overflow-y-auto">
                {children}
            </main>

            {/* 3. Barra de navegación inferior móvil fija */}
            <BottomNavbar />
        </div>
    );
};