import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import Button from "../../components/ui/Button";
import ProgressBar from "../../components/ui/ProgressBar";

import RegisterStep1 from "./registerSteps/registerStep1";
import RegisterStep2 from "./registerSteps/registerStep2";
import RegisterStep3 from "./registerSteps/registerStep3";

import { useAuthStore } from "../../store/useAuthStore";
import { mapRegisterFormToApi } from "../../lib/fieldMappings";
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  type RegisterFormData,
} from "../../lib/validations";

const fullSchema = registerStep1Schema
  .merge(registerStep2Schema)
  .merge(registerStep3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

const stepFields: Record<number, (keyof RegisterFormData)[]> = {
  1: [
    "fullName",
    "email",
    "password",
    "confirmPassword",
    "birthDate",
    "gender",
    "educationLevel",
  ],
  2: [
    "continentCode",
    "continentName",
    "countryCode",
    "countryName",
    "stateCode",
    "stateName",
    "cityName",
    "whatsapp",
  ],
  3: ["experienceLevel", "technologyArea", "currentGoal"],
};

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((s) => s.register);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formContentRef = useRef<HTMLDivElement>(null);

  // Ref sincronizada en cada render para evitar closures stale
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    formContentRef.current?.scrollTo(0, 0);
  }, [step]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      gender: "",
      educationLevel: "",

      continentCode: "",
      continentName: "",
      countryCode: "",
      countryName: "",
      stateCode: "",
      stateName: "",
      cityName: "",
      whatsapp: "",

      experienceLevel: "",
      technologyArea: "",
      currentGoal: "",
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setFocus,
    setValue,
    formState: { errors },
  } = form;

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const birthDate = watch("birthDate");

  const nextStep = async () => {
    clearError();
    setIsValidating(true);
    const fields = stepFields[stepRef.current];
    const valid = await trigger(fields);
    setIsValidating(false);
    if (valid) {
      setStep((s) => Math.min(s + 1, 3));
      return;
    }
    setTimeout(() => {
      const firstError = fields.find((f) => form.getFieldState(f).error);
      if (firstError) setFocus(firstError);
    }, 0);
  };

  const previousStep = () => {
    clearError();
    setStep((s) => Math.max(s - 1, 1));
  };

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    setIsSubmitting(true);
    try {
      const apiData = mapRegisterFormToApi(data);
      await registerAction(apiData);
      navigate("/dashboard", { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-full bg-background flex items-center justify-center overflow-hidden lg:p-6">
      <section className="w-full max-w-6xl h-full md:h-[85vh] md:max-h-[750px] bg-white overflow-hidden shadow-2xl flex flex-col md:flex-row lg:rounded-3xl">
        {/* ── Aside con imagen ──────────────────────────────────────── */}
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

        {/* ── Formulario ────────────────────────────────────────────── */}
        <section className="w-full md:w-1/2 flex flex-col h-full p-6 sm:p-10 md:p-12 overflow-hidden">
          <div className="flex-shrink-0 space-y-[10px] mb-2">
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
            <h1 className="m-0 text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight text-center">
              Crear cuenta
            </h1>
            <ProgressBar step={step} total={3} />
            <p className="m-0 text-sm text-stone-500 text-center">
              Ingresa tus datos para empezar tu experiencia personalizada.
            </p>
          </div>

          {storeError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex-shrink-0">
              {storeError}
            </div>
          )}

          <div
            ref={formContentRef}
            className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-4 scrollbar-thin"
          >
            {step === 1 && (
              <RegisterStep1
                register={register}
                trigger={trigger}
                errors={errors}
                password={password}
                confirmPassword={confirmPassword}
                birthDate={birthDate}
                setValue={setValue}
              />
            )}
            {step === 2 && <RegisterStep2 form={form} />}
            {step === 3 && (
              <RegisterStep3
                register={register}
                trigger={trigger}
                errors={errors}
              />
            )}
          </div>

          {/* ── Botones de navegación ────────────────────────────────── */}
          <div className="flex-shrink-0 pt-3 mt-3 border-t border-stone-100 bg-white">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={previousStep}
                  className="w-1/3 h-12 border border-[#99462A] bg-white text-[#99462A] hover:bg-stone-50 rounded-xl py-2 font-semibold text-sm transition-all"
                >
                  Volver
                </Button>
              )}

              <Button
                type="button"
                onClick={step === 3 ? handleSubmit(onSubmit) : nextStep}
                disabled={isValidating || isSubmitting}
                className={`h-12 py-2 rounded-xl font-semibold text-sm shadow-md transition-all ${
                  step > 1 ? "w-2/3" : "w-full"
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : isValidating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </span>
                ) : step === 3 ? (
                  "Finalizar registro"
                ) : (
                  "Siguiente paso"
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-stone-500 mt-2">
              ¿Ya tenés una cuenta?{" "}
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
