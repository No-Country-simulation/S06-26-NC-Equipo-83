import type { UseFormRegister, UseFormTrigger, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../../../lib/validations";
import Select from "../../../components/ui/Select";

interface RegisterStep3Props {
  register: UseFormRegister<RegisterFormData>;
  trigger: UseFormTrigger<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export default function RegisterStep3({
  register,
  trigger,
  errors,
}: RegisterStep3Props) {
  return (
    <div className="space-y-6">
      <Select
        id="experienceLevel"
        label="Nivel de experiencia"
        required
        {...register("experienceLevel", { onChange: () => trigger("experienceLevel") })}
        error={errors.experienceLevel?.message}
        options={[
          { value: "", label: "Selecciona una opción" },
          { value: "student", label: "Estudiante" },
          { value: "junior", label: "Junior" },
          { value: "semi-senior", label: "Semi Senior" },
          { value: "senior", label: "Senior" },
        ]}
      />

      <Select
        id="technologyArea"
        label="Área de interés"
        required
        {...register("technologyArea", { onChange: () => trigger("technologyArea") })}
        error={errors.technologyArea?.message}
        options={[
          { value: "", label: "Selecciona un área" },
          { value: "frontend", label: "Frontend" },
          { value: "backend", label: "Backend" },
          { value: "fullstack", label: "Full Stack" },
          { value: "mobile", label: "Desarrollo Mobile" },
          { value: "data", label: "Data & IA" },
          { value: "devops", label: "DevOps" },
          { value: "ux", label: "UX/UI" },
        ]}
      />

      <Select
        id="currentGoal"
        label="¿Qué buscas hoy?"
        required
        {...register("currentGoal", { onChange: () => trigger("currentGoal") })}
        error={errors.currentGoal?.message}
        options={[
          { value: "", label: "Selecciona una opción" },
          { value: "first-job", label: "Conseguir mi primer empleo IT" },
          { value: "career-change", label: "Cambiar de área técnica" },
          { value: "grow", label: "Crecer profesionalmente" },
          { value: "mentoring", label: "Ser mentor o ayudar a otros" },
        ]}
      />

      <div className="rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
        Tus respuestas nos ayudarán a personalizar recomendaciones,
        mentorías y oportunidades acordes a tu perfil profesional.
      </div>
    </div>
  );
}
