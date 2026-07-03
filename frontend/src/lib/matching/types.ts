import type { Skill } from "./skills";

export type SeniorityLevel = "trainee" | "junior" | "semi-senior" | "senior";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  area: string;
  requiredSkills: Skill[];
  optionalSkills: Skill[];
  salary?: string;
  seniority: SeniorityLevel;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  skills: Skill[];
  url?: string;
}

export interface UserSkillProfile {
  skills: Skill[];
  customTechnologies: string[];
}

export interface MatchResult {
  score: number;
  matchedRequiredSkills: Skill[];
  matchedOptionalSkills: Skill[];
  missingRequiredSkills: Skill[];
  missingOptionalSkills: Skill[];
  recommendedCourseIds: string[];
}
