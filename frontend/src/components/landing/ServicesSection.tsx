const services = [
  {
    icon: "🎓",
    title: "Formación",
  },
  {
    icon: "💼",
    title: "Empleabilidad",
  },
  {
    icon: "🎤",
    title: "Experiencias",
  },
  {
    icon: "🤝",
    title: "Mentorías",
  },
  {
    icon: "🧠",
    title: "Salud Mental",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="servicios"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Los 5 pilares de App BiT
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-5xl">
                {service.icon}
              </div>

              <h3 className="mt-4 text-xl font-semibold">
                {service.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}