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
    <footer className="mt-12 w-full md:mt-20" style={{ background: "linear-gradient(180deg, var(--color-brand-light) 0%, var(--color-accent-soft) 100%)" }}>
      <div className="mx-auto max-w-container-wide px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Columna 1: Logo + descripcion */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-bit.webp" alt="App BiT" className="h-8 w-8 rounded-lg object-contain" />
              <span className="font-display text-xl font-extrabold tracking-tight text-text-primary">BiT</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-body">
              Te acompañamos con aprendizaje, mentorías, oportunidades y bienestar para que crezcas a tu ritmo.
            </p>
            <Link to="/register" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:underline">
              Comenzar ahora <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-primary">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.to} className="text-sm text-text-body transition-colors hover:underline">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border-default pt-6 text-center text-xs text-text-muted md:mt-16">
          © {new Date().getFullYear()} App BiT. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
