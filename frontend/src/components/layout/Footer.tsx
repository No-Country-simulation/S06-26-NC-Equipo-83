import { Link, useLocation } from "react-router-dom";
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

const authPaths = ["/login", "/register"];

export default function Footer() {
  const { pathname } = useLocation();
  const isAuth = authPaths.includes(pathname);

  const renderLink = (link: { label: string; to: string }, className: string) => {
    if (link.to === "#" || link.to === "#!") {
      return (
        <span className={className} style={{ color: "#424753", cursor: "default" }}>
          {link.label}
        </span>
      );
    }
    if (isAuth) {
      return (
        <Link to={`/${link.to}`} className={className} style={{ color: "#424753" }}>
          {link.label}
        </Link>
      );
    }
    return (
      <a href={link.to} className={className} style={{ color: "#424753" }}>
        {link.label}
      </a>
    );
  };

  return (
    <footer className="mt-12 w-full md:mt-20" style={{ background: "linear-gradient(180deg, #C4DDFB 0%, #FFF5E0 100%)" }}>
      <div className="mx-auto max-w-[1650px] px-6 py-12 md:px-12 md:py-16 lg:px-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
            {!isAuth && (
              <Link
                to="/register"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
                style={{ color: "#2F75DC" }}
              >
                Comenzar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "#002F68" }}>
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {renderLink(link, "text-sm transition-colors hover:underline")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs md:mt-16" style={{ borderTopColor: "#E8E4DD", color: "#94A3B8" }}>
          © {new Date().getFullYear()} App BiT. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
