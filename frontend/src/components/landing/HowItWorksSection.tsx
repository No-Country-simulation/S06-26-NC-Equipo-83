import { useTranslation } from 'react-i18next';

export default function HowItWorksSection() {
  const { t } = useTranslation('landing');

  const steps = [
    {
      title: t('landing:howItWorks.step1'),
      number: "01",
    },
    {
      title: t('landing:howItWorks.step2'),
      number: "02",
    },
    {
      title: t('landing:howItWorks.step3'),
      number: "03",
    },
    {
      title: t('landing:howItWorks.step4'),
      number: "04",
    },
  ];
  return (
    <section
      id="como-funciona"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold">
          {t('landing:howItWorks.heading')}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl bg-[#F5F3EE] p-6"
            >
              <span className="font-bold text-[#99462A]">
                {step.number}
              </span>

              <h3 className="mt-3 text-xl font-semibold">
                {step.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}