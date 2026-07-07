import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Pilares", to: "#pilares" },
  { label: "Sobre BiT", to: "#sobre-bit" },
  { label: "Cómo funciona", to: "#como-funciona" },
];

const authPaths = ["/login", "/register"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isAuth = authPaths.includes(pathname);

  const navContent = (
    <>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo-bit.webp"
            alt="App BiT"
            className="h-10 w-10 rounded-lg object-contain md:h-12 md:w-12"
          />
          <span
            className="font-display font-extrabold tracking-tight text-[#002F68]"
            style={{ fontSize: "2rem", lineHeight: 1.1 }}
          >
            BiT
          </span>
        </Link>
      </div>

      <div className="hidden items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.to}
            className="text-sm font-medium text-[#1E293B] transition-colors hover:text-[#2F75DC]"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="hidden items-center gap-4 md:flex md:gap-6 ml-auto">
        <Link
          to="/login"
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#2F75DC] shadow-[inset_0_0_0_1px_#2F75DC] transition-all hover:bg-[#2F75DC]/10"
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-[#2F75DC] px-6 py-2.5 text-sm font-semibold text-white shadow-ambient transition-all hover:bg-[#004A9E]"
        >
          Comenzar
        </Link>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="ml-auto p-1.5 text-[#002F68] md:hidden"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  );

  const mobileMenu = open && (
    <div className="bg-white/95 backdrop-blur-xl md:hidden">
      <div className="flex flex-col gap-1 px-6 pb-5 pt-2 md:px-12 lg:px-20">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.to}
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-base font-medium text-[#1E293B] transition-colors hover:bg-[#2F75DC]/10 hover:text-[#2F75DC]"
          >
            {link.label}
          </a>
        ))}
        <div className="mt-3 flex flex-col gap-2 border-t border-stone-100 pt-4">
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="rounded-full bg-white px-6 py-2.5 text-center text-sm font-semibold text-[#2F75DC] shadow-[inset_0_0_0_1px_#2F75DC]"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[#2F75DC] px-6 py-2.5 text-center text-sm font-semibold text-white shadow-ambient"
          >
            Comenzar
          </Link>
        </div>
      </div>
    </div>
  );

  if (isAuth) {
    return (
      <header className="relative z-50 bg-white/90">
        <div className="mx-auto max-w-[1650px] px-6 md:px-12 lg:px-20">
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 py-3 md:gap-8 md:py-4"
          >
            {navContent}
          </motion.nav>
          {mobileMenu}
        </div>
      </header>
    );
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-0 pt-0 md:px-8 md:pt-6">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full items-center rounded-none bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl md:w-fit md:gap-12 md:rounded-2xl md:px-8 md:py-4 md:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]"
      >
        {navContent}
      </motion.nav>
      {mobileMenu}
    </header>
  );
}
