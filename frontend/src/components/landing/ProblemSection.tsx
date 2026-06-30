const problems = [
  "Falta de oportunidades laborales",
  "Networking limitado",
  "Baja autoestima profesional",
  "Falta de acompañamiento",
  "Dificultad para encontrar formación adecuada",
];

export default function ProblemSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Entendemos los desafíos reales
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {problems.map((problem) => (
            <article
              key={problem}
              className="rounded-2xl border border-[#dbc1b9] bg-white p-6"
            >
              {problem}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}