import { Outlet } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

export const Publiclayout = () => {
    return (
        <div className="min-h-screen flex pb-16 flex-col text-on-surface antialiased" style={{ backgroundColor: "#fffffe" }}>
            <Navbar />
            
            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};
          