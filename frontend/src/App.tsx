import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Login from "./modules/auth/login";
import Register from "./modules/auth/register";
import { Layout } from "./components/Layout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* MUNDO PÚBLICO: Envolvemos las vistas con AuthLayout */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/register" element={<Register />} />

          {/* MUNDO PRIVADO: Tu layout que ya tiene la lógica de protección */}
          <Route path="/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}