import type { UseFormRegister, UseFormTrigger, FieldErrors, UseFormSetValue } from "react-hook-form";
import type { RegisterFormData } from "../../../lib/validations";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import DateInput from "../../../components/ui/DateInput";

const REQ_MIN_8 = /^.{8,}$/;
const REQ_UPPER = /[A-Z]/;
const REQ_NUMBER = /[0-9]/;

function computeDateRange() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return {
    min: `${y - 120}-${m}-${d}`,
    max: `${y - 16}-${m}-${d}`,
  };
}

interface RegisterStep1Props {
  register: UseFormRegister<RegisterFormData>;
  trigger: UseFormTrigger<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  password: string;
  confirmPassword: string;
  birthDate: string;
  setValue: UseFormSetValue<RegisterFormData>;
}

function ReqLine({ met, label }: { met: boolean; label: string }) {
  return (
    <span className={`text-xs ${met ? "text-[#99462A]" : "text-stone-400"}`}>
      {met ? "\u2713" : "\u25CB"} {label}
    </span>
  );
}

export default function RegisterStep1({
  register,
  trigger,
  errors,
  password,
  confirmPassword,
  birthDate,
  setValue,
}: RegisterStep1Props) {
  const { min: birthMin, max: birthMax } = computeDateRange();
  return (
    <div className="space-y-6">
      <Input
        id="fullName"
        label="Nombre completo"
        icon="person"
        placeholder="Ej. Ana García"
        required
        {...register("fullName", { onBlur: () => trigger("fullName") })}
        error={errors.fullName?.message}
      />

      <Input
        id="email"
        type="email"
        label="Correo electrónico"
        icon="mail"
        placeholder="nombre@ejemplo.com"
        required
        {...register("email", { onBlur: () => trigger("email") })}
        error={errors.email?.message}
      />

      <div>
        <Input
          id="password"
          type="password"
          label="Contraseña"
          icon="lock"
          placeholder="Mínimo 8 caracteres"
          showPasswordToggle
          required
          {...register("password", { onBlur: () => trigger("password") })}
          error={errors.password?.message}
        />

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <ReqLine met={REQ_MIN_8.test(password ?? "")} label="Mínimo 8 caracteres" />
          <ReqLine met={REQ_UPPER.test(password ?? "")} label="Al menos 1 mayúscula" />
          <ReqLine met={REQ_NUMBER.test(password ?? "")} label="Al menos 1 número" />
        </div>
      </div>

      <Input
        id="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        icon="lock"
        placeholder="Repetí tu contraseña"
        showPasswordToggle
        required
        {...register("confirmPassword", { onBlur: () => trigger("confirmPassword") })}
        error={errors.confirmPassword?.message}
      />

      {password && confirmPassword && password === confirmPassword && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          {"\u2713"} Las contraseñas coinciden
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <DateInput
          id="birthDate"
          label="Fecha de nacimiento"
          required
          min={birthMin}
          max={birthMax}
          value={birthDate}
          error={errors.birthDate?.message}
          onChange={(val) => setValue("birthDate", val, { shouldValidate: true })}
          onBlur={() => trigger("birthDate")}
        />

        <Select
          id="gender"
          label="Género"
          required
          {...register("gender", { onChange: () => trigger("gender") })}
          error={errors.gender?.message}
          options={[
            { value: "", label: "Seleccionar" },
            { value: "female", label: "Femenino" },
            { value: "male", label: "Masculino" },
            { value: "non-binary", label: "No binario" },
            { value: "other", label: "Otro / Prefiero no decir" },
          ]}
        />
      </div>

      <Select
        id="educationLevel"
        label="Nivel educativo"
        required
        {...register("educationLevel", { onChange: () => trigger("educationLevel") })}
        error={errors.educationLevel?.message}
        options={[
          { value: "", label: "Seleccionar" },
          { value: "secundario", label: "Secundario" },
          { value: "terciario", label: "Terciario / Técnico" },
          { value: "universitario", label: "Universitario" },
          { value: "posgrado", label: "Posgrado / Máster" },
        ]}
      />
    </div>
  );
}
