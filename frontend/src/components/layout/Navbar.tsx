import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Cómo funciona", to: "/landing#como-funciona" },
  { label: "Sobre nosotros", to: "/landing#sobre-nosotros" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-6">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-fit items-center gap-8 rounded-2xl bg-white/90 px-5 py-3 shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] backdrop-blur-xl md:gap-12 md:px-8 md:py-4"
      >
        {/* Logo + Titulo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo-bit.webp"
            alt="App BiT"
            className="h-12 w-12 rounded-lg object-contain"
          />
          <span
            className="font-display font-extrabold tracking-tight text-[#002F68]"
            style={{ fontSize: "2.7rem", lineHeight: 1.1 }}
          >
            BiT
          </span>
        </Link>

        {/* Links de navegacion */}
        <div className="flex items-center gap-6 md:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.to}
              className="hidden text-sm font-medium text-[#1E293B] transition-colors hover:text-primary md:block"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Separator + Auth */}
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            to="/login"
            className="hidden rounded-full border border-[#c2c6d5] bg-white px-6 py-2.5 text-sm font-semibold text-[#2F75DC] shadow-sm transition-all hover:bg-gray-50 md:inline-block"
          >
            Iniciar sesión
          </Link>

          <Link
            to="/register"
            className="block rounded-full bg-[#2F75DC] px-6 py-2.5 text-sm font-semibold text-white shadow-ambient transition-all hover:bg-[#004A9E]"
          >
            Comenzar
          </Link>
        </div>
      </motion.nav>
    </header>
  );
}