import { z } from "zod";

// ---------------------------------------------------------------------------
// Validación de Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[\p{P}\p{S}]/u, "Debe incluir al menos un símbolo"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Validación de Registro (3 pasos)
// ---------------------------------------------------------------------------
export const registerStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresá un correo electrónico válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[\p{P}\p{S}]/u, "Debe incluir al menos un símbolo"),
  confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine(
      (val) => !isNaN(Date.parse(val)) && /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "Ingresá una fecha válida" },
    )
    .refine((val) => new Date(val) <= new Date(), {
      message: "La fecha no puede ser posterior a hoy",
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
      { message: "Debés tener al menos 16 años para registrarte" },
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
      { message: "Ingresá una fecha de nacimiento válida" },
    ),
  gender: z.string().min(1, "Seleccioná tu género"),
  educationLevel: z.string().min(1, "Seleccioná tu nivel educativo"),
});

export const registerStep2Schema = z.object({
  continentCode: z.string().length(2, "Seleccioná un continente"),
  continentName: z.string().min(1),
  countryCode: z.string().length(2, "Seleccioná un país"),
  countryName: z.string().min(1),
  stateCode: z.string().min(1, "Seleccioná una provincia o estado"),
  stateName: z.string().min(1),
  cityName: z.string().min(1, "Seleccioná o escribí tu ciudad"),
  whatsapp: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Ingresá un número de WhatsApp válido, por ejemplo: +549112345678"),
});

export const registerStep3Schema = z.object({
  currentSituation: z.string().min(1, "Seleccioná tu situación actual"),
  workSector: z.string().optional(),
  seniority: z.string().optional(),
  interestAreas: z
    .array(z.string())
    .min(1, "Seleccioná al menos un área de interés"),
  currentSearch: z.string().min(1, "Seleccioná qué estás buscando"),
  knownTechnologies: z
    .array(z.object({ name: z.string(), is_custom: z.boolean() }))
    .optional()
    .default([]),
  bio: z.string().max(500, "La biografía no puede superar los 500 caracteres").optional().default(""),
});

export type RegisterFormData = z.infer<typeof registerStep1Schema> &
  z.infer<typeof registerStep2Schema> &
  z.infer<typeof registerStep3Schema>;
