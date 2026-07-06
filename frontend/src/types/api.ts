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

export interface KnownTechnology {
  name: string;
  is_custom: boolean;
}

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

  // ── Step 3 v3 — nuevos campos ──────────────────────────────────────────
  current_situation: string;
  work_sector?: string | null;
  seniority?: string | null;
  interest_areas: string[];
  current_search?: string | null;
  known_technologies: KnownTechnology[];
  bio?: string | null;

  // ── Legacy (nullable para nuevos usuarios) ─────────────────────────────
  professional_level?: ProfessionalLevel | null;
  tech_area?: string | null;
  career_objective?: CareerObjective | null;

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

  // ── Step 3 v3 — nuevos campos ──────────────────────────────────────────
  current_situation: string;
  work_sector?: string | null;
  seniority?: string | null;
  interest_areas: string[];
  current_search?: string | null;
  known_technologies: KnownTechnology[];
  bio?: string | null;

  // ── Legacy ─────────────────────────────────────────────────────────────
  professional_level?: ProfessionalLevel | null;
  tech_area?: string | null;
  career_objective?: CareerObjective | null;
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

// ── Eventos (comunidad) ────────────────────────────────────────────────────

export interface EventCreateRequest {
  title: string;
  description?: string | null;
  tipo: string;
  categoria: string;
  event_date?: string | null;
  cluster?: string | null;
  location?: string | null;
  address?: string | null;
  meeting_url?: string | null;
  max_participants?: number | null;
}

export interface EventResponse {
  id: string;
  title: string;
  description?: string | null;
  tipo: string;
  categoria: string;
  event_date?: string | null;
  created_by: string;
  jitsi_room: string;
  meeting_url?: string | null;
  is_live: boolean;
  cluster?: string | null;
  location?: string | null;
  address?: string | null;
  max_participants?: number | null;
  created_at: string;
}

export interface EventListResponse {
  eventos: EventResponse[];
  total: number;
}

export interface ExperienciasRequest {
  lat: number;
  lng: number;
  hora_actual: string;
  edad?: number;
  area?: string;
  objetivo?: string;
}

export interface CoberturaInfo {
  calidad: string;
  drop_pct: number;
  congestion: number;
  n_usuarios: number;
  periodo: string;
}

export interface EventoCercano {
  titulo: string;
  tipo: string;
  cluster: string;
  lat: number;
  lon: number;
  asistentes_estimados: number;
  categoria: string;
  edad_recomendada: string;
  url?: string | null;
  meeting_url?: string | null;
}

export interface DestinoPopular {
  cluster: string;
  municipio: string;
  n_usuarios: number;
  dist_km: number;
  periodo_predominante: string;
}

export interface ContenidoOffline {
  titulo: string;
  tipo: string;
  duracion: string;
  descripcion: string;
}

export interface ExperienciasResponse {
  cluster_cercano: string;
  cobertura: CoberturaInfo;
  eventos_cercanos: EventoCercano[];
  destinos_populares: DestinoPopular[];
  contenido_offline: ContenidoOffline[];
}
