export { SKILL, SKILL_LABELS } from "./skills";
export type { Skill } from "./skills";

export type {
  SeniorityLevel,
  Job,
  Course,
  UserSkillProfile,
  MatchResult,
} from "./types";

export { TECHNOLOGY_TO_SKILLS } from "./technologyMapping";

export { MOCK_JOBS } from "./mockJobs";
export { MOCK_COURSES } from "./mockCourses";

export {
  getUserSkills,
  calculateJobMatch,
  calculateGap,
  generateRoadmap,
} from "./matchingEngine";

export type { GapDetail, GapResult } from "./matchingEngine";
