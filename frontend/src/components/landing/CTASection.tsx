import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

export default function CTASection() {
  const { t } = useTranslation('landing');
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-6 text-5xl font-bold">
          {t('landing:cta.heading')}
        </h2>

        <p className="mb-8 text-lg text-slate-600">
          {t('landing:cta.description')}
        </p>

        <Link
          to="/register"
          className="inline-flex rounded-full bg-[#99462A] px-8 py-4 font-semibold text-white"
        >
          {t('landing:cta.button')}
        </Link>
      </div>
    </section>
  );
}