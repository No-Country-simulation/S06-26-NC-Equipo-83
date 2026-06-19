import { useState } from 'react';
import { Link } from "react-router-dom";

import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

import RegisterStep1 from './registerSteps/registerStep1';
import RegisterStep2 from "./registerSteps/registerStep2";
import RegisterStep3 from "./registerSteps/registerStep3";

export default function Register() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] =
    useState({
        // Paso 1
        fullName: "",
        email: "",
        password: "",
        birthDate: "",
        gender: "",

        // Paso 2
        continent: "",
        country: "",
        state: "",
        city: "",
        phoneCode: "+54",
        whatsapp: "",

        // Paso 3
        experienceLevel: "",
        technologyArea: "",
        currentGoal: "",
        });

  const updateField = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setStep((prev) =>
      Math.min(prev + 1, 3)
    );
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
  // Aquí luego vas a integrar la llamada a la API
  console.log(formData);

  // Ejemplo:
  // await registerUser(formData);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl overflow-hidden bg-white lg:my-6 lg:rounded-3xl lg:shadow-xl"> 
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="relative hidden overflow-hidden md:flex md:w-1/2">
          <img
            src="/heroRegister.png"
            alt="Comienza tu viaje en BiT"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="absolute bottom-16 left-16 max-w-md text-white">
            <h1 className="mb-4 text-5xl font-bold text-white">
              Comienza tu viaje en BiT
            </h1>

            <p className="text-lg">
             Un espacio seguro diseñado para guiarte en tu orientación personal con un enfoque humano y empático.
            </p>
          </div>
        </aside>

        <section className="flex w-full items-center justify-center px-5 py-10 md:w-1/2">
          <div className="w-full max-w-lg">
            <div className="mb-4 flex items-center justify-between md:hidden">
              <span className="text-xl font-bold text-[#99462A]">
                BiT
              </span>

              <span className="text-sm text-stone-500">
                Paso {step}/3
              </span>
            </div>

            <ProgressBar
              step={step}
              total={3}
            />

            <header className="mb-8">
              <h1 className="text-3xl font-bold text-stone-900">
                Crear cuenta
              </h1>

              <p className="mt-2 text-stone-500">
                Ingresa tus datos para empezar tu
                experiencia personalizada.
              </p>
            </header>

            <RegisterStep1
              formData={formData}
              updateField={updateField}
            />
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={previousStep}
                  className="border border-[#99462A] bg-white text-[#99462A] hover:bg-stone-50"
                >
                  Volver
                </Button>
              )}

              <Button
                type="button"
                onClick={step === 3 ? handleSubmit : nextStep}
              >
                {step === 3
                  ? "Finalizar registro"
                  : "Siguiente paso"}
              </Button>
            </div>
            <p className="mt-10 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      </div>
       </section>
    </main>
  );
}