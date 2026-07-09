import type { UseFormRegister, UseFormTrigger, FieldErrors, UseFormSetValue } from "react-hook-form";
import type { RegisterFormData } from "../../../lib/validations";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import DateInput from "../../../components/ui/DateInput";
import { authService } from "../../../services/authService";
import { useTranslation } from "react-i18next";

const REQ_MIN_8 = /^.{8,}$/;
const REQ_UPPER = /[A-Z]/;
const REQ_NUMBER = /[0-9]/;
const REQ_SPECIAL = /[\p{P}\p{S}]/u;

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
    <span className={`text-xs ${met ? "text-[var(--color-primary)]" : "text-stone-400"}`}>
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
  const { t } = useTranslation(['auth', 'common']);
  const { min: birthMin, max: birthMax } = computeDateRange();
  return (
    <div className="space-y-3">
      <Input
        id="fullName"
        label={t('auth:step1.fullNameLabel')}
        icon="person"
        placeholder={t('auth:step1.fullNamePlaceholder')}
        required
        {...register("fullName", { onBlur: () => trigger("fullName") })}
        error={errors.fullName?.message ? String(t(errors.fullName.message)) : undefined}
      />

      <Input
        id="email"
        type="email"
        label={t('auth:step1.emailLabel')}
        icon="mail"
        placeholder={t('auth:step1.emailPlaceholder')}
        required
        {...register("email", {
          onBlur: () => trigger("email"),
          validate: async (value) => {
            if (!value) return true;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
            try {
              const taken = await authService.checkEmail(value);
              return taken ? "auth:step1.emailRegistered" : true;
            } catch {
              return true;
            }
          },
        })}
        error={errors.email?.message ? String(t(errors.email.message)) : undefined}
      />

      <div>
        <Input
          id="password"
          type="password"
          label={t('auth:step1.passwordLabel')}
          icon="lock"
          placeholder={t('auth:step1.passwordPlaceholder')}
          showPasswordToggle
          required
          {...register("password", { onBlur: () => trigger("password") })}
          error={errors.password?.message ? String(t(errors.password.message)) : undefined}
        />

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <ReqLine met={REQ_MIN_8.test(password ?? "")} label={t('auth:step1.passwordRequirementLength')} />
          <ReqLine met={REQ_UPPER.test(password ?? "")} label={t('auth:step1.passwordRequirementUpper')} />
          <ReqLine met={REQ_NUMBER.test(password ?? "")} label={t('auth:step1.passwordRequirementNumber')} />
          <ReqLine met={REQ_SPECIAL.test(password ?? "")} label={t('auth:step1.passwordRequirementSymbol')} />
        </div>
      </div>

      <Input
        id="confirmPassword"
        type="password"
        label={t('auth:step1.confirmPasswordLabel')}
        icon="lock"
        placeholder={t('auth:step1.confirmPasswordPlaceholder')}
        showPasswordToggle
        required
        {...register("confirmPassword", { onBlur: () => trigger("confirmPassword") })}
        error={
          password && confirmPassword && password === confirmPassword
            ? undefined
            : errors.confirmPassword?.message ? String(t(errors.confirmPassword.message)) : undefined
        }
      />

      {password && confirmPassword && password === confirmPassword && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          {"\u2713"} {t('auth:register.passwordsMatch')}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <DateInput
          id="birthDate"
          label={t('auth:step1.birthDateLabel')}
          required
          min={birthMin}
          max={birthMax}
          value={birthDate}
          error={errors.birthDate?.message ? String(t(errors.birthDate.message)) : undefined}
          onChange={(val) => setValue("birthDate", val, { shouldValidate: true })}
          onBlur={() => trigger("birthDate")}
        />

        <Select
          id="gender"
          label={t('auth:step1.genderLabel')}
          required
          {...register("gender", { onChange: () => trigger("gender") })}
          error={errors.gender?.message ? String(t(errors.gender.message)) : undefined}
          options={[
            { value: "", label: t('auth:step1.genderSelect') },
            { value: "female", label: t('auth:step1.genderFemale') },
            { value: "male", label: t('auth:step1.genderMale') },
            { value: "non-binary", label: t('auth:step1.genderNonBinary') },
            { value: "other", label: t('auth:step1.genderOther') },
          ]}
        />
      </div>

      <Select
        id="educationLevel"
        label={t('auth:step1.educationLabel')}
        required
        {...register("educationLevel")}
        error={errors.educationLevel?.message ? String(t(errors.educationLevel.message)) : undefined}
        options={[
          { value: "", label: t('auth:step1.educationSelect') },
          { value: "secundario", label: t('auth:step1.educationSecondary') },
          { value: "terciario", label: t('auth:step1.educationTertiary') },
          { value: "universitario", label: t('auth:step1.educationUniversity') },
          { value: "posgrado", label: t('auth:step1.educationPostgraduate') },
        ]}
      />
    </div>
  );
}
