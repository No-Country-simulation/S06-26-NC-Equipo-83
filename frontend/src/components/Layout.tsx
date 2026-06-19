import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Header } from '../components/Header';
import { BottomNavbar } from '../components/BottomNavbar';
import { DashboardPage } from '../modules/dashboard/dashboardPage';
import { MentalHealthPage } from '../modules/mental-health/mentalHealthPage';
import { OrientationPage } from '../modules/orientation/orientationPage';
import { UserProfilePage } from '../modules/profile/userProfilePage';

export const Layout = () => {
    //const isAuthenticated = true;
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="min-h-screen flex pb-16 flex-col bg-[#FDFBF7] text-slate-800 antialiased">
            <Header />
            
            <main className="flex-1 pt-16 pb-16 px-4 w-full max-w-md mx-auto md:max-w-2xl lg:max-w-4xl overflow-y-auto">
                <Routes>
                    {/* Rutas */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="mental-health" element={<MentalHealthPage />} />
                    <Route path="orientation" element={<OrientationPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </main>

            <BottomNavbar />
        </div>
    );
};