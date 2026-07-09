import { useTranslation } from 'react-i18next';

export default function ServicesSection() {
  const { t } = useTranslation('landing');

  const services = [
    {
      icon: "🎓",
      title: t('landing:services.service1'),
    },
    {
      icon: "💼",
      title: t('landing:services.service2'),
    },
    {
      icon: "🎤",
      title: t('landing:services.service3'),
    },
    {
      icon: "🤝",
      title: t('landing:services.service4'),
    },
    {
      icon: "🧠",
      title: t('landing:services.service5'),
    },
  ];
  return (
    <section
      id="servicios"
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold">
          {t('landing:services.heading')}
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