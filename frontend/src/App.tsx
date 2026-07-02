import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import { Layout } from "./components/Layout";
import { Publiclayout } from "./components/Publiclayout";
import Landing from "./modules/landing/Landing";
import Login from "./modules/auth/login";
import Register from "./modules/auth/register";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas: Landing es la raíz */}
          <Route element={<Publiclayout />}>
            <Route path="/landing" element={<Landing />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Rutas Privadas: Gestionadas por Layout */}
          <Route path="/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
