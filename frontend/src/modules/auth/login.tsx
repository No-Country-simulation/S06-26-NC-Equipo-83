// modules/auth/Login.tsx

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl overflow-hidden bg-white lg:my-6 lg:rounded-3xl lg:shadow-xl">
        <div className="flex min-h-screen flex-col md:flex-row">   
            <aside className="relative hidden overflow-hidden md:flex md:w-1/2">
              <img
                src="/heroLogin.png"
                alt="Espacio de trabajo colaborativo"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-primary/15" />

              <div className="absolute bottom-16 left-16 max-w-md text-white">
                <h1 className="mb-4 text-5xl font-bold text-white">
                  Bienvenido de nuevo
                </h1>

                <p className="text-lg">
                  Un espacio diseñado para impulsar tu crecimiento profesional y tu
                  bienestar.
                </p>
              </div>
            </aside>

            
            <section className="flex w-full items-center justify-center px-5 py-10 md:w-1/2">
              <div className="w-full max-w-lg">
                <div className="mb-4 text-center justify-between">
                  <h1 className="text-3xl font-bold">
                    Iniciar sesión
                  </h1>

                  <p className="mt-2 text-muted-foreground">
                    Ingresa tus credenciales para continuar.
                  </p>
                </div>

                <form className="space-y-5">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Correo electrónico
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium"
                      >
                        Contraseña
                      </label>

                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-14 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-700"
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
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="h-14 w-full rounded-full bg-primary font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
                  >
                    Iniciar sesión
                  </button>
                </form>

                {/* Separador */}
                <div className="my-8 flex items-center">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="mx-4 text-sm text-gray-500">
                    o accede con
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Login social */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50"
                  >
                    Google
                  </button>

                  <button
                    type="button"
                    className="flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-50"
                  >
                    LinkedIn
                  </button>
                </div>

                <p className="mt-10 text-center text-sm text-gray-600">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Crear una cuenta
                  </Link>
                </p>
              </div>
            </section>
        </div>
      </section>
    </main>
  );
}