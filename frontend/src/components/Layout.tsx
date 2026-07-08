import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Header } from '../components/Header';
import { BottomNavbar } from '../components/BottomNavbar';
import { DashboardPage } from '../modules/dashboard/dashboardPage';
import { MentalHealthPage } from '../modules/mental-health/mentalHealthPage';
import { OrientationPage } from '../modules/orientation/orientationPage';
import { UserProfilePage } from '../modules/profile/userProfilePage';
import { MentorshipPage } from '../modules/mentorship/mentorshipPage';
import { ExperienciasPage } from '../modules/experiencias/experienciasPage';
import { CreateEventPage } from '../modules/experiencias/createEventPage';

export const Layout = () => {
    //const isAuthenticated = true;
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/landing" replace />;

    return (
        <div className="min-h-screen flex pb-16 lg:pb-0 flex-col antialiased" style={{ backgroundColor: "var(--color-page-bg)", color: "var(--color-body)" }}>
            <Header />
            
            <main className="flex-1 pt-16 pb-16 lg:pb-8 px-4 w-full mx-auto overflow-y-auto lg:max-w-[1300px]">
                <Routes>
                    {/* Rutas */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="mental-health" element={<MentalHealthPage />} />
                    <Route path="orientation" element={<OrientationPage />} />
                    <Route path="mentorship" element={<MentorshipPage />} />
                    <Route path="experiencias" element={<ExperienciasPage />} />
                    <Route path="experiencias/crear" element={<CreateEventPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
            </main>

            <BottomNavbar />
        </div>
    );
};