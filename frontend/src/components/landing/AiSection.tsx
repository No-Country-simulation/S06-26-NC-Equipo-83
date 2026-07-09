import { useTranslation } from 'react-i18next';

export default function AiSection() {
  const { t } = useTranslation('landing');
  return (
    <section className="bg-[#99462A] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold">
              {t('landing:ai.heading')}
            </h2>

            <p className="text-white/80">
              {t('landing:ai.description')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="font-semibold">
                {t('landing:ai.card1Title')}
              </h3>

              <p className="mt-2 text-white/70">
                {t('landing:ai.card1Description')}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6">
              <h3 className="font-semibold">
                {t('landing:ai.card2Title')}
              </h3>

              <p className="mt-2 text-white/70">
                {t('landing:ai.card2Description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}