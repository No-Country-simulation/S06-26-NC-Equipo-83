import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#dbc1b9] bg-[#FBF9F4]/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-[#99462A]"
        >
          App BiT
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#servicios" className="hover:text-[#99462A]">
            Servicios
          </a>

          <a href="#como-funciona" className="hover:text-[#99462A]">
            Cómo funciona
          </a>

          <Link
            to="/login"
            className="font-medium hover:text-[#99462A]"
          >
            Ingresar
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-[#99462A] px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}