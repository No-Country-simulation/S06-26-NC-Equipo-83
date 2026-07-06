import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Pilares", to: "#pilares" },
  { label: "Sobre BiT", to: "#sobre-bit" },
  { label: "Cómo funciona", to: "#como-funciona" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-0 pt-0 md:px-8 md:pt-6">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex w-full items-center rounded-none bg-white/90 px-4 py-3 shadow-nav-mobile backdrop-blur-xl md:w-fit md:gap-12 md:rounded-2xl md:px-8 md:py-4 md:shadow-nav"
      >
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-bit.webp" alt="App BiT" className="h-10 w-10 rounded-lg object-contain md:h-12 md:w-12" />
          <span className="font-display font-extrabold tracking-tight text-text-primary" style={{ fontSize: "2rem", lineHeight: 1.1 }}>BiT</span>
        </Link>

        <div className="flex-1 md:hidden" />

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex md:gap-8">
          {navLinks.map((link) => (
            <a key={link.label} href={link.to} className="text-sm font-medium text-text-nav transition-colors hover:text-brand">
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-4 md:flex md:gap-6">
          <Link to="/login" className="btn-outline px-6 py-2.5 text-sm">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn-primary px-6 py-2.5 text-sm shadow-ambient hover:shadow-ambient-lg">
            Comenzar
          </Link>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="ml-4 p-1.5 text-text-primary md:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      {open && (
        <div className="bg-white/95 backdrop-blur-xl shadow-nav-mobile md:hidden">
          <div className="flex flex-col gap-1 px-4 pb-5 pt-2">
            {navLinks.map((link) => (
              <a key={link.label} href={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-base font-medium text-text-nav transition-colors hover:bg-brand/10 hover:text-brand">
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border-default pt-4">
              <Link to="/login" onClick={() => setOpen(false)} className="btn-outline px-6 py-2.5 text-center text-sm">
                Iniciar sesión
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary px-6 py-2.5 text-center text-sm shadow-ambient">
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
