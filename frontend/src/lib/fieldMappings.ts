import type { RegisterFormData } from "./validations";
import type { ProfessionalLevel, CareerObjective, UserCreateRequest } from "../types/api";

/**
 * MAPEO DE CAMPOS: Frontend (camelCase, español) → Backend (snake_case, inglés)
 */

export const EXPERIENCE_LEVEL_MAP: Record<string, ProfessionalLevel> = {
  student: "beginner",
  junior: "junior",
  "semi-senior": "semi_senior",
  senior: "senior",
};

export const CURRENT_GOAL_MAP: Record<string, CareerObjective> = {
  "first-job": "find_job",
  "career-change": "change_job",
  grow: "define_path",
  mentoring: "study",
};

export function mapRegisterFormToApi(formData: RegisterFormData): UserCreateRequest {
  return {
    email: formData.email,
    password: formData.password,
    full_name: formData.fullName,
    birth_date: formData.birthDate,
    gender: formData.gender,
    education_level: formData.educationLevel,

    continent_code: formData.continentCode,
    continent_name: formData.continentName,
    country_code: formData.countryCode,
    country_name: formData.countryName,
    state_code: formData.stateCode,
    state_name: formData.stateName,
    city_name: formData.cityName,
    whatsapp_e164: formData.whatsapp,

    language_code:
      typeof navigator !== "undefined" && navigator.language.startsWith("pt")
        ? "pt"
        : "es",

     current_situation: formData.currentSituation,
    work_sector: formData.currentSituation === "employed" && formData.workSector
      ? formData.workSector : null,
    seniority: formData.currentSituation === "employed" && formData.seniority
      ? formData.seniority : null,
    interest_areas: formData.interestAreas,
    current_search: formData.currentSearch || null,
    known_technologies: formData.knownTechnologies,
    bio: formData.bio || null,

    // Legacy — no se envían
    professional_level: null,
    tech_area: null,
    career_objective: null,
  };
}
