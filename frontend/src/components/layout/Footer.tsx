import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const footerLinks = {
  producto: [
    { label: "Pilares", to: "#pilares" },
    { label: "Cómo funciona", to: "#como-funciona" },
    { label: "Sobre BiT", to: "#sobre-bit" },
  ],
  recursos: [
    { label: "Blog", to: "#" },
    { label: "Centro de ayuda", to: "#" },
    { label: "Comunidad", to: "#" },
  ],
  legal: [
    { label: "Privacidad", to: "#" },
    { label: "Términos", to: "#" },
    { label: "Cookies", to: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-12 w-full md:mt-20" style={{ background: "linear-gradient(180deg, #C4DDFB 0%, #FFF5E0 100%)" }}>
      <div className="mx-auto max-w-[1650px] px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Columna 1: Logo + descripcion */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo-bit.webp"
                alt="App BiT"
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="font-display text-xl font-extrabold tracking-tight" style={{ color: "#002F68" }}>
                BiT
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "#424753" }}>
              Te acompañamos con aprendizaje, mentorías, oportunidades y bienestar para que crezcas a tu ritmo.
            </p>
            <Link
              to="/register"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
              style={{ color: "#2F75DC" }}
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Columnas de links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "#002F68" }}>
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.to}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: "#424753" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-6 text-center text-xs md:mt-16" style={{ borderTopColor: "#E8E4DD", color: "#94A3B8" }}>
          © {new Date().getFullYear()} App BiT. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
