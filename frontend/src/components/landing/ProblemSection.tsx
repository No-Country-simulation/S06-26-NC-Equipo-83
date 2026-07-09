import { useTranslation } from 'react-i18next';

export default function ProblemSection() {
  const { t } = useTranslation('landing');

  const problems = [
    t('landing:problem.item1'),
    t('landing:problem.item2'),
    t('landing:problem.item3'),
    t('landing:problem.item4'),
    t('landing:problem.item5'),
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold">
          {t('landing:problem.heading')}
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