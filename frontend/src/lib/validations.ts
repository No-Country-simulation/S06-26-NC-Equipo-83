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
  birthDate: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  gender: z.string().min(1, "Seleccioná una opción"),
  educationLevel: z.string().min(1, "Seleccioná tu nivel educativo"),
});

export const registerStep2Schema = z.object({
  continent: z.string().min(1, "Seleccioná un continente"),
  country: z.string().min(1, "Seleccioná un país"),
  state: z.string().min(1, "La provincia es obligatoria"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  phoneCode: z.string().min(1, "Seleccioná un código"),
  whatsapp: z.string().min(6, "Número de WhatsApp inválido"),
});

export const registerStep3Schema = z.object({
  experienceLevel: z.string().min(1, "Seleccioná tu nivel"),
  technologyArea: z.string().min(1, "Seleccioná un área"),
  currentGoal: z.string().min(1, "Seleccioná un objetivo"),
});

export type RegisterFormData = z.infer<typeof registerStep1Schema> &
  z.infer<typeof registerStep2Schema> &
  z.infer<typeof registerStep3Schema>;
