export const ProfessionalLevel = {
  BEGINNER: "beginner",
  JUNIOR: "junior",
  SEMI_SENIOR: "semi_senior",
  SENIOR: "senior",
} as const;
export type ProfessionalLevel =
  (typeof ProfessionalLevel)[keyof typeof ProfessionalLevel];

export const CareerObjective = {
  STUDY: "study",
  DEFINE_PATH: "define_path",
  FIND_JOB: "find_job",
  CHANGE_JOB: "change_job",
} as const;
export type CareerObjective =
  (typeof CareerObjective)[keyof typeof CareerObjective];

export const Mood = {
  HAPPY: "happy",
  TIRED: "tired",
  SAD: "sad",
  ANXIOUS: "anxious",
  OVERWHELMED: "overwhelmed",
  STRESSED: "stressed",
  ANGRY: "angry",
  DEPRESSED: "depressed",
} as const;
export type Mood = (typeof Mood)[keyof typeof Mood];

// ── User ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  birth_date: string;
  gender: string;
  education_level: string;

  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
  city_name: string;
  whatsapp_e164: string;

  language_code: string;

  professional_level: ProfessionalLevel;
  tech_area: string;
  career_objective: CareerObjective;

  created_at: string;
}

// ── API Request / Response ────────────────────────────────────────────────

export interface UserCreateRequest {
  email: string;
  password: string;
  full_name: string;
  birth_date: string;
  gender: string;
  education_level: string;

  continent_code: string;
  continent_name: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
  city_name: string;
  whatsapp_e164: string;

  language_code: string;

  professional_level: ProfessionalLevel;
  tech_area: string;
  career_objective: CareerObjective;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ── Orientar ──────────────────────────────────────────────────────────────

export interface VacancyResponse {
  id: string;
  title: string;
  company: string;
  match_percentage: number;
}

export interface OrientarResponse {
  gap_porcentual: number;
  gap_items: string[];
  trayectoria_sugerida: string[];
  vacantes_compatibles: VacancyResponse[];
  confianza: number;
}

// ── Salud ─────────────────────────────────────────────────────────────────

export interface SaludRequest {
  humor: Mood;
  nota_semanal: number;
  contexto?: string | null;
}

export interface SaludResponse {
  mensaje: string;
  accion_sugerida: string;
  derivar_cvv: boolean;
  nota_actual: number;
  alerta: boolean;
  created_at: string;
}
