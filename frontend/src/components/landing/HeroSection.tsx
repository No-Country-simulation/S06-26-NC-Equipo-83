import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

export default function HeroSection() {
  const { t } = useTranslation('landing');
  return (
    <section className="bg-[#FBF9F4]">
      <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-center px-6 py-20 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <span className="mb-4 inline-block rounded-full bg-[#99462A]/10 px-4 py-2 text-sm font-medium text-[#99462A]">
            {t('landing:hero.badge')}
          </span>

          <h1 className="mb-6 text-5xl font-bold leading-tight">
            {t('landing:hero.title')}
          </h1>

          <p className="mb-8 max-w-xl text-lg text-slate-600">
            {t('landing:hero.subtitle')}
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-full bg-[#99462A] px-8 py-4 text-center font-semibold text-white"
            >
              {t('landing:hero.cta')}
            </Link>

            <a
              href="#como-funciona"
              className="rounded-full border border-[#99462A] px-8 py-4 text-center font-semibold text-[#99462A]"
            >
              {t('landing:hero.ctaSecondary')}
            </a>
          </div>
        </div>

        <div className="mt-12 flex-1 lg:mt-0">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#F5F3EE] p-5">
                <p className="text-sm text-slate-500">
                  {t('landing:hero.compatLabel')}
                </p>

                <h3 className="text-3xl font-bold text-[#99462A]">
                  70%
                </h3>
              </div>

              <div className="rounded-2xl bg-[#C9E7CD] p-5">
                {t('landing:hero.trayectoryLabel')}
                <strong className="block mt-2">
                  {t('landing:hero.trayectoryRole')}
                </strong>
              </div>

              <div className="rounded-2xl bg-[#F5F3EE] p-5">
                {t('landing:hero.moodLabel')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}