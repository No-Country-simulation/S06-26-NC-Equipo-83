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
        <label
          htmlFor="experienceLevel"
          className="text-sm font-medium text-stone-800"
        >
          Nivel de experiencia
        </label>

        <select
          id="experienceLevel"
          value={formData.experienceLevel}
          onChange={(e) =>
            updateField(
              "experienceLevel",
              e.target.value
            )
          }
          className="h-14 w-full rounded-xl bg-stone-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
        >
          <option value="">
            Selecciona una opción
          </option>
          <option value="student">
            Estudiante
          </option>
          <option value="junior">
            Junior
          </option>
          <option value="semi-senior">
            Semi Senior
          </option>
          <option value="senior">
            Senior
          </option>
        </select>
      </div>

      {/* Área de interés */}
      <div className="space-y-2">
        <label
          htmlFor="technologyArea"
          className="text-sm font-medium text-stone-800"
        >
          Área de interés
        </label>

        <select
          id="technologyArea"
          value={formData.technologyArea}
          onChange={(e) =>
            updateField(
              "technologyArea",
              e.target.value
            )
          }
          className="h-14 w-full rounded-xl bg-stone-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
        >
          <option value="">
            Selecciona un área
          </option>

          <option value="frontend">
            Frontend
          </option>

          <option value="backend">
            Backend
          </option>

          <option value="fullstack">
            Full Stack
          </option>

          <option value="mobile">
            Desarrollo Mobile
          </option>

          <option value="data">
            Data & IA
          </option>

          <option value="devops">
            DevOps
          </option>

          <option value="ux">
            UX/UI
          </option>
        </select>
      </div>

      {/* Objetivo actual */}
      <div className="space-y-2">
        <label
          htmlFor="currentGoal"
          className="text-sm font-medium text-stone-800"
        >
          ¿Qué buscas hoy?
        </label>

        <select
          id="currentGoal"
          value={formData.currentGoal}
          onChange={(e) =>
            updateField(
              "currentGoal",
              e.target.value
            )
          }
          className="h-14 w-full rounded-xl bg-stone-100 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#99462A]/20"
        >
          <option value="">
            Selecciona una opción
          </option>

          <option value="first-job">
            Conseguir mi primer empleo IT
          </option>

          <option value="career-change">
            Cambiar de área técnica
          </option>

          <option value="grow">
            Crecer profesionalmente
          </option>

          <option value="mentoring">
            Ser mentor o ayudar a otros
          </option>
        </select>
      </div>

      <div className="rounded-xl bg-stone-100 p-4 text-sm text-stone-600">
        Tus respuestas nos ayudarán a personalizar recomendaciones,
        mentorías y oportunidades acordes a tu perfil profesional.
      </div>
    </div>
  );
}