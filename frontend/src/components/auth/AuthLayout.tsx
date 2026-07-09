import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../ui/Logo";

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  const { t } = useTranslation("auth");
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-white lg:my-6 lg:rounded-3xl lg:shadow-xl">
        <aside className="relative hidden w-1/2 lg:flex">
          <img
            src="/images/auth/login-cover.webp"
            alt={t('auth:layout.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-primary/10" />

          <div className="absolute left-10 top-10">
            <Logo />
          </div>

          <div className="absolute bottom-10 left-10 right-10 rounded-2xl bg-white/80 p-6 backdrop-blur">
            <h2 className="mb-2 text-3xl font-bold text-primary">
              {t('auth:layout.heading')}
            </h2>

            <p className="text-gray-700">
              {t('auth:layout.description')}
            </p>
          </div>
        </aside>

        <section className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo />
            </div>

            {children}
          </div>
        </section>
      </section>
    </main>
  );
}