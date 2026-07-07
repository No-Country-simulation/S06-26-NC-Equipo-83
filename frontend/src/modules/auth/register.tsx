import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Check } from "lucide-react";

import RegisterStep1 from "./registerSteps/registerStep1";
import RegisterStep2 from "./registerSteps/registerStep2";
import RegisterStep3 from "./registerSteps/registerStep3";

import { useAuthStore } from "../../store/useAuthStore";
import { mapRegisterFormToApi } from "../../lib/fieldMappings";
import {
  registerStep1Schema, registerStep2Schema, registerStep3Schema,
  type RegisterFormData,
} from "../../lib/validations";

const fullSchema = registerStep1Schema.merge(registerStep2Schema).merge(registerStep3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden", path: ["confirmPassword"],
  });

const stepFields: Record<number, (keyof RegisterFormData)[]> = {
  1: ["fullName", "email", "password", "confirmPassword", "birthDate", "gender", "educationLevel"],
  2: ["continentCode", "continentName", "countryCode", "countryName", "stateCode", "stateName", "cityName", "whatsapp"],
  3: ["currentSituation", "workSector", "seniority", "interestAreas", "currentSearch", "knownTechnologies", "bio"],
};

const steps = [
  { title: "Datos personales", desc: "Nombre, email y contraseña" },
  { title: "Ubicación y contacto", desc: "País, ciudad y WhatsApp" },
  { title: "Perfil profesional", desc: "Experiencia e intereses" },
];

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((s) => s.register);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [step, setStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(fullSchema) as any,
    defaultValues: {
      fullName: "", email: "", password: "", confirmPassword: "",
      birthDate: "", gender: "", educationLevel: "",
      continentCode: "", continentName: "", countryCode: "", countryName: "",
      stateCode: "", stateName: "", cityName: "", whatsapp: "",
      currentSituation: "", workSector: "", seniority: "",
      interestAreas: [], currentSearch: "", knownTechnologies: [], bio: "",
    },
  });

  const { register, handleSubmit, trigger, watch, setFocus, setValue, setError, formState: { errors } } = form;
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const birthDate = watch("birthDate");

  const nextStep = async () => {
    clearError(); setIsValidating(true);
    const valid = await trigger(stepFields[stepRef.current]);
    setIsValidating(false);
    if (valid) {
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo(0, 0);
      return;
    }
    setTimeout(() => {
      const firstError = stepFields[stepRef.current].find((f) => form.getFieldState(f).error);
      if (firstError) setFocus(firstError);
    }, 0);
  };

  const previousStep = () => { clearError(); setStep((s) => Math.max(s - 1, 1)); window.scrollTo(0, 0); };

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    if (data.currentSituation === "employed") {
      let hasError = false;
      if (!data.workSector) { setError("workSector", { message: "Seleccioná tu sector laboral" }); hasError = true; }
      if (!data.seniority) { setError("seniority", { message: "Seleccioná tu seniority" }); hasError = true; }
      if (hasError) return;
    }
    setIsSubmitting(true);
    try { await registerAction(mapRegisterFormToApi(data)); navigate("/dashboard", { replace: true }); }
    catch { setIsSubmitting(false); }
  };

  const currentStepIndex = step - 1;

  return (
    <div
      className="min-h-full flex items-center justify-center px-6 sm:px-8 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -20%, #D6E8FF 0%, #EBF3FF 35%, #fffffe 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(47,117,220,0.06) 0%, transparent 70%)" }}
        />
        <div className="absolute -top-24 right-[12%] w-56 h-56 rounded-full opacity-[0.03] bg-[#2F75DC]" />
        <div className="absolute -bottom-16 left-[8%] w-40 h-40 rounded-full opacity-[0.02] bg-[#2F75DC]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[460px] py-12 sm:py-16"
      >
        <div className="mb-7">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#94A3B8" }}>
            Paso {step} de 3 — {["Tu identidad", "Tu ubicación", "Tu perfil"][currentStepIndex]}
          </p>
          <h1
            className="font-display text-[1.85rem] font-bold tracking-tight"
            style={{ color: "#002F68", letterSpacing: "-0.02em" }}
          >
            {steps[currentStepIndex].title}
          </h1>
        </div>

        {storeError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2.5"
            style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />{storeError}
          </motion.div>
        )}

        <div>
          {step === 1 && <RegisterStep1 register={register} trigger={trigger} errors={errors} password={password} confirmPassword={confirmPassword} birthDate={birthDate} setValue={setValue} />}
          {step === 2 && <RegisterStep2 form={form} />}
          {step === 3 && <RegisterStep3 form={form} />}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <motion.button type="button" onClick={previousStep} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-[40%] h-12 flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-all duration-200"
              style={{ color: "var(--color-primary)", border: "1px solid var(--color-primary)", backgroundColor: "#ffffff" }}>
              <ArrowLeft className="w-4 h-4" />Volver
            </motion.button>
          )}
          <motion.button type="button" onClick={step === 3 ? handleSubmit(onSubmit) : nextStep}
            disabled={isValidating || isSubmitting} whileHover={{ y: -1 }} whileTap={{ y: 0, scale: 0.985 }}
            className={`h-12 flex items-center justify-center gap-2 rounded-full font-semibold text-sm text-white transition-shadow duration-200 shadow-[0_4px_14px_-2px_rgba(47,117,220,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(47,117,220,0.5)] disabled:opacity-60 disabled:cursor-not-allowed ${step > 1 ? "w-[60%]" : "w-full"}`}
            style={{ background: "linear-gradient(135deg, #2F75DC 0%, #4B8FEA 100%)" }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creando cuenta...</>
             : isValidating ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</>
             : step === 3 ? "Finalizar registro"
             : <span className="flex items-center gap-2">Siguiente paso <ArrowRight className="w-4 h-4" /></span>}
          </motion.button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <motion.div
                animate={{ backgroundColor: i <= currentStepIndex ? "#2F75DC" : "#C4DDFB" }}
                transition={{ duration: 0.3 }}
                className={`rounded-full flex items-center justify-center text-xs font-bold text-white transition-all duration-300 ${i === currentStepIndex ? "w-7 h-7" : "w-6 h-6"}`}
              >
                {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
              </motion.div>
              {i < 2 && <motion.div animate={{ backgroundColor: i < currentStepIndex ? "#2F75DC" : "#C4DDFB" }} transition={{ duration: 0.3 }} className="w-8 h-px" />}
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#424753" }}>
          ¿Ya tenés una cuenta?{" "}
          <Link to="/login" onClick={() => window.scrollTo(0, 0)} className="font-bold hover:underline transition-colors" style={{ color: "var(--color-primary)" }}>
            Iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
