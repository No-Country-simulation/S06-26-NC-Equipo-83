import { z } from "zod";

// ---------------------------------------------------------------------------
// Validación de Login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Validación de Registro (3 pasos)
// ---------------------------------------------------------------------------
export const registerStep1Schema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
  birthDate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine(
      (val) => !isNaN(Date.parse(val)) && /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: "Fecha inválida — usá el formato YYYY-MM-DD" },
    )
    .refine((val) => new Date(val) <= new Date(), {
      message: "La fecha no puede ser futura",
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
      { message: "Debés tener al menos 16 años" },
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
      { message: "La fecha de nacimiento no es válida" },
    ),
  gender: z.string().min(1, "Seleccioná una opción"),
  educationLevel: z.string().min(1, "Seleccioná tu nivel educativo"),
});

export const registerStep2Schema = z.object({
  continentCode: z.string().length(2, "Seleccioná un continente"),
  continentName: z.string().min(1),
  countryCode: z.string().length(2, "Seleccioná un país"),
  countryName: z.string().min(1),
  stateCode: z.string().min(1, "Seleccioná una provincia/estado"),
  stateName: z.string().min(1),
  cityName: z.string().min(1, "Seleccioná una ciudad"),
  whatsapp: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Ingresá un número de WhatsApp válido (ej: +549112345678)"),
});

export const registerStep3Schema = z.object({
  experienceLevel: z.string().min(1, "Seleccioná tu nivel"),
  technologyArea: z.string().min(1, "Seleccioná un área"),
  currentGoal: z.string().min(1, "Seleccioná un objetivo"),
});

export type RegisterFormData = z.infer<typeof registerStep1Schema> &
  z.infer<typeof registerStep2Schema> &
  z.infer<typeof registerStep3Schema>;
