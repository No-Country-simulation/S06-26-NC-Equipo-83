export default function AiSection() {
  return (
    <section className="bg-[#99462A] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold">
              Inteligencia Artificial que te acompaña
            </h2>

            <p className="text-white/80">
              Analizamos tu perfil, detectamos oportunidades
              y te ayudamos a avanzar con confianza.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="font-semibold">
                Orientación Profesional
              </h3>

              <p className="mt-2 text-white/70">
                Identificación automática de gaps.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="font-semibold">
                Bienestar Emocional
              </h3>

              <p className="mt-2 text-white/70">
                Check-ins y recomendaciones personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}