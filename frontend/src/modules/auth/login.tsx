import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import logoApp from "../../assets/Logo.png";
import { useAuthStore } from "../../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const loginAction = useAuthStore((s) => s.login);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessage = localError || storeError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError("El email es obligatorio.");
      return;
    }
    if (password.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await loginAction(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto h-screen w-full bg-background flex items-center justify-center overflow-hidden lg:p-6">
      <section className="w-full max-w-6xl h-full md:h-[85vh] md:max-h-[750px] bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row lg:rounded-3xl">
        <aside className="relative hidden md:flex md:w-1/2 h-full">
          <img
            src="/heroLogin.png"
            alt="Espacio de trabajo colaborativo"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/15 bg-black/30" />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full w-full bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-base text-stone-200">
              Un espacio diseñado para impulsar tu crecimiento profesional y tu
              bienestar.
            </p>
          </div>
        </aside>

        <section className="w-full md:w-1/2 h-full flex flex-col bg-white overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center items-stretch mx-auto w-full max-w-md p-6 sm:p-10 md:p-12">
            <div className="mb-6 flex justify-center flex-shrink-0 h-16">
              <Link to="/" className="h-full">
                <img
                  src={logoApp}
                  alt="BiT App Logo"
                  className="h-full w-auto object-contain block"
                />
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              <Input
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="nombre@ejemplo.com"
                icon="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="Escribe tu contraseña"
                  icon="lock"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#99462A] hover:text-stone-600 z-10"
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#99462A] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#99462A] hover:bg-[#823a22] text-white font-semibold rounded-xl transition-colors shadow-md mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-4 text-xs text-stone-400 font-medium tracking-wider uppercase">
                  O continuar con
                </span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-700 font-medium text-sm transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-700 font-medium text-sm transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center flex-shrink-0 pb-2">
              <p className="text-sm text-stone-600">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/register"
                  className="text-[#99462A] font-semibold hover:underline"
                >
                  Crear una cuenta
                </Link>
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
