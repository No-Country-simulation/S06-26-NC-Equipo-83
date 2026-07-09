import { z } from "zod";

// ---------------------------------------------------------------------------
// Validación de Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "auth:validation.emailRequired")
    .email("auth:validation.emailInvalid"),
  password: z
    .string()
    .min(8, "auth:validation.passwordMinLength")
    .regex(/[A-Z]/, "auth:validation.passwordUppercase")
    .regex(/[0-9]/, "auth:validation.passwordNumber")
    .regex(/[\p{P}\p{S}]/u, "auth:validation.passwordSymbol"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Validación de Registro (3 pasos)
// ---------------------------------------------------------------------------
export const registerStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, "auth:validation.nameMinLength")
    .max(100, "auth:validation.nameMaxLength"),
  email: z
    .string()
    .min(1, "auth:validation.emailRequired")
    .email("auth:validation.emailInvalid"),
  password: z
    .string()
    .min(8, "auth:validation.passwordMinLength")
    .regex(/[A-Z]/, "auth:validation.passwordUppercase")
    .regex(/[0-9]/, "auth:validation.passwordNumber")
    .regex(/[\p{P}\p{S}]/u, "auth:validation.passwordSymbol"),
  confirmPassword: z.string().min(1, "auth:validation.confirmPasswordRequired"),
  birthDate: z
    .string()
    .min(1, "auth:validation.birthDateRequired")
    .refine(
      (val) => !isNaN(Date.parse(val)) && /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "auth:validation.birthDateInvalid" },
    )
    .refine((val) => new Date(val) <= new Date(), {
      message: "auth:validation.birthDateFuture",
    })
    .refine(
      (val) => {
        const birth = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 16;
      },
      { message: "auth:validation.birthDateUnderage" },
    )
    .refine(
      (val) => {
        const birth = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age <= 120;
      },
      { message: "auth:validation.birthDateImpossible" },
    ),
  gender: z.string().min(1, "auth:validation.genderRequired"),
  educationLevel: z.string().min(1, "auth:validation.educationRequired"),
});

export const registerStep2Schema = z.object({
  continentCode: z.string().length(2, "auth:validation.continentRequired"),
  continentName: z.string().min(1),
  countryCode: z.string().length(2, "auth:validation.countryRequired"),
  countryName: z.string().min(1),
  stateCode: z.string().min(1, "auth:validation.stateRequired"),
  stateName: z.string().min(1),
  cityName: z.string().min(1, "auth:validation.cityRequired"),
  whatsapp: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "auth:validation.whatsappInvalid"),
});

export const registerStep3Schema = z.object({
  currentSituation: z.string().min(1, "auth:validation.situationRequired"),
  workSector: z.string().optional(),
  seniority: z.string().optional(),
  interestAreas: z
    .array(z.string())
    .min(1, "auth:validation.interestAreasMin"),
  currentSearch: z.string().min(1, "auth:validation.currentSearchRequired"),
  knownTechnologies: z
    .array(z.object({ name: z.string(), is_custom: z.boolean() }))
    .optional()
    .default([]),
  bio: z.string().max(500, "auth:validation.bioMaxLength").optional().default(""),
});

export type RegisterFormData = z.infer<typeof registerStep1Schema> &
  z.infer<typeof registerStep2Schema> &
  z.infer<typeof registerStep3Schema>;
