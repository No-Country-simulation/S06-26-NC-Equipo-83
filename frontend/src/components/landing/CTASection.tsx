import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-6 text-5xl font-bold">
          Tu próximo paso comienza hoy
        </h2>

        <p className="mb-8 text-lg text-slate-600">
          Únete a App BiT y descubre oportunidades diseñadas
          para tu crecimiento.
        </p>

        <Link
          to="/register"
          className="inline-flex rounded-full bg-[#99462A] px-8 py-4 font-semibold text-white"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </section>
  );
}