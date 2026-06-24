import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";

import RegisterStep1 from "./registerSteps/registerStep1";
import RegisterStep2 from "./registerSteps/registerStep2";
import RegisterStep3 from "./registerSteps/registerStep3";

import { useAuthStore } from "../../store/useAuthStore";
import { mapRegisterFormToApi } from "../../lib/fieldMappings";

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((s) => s.register);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessage = localError || storeError;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    birthDate: "",
    gender: "",
    educationLevel: "",
    continent: "",
    country: "",
    state: "",
    city: "",
    phoneCode: "+54",
    whatsapp: "",
    experienceLevel: "",
    technologyArea: "",
    currentGoal: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setLocalError(null);
    setStep((prev) => Math.min(prev + 1, 3));
  };
  const previousStep = () => {
    setLocalError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      const apiData = mapRegisterFormToApi(formData);
      await registerAction(apiData);
      navigate("/dashboard", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-full bg-background flex items-center justify-center overflow-hidden lg:p-6">
      <section className="w-full max-w-6xl h-full md:h-[85vh] md:max-h-[750px] bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row lg:rounded-3xl">
        <aside className="relative hidden md:flex md:w-1/2 h-full">
          <img
            src="/heroRegister.png"
            alt="Comienza tu viaje en BiT"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full w-full bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
              Comienza tu viaje en BiT
            </h1>
            <p className="text-base text-stone-200">
              Un espacio seguro diseñado para guiarte en tu orientación
              personal con un enfoque humano y empático.
            </p>
          </div>
        </aside>

        <section className="w-full md:w-1/2 flex flex-col h-full p-6 sm:p-10 md:p-12 overflow-hidden">
          <div className="flex-shrink-0 space-y-4 mb-4">
            <div className="flex items-center justify-between md:hidden">
              <Link to="/" className="flex items-center">
                <img
                  src="/Logo.png"
                  alt="BiT App Logo"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <span className="text-sm font-semibold text-stone-500">
                Paso {step}/3
              </span>
            </div>
            <ProgressBar step={step} total={3} />

            <header>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Crear cuenta
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Ingresa tus datos para empezar tu experiencia personalizada.
              </p>
            </header>
          </div>

          {errorMessage && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex-shrink-0">
              {errorMessage}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4 scrollbar-thin">
            {step === 1 && (
              <RegisterStep1
                formData={formData}
                updateField={updateField}
              />
            )}
            {step === 2 && (
              <RegisterStep2
                formData={formData}
                updateField={updateField}
              />
            )}
            {step === 3 && (
              <RegisterStep3
                formData={formData}
                updateField={updateField}
              />
            )}
          </div>

          <div className="flex-shrink-0 pt-4 mt-4 border-t border-stone-100 bg-white">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={previousStep}
                  className="w-1/3 border border-[#99462A] bg-white text-[#99462A] hover:bg-stone-50 rounded-xl py-3 font-semibold text-sm transition-all"
                >
                  Volver
                </Button>
              )}

              <Button
                type="button"
                onClick={step === 3 ? handleSubmit : nextStep}
                disabled={isSubmitting}
                className={`py-3 rounded-xl font-semibold text-sm shadow-md transition-all ${
                  step > 1 ? "w-2/3" : "w-full"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : step === 3 ? (
                  "Finalizar registro"
                ) : (
                  "Siguiente paso"
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-stone-500 mt-3">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-bold text-[#99462A] hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
