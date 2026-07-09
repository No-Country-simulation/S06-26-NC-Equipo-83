import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import { useAuthStore } from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";
import SEOHead from "../../components/SEOHead";

export default function Login() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const { t, i18n } = useTranslation(['auth', 'common']);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localErrorKey, setLocalErrorKey] = useState<string | null>(null);

  const errorMessage = localErrorKey ? t(localErrorKey) : storeError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalErrorKey(null);
    clearError();
    if (!email.trim()) { setLocalErrorKey('auth:validation.emailRequired'); return; }
    if (password.length < 8) { setLocalErrorKey('auth:validation.passwordMinLength'); return; }
    setIsSubmitting(true);
    try {
      await loginAction(email, password);
      navigate("/dashboard", { replace: true });
    } catch { setIsSubmitting(false); }
  };

  return (
    <>
      <SEOHead
        lang={i18n.language}
        title={t('auth:login.heading')}
        description={t('auth:login.subtitle')}
        canonicalPath="/login"
      />
      <div
        className="min-h-full flex items-center justify-center px-6 sm:px-8 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% -20%, #D6E8FF 0%, #EBF3FF 35%, #fffffe 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(47,117,220,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="absolute -top-24 right-[15%] w-56 h-56 rounded-full opacity-[0.03] bg-[#2F75DC]" />
          <div className="absolute -bottom-16 left-[10%] w-40 h-40 rounded-full opacity-[0.02] bg-[#2F75DC]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[420px] py-12 sm:py-16"
        >
          <div className="mb-8">
            <h1
              className="font-display text-[2rem] font-bold tracking-tight"
              style={{ color: "#002F68", letterSpacing: "-0.02em" }}
            >
              {t('auth:login.heading')}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#424753" }}>
              {t('auth:login.subtitle')}
            </p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2.5"
              style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {errorMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email" label={t('auth:login.emailLabel')} type="email"
              placeholder={t('auth:login.emailPlaceholder')} icon="mail"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <div>
              <Input
                id="password" label={t('auth:login.passwordLabel')} type="password"
                placeholder={t('auth:login.passwordPlaceholder')} icon="lock"
                showPasswordToggle value={password}
                onChange={(e) => setPassword(e.target.value)} required
              />
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" onClick={() => window.scrollTo(0, 0)} className="text-xs font-medium hover:underline transition-colors" style={{ color: "var(--color-primary)" }}>
                  {t('auth:login.forgotPassword')}
                </Link>
              </div>
            </div>

            <motion.button
              type="submit" disabled={isSubmitting}
              whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.985 }}
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-shadow duration-200 shadow-[0_4px_14px_-2px_rgba(47,117,220,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(47,117,220,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #2F75DC 0%, #4B8FEA 100%)" }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('auth:login.loggingIn')}</span>
              ) : (
                <span className="flex items-center gap-2">{t('auth:login.loginButton')}<ArrowRight className="w-4 h-4" /></span>
              )}
            </motion.button>

          </form>

          <p className="text-center text-sm mt-8" style={{ color: "#424753" }}>
            {t('auth:login.noAccount')}{" "}
            <Link to="/register" onClick={() => window.scrollTo(0, 0)} className="font-semibold hover:underline transition-colors" style={{ color: "var(--color-primary)" }}>
              {t('auth:login.createAccount')}
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
