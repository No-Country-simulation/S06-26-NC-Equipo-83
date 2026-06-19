import Select from "../../../components/ui/Select";

interface RegisterStep3Props {
  formData: {
    experienceLevel: string;
    technologyArea: string;
    currentGoal: string;
  };
  updateField: (
    field: string,
    value: string
  ) => void;
}

export default function RegisterStep3({
  formData,
  updateField,
}: RegisterStep3Props) {
  return (
    <div className="space-y-6">
      {/* Nivel de experiencia */}
      <div className="space-y-2">
        <Select
        id="experienceLevel"
        label="Nivel de experiencia"
        value={formData.experienceLevel}
        onChange={(e) => updateField("experienceLevel", e.target.value)}
        options={[
          { value: "", label: "Selecciona una opción" },
          { value: "student", label: "Estudiante" },
          { value: "junior", label: "Junior" },
          { value: "semi-senior", label: "Semi Senior" },
          { value: "senior", label: "Senior" },
        ]}
      />
      </div>

      {/* Área de interés */}
      <div className="space-y-2">
        <Select
        id="technologyArea"
        label="Área de interés"
        value={formData.technologyArea}
        onChange={(e) => updateField("technologyArea", e.target.value)}
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
      </div>

      {/* Objetivo actual */}
      <div className="space-y-2">
        <Select
        id="currentGoal"
        label="¿Qué buscas hoy?"
        value={formData.currentGoal}
        onChange={(e) => updateField("currentGoal", e.target.value)}
        options={[
          { value: "", label: "Selecciona una opción" },
          { value: "first-job", label: "Conseguir mi primer empleo IT" },
          { value: "career-change", label: "Cambiar de área técnica" },
          { value: "grow", label: "Crecer profesionalmente" },
          { value: "mentoring", label: "Ser mentor o ayudar a otros" },
        ]}
      />
      </div>

      <div className="rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
        Tus respuestas nos ayudarán a personalizar recomendaciones,
        mentorías y oportunidades acordes a tu perfil profesional.
      </div>
    </div>
  );
}