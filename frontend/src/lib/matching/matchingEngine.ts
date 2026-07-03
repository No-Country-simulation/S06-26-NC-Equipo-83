import type { KnownTechnology } from "../../types/api";
import type { Skill } from "./skills";
import { SKILL } from "./skills";
import type { Course, Job, MatchResult, UserSkillProfile } from "./types";
import { TECHNOLOGY_TO_SKILLS } from "./technologyMapping";

const SKILL_VALUES = new Set(Object.values(SKILL));

export function getUserSkills(
  knownTechnologies: KnownTechnology[],
): UserSkillProfile {
  const skillSet = new Set<Skill>();
  const customTechnologies: string[] = [];

  for (const tech of knownTechnologies) {
    if (SKILL_VALUES.has(tech.name as Skill)) {
      skillSet.add(tech.name as Skill);
      continue;
    }

    const mapped = TECHNOLOGY_TO_SKILLS[tech.name];
    if (mapped) {
      for (const skill of mapped) {
        skillSet.add(skill);
      }
    } else if (tech.is_custom) {
      customTechnologies.push(tech.name);
    }
  }

  return { skills: Array.from(skillSet), customTechnologies };
}

export function calculateJobMatch(
  userProfile: UserSkillProfile,
  job: Job,
  allCourses: Course[],
): MatchResult {
  const userSkillSet = new Set(userProfile.skills);
  const requiredSet = new Set(job.requiredSkills);
  const optionalSet = new Set(job.optionalSkills);

  const matchedRequired = intersect(userSkillSet, requiredSet);
  const matchedOptional = intersect(userSkillSet, optionalSet);
  const missingRequired = subtract(requiredSet, userSkillSet);
  const missingOptional = subtract(optionalSet, userSkillSet);

  const score =
    requiredSet.size === 0
      ? 100
      : Math.round((matchedRequired.length / requiredSet.size) * 100);

  const recommendedCourseIds = generateRoadmap(missingRequired, allCourses);

  return {
    score,
    matchedRequiredSkills: matchedRequired,
    matchedOptionalSkills: matchedOptional,
    missingRequiredSkills: missingRequired,
    missingOptionalSkills: missingOptional,
    recommendedCourseIds,
  };
}

export interface GapDetail {
  skill: Skill;
  isRequired: boolean;
  courses: Course[];
}

export interface GapResult {
  missingRequiredDetails: GapDetail[];
  missingOptionalDetails: GapDetail[];
}

export function calculateGap(
  matchResult: MatchResult,
  allCourses: Course[],
): GapResult {
  const buildDetails = (skills: Skill[], isRequired: boolean): GapDetail[] =>
    skills.map((skill) => ({
      skill,
      isRequired,
      courses: allCourses.filter((c) => c.skills.includes(skill)),
    }));

  return {
    missingRequiredDetails: buildDetails(matchResult.missingRequiredSkills, true),
    missingOptionalDetails: buildDetails(matchResult.missingOptionalSkills, false),
  };
}

export function generateRoadmap(
  missingSkills: Skill[],
  allCourses: Course[],
): string[] {
  if (missingSkills.length === 0) return [];

  const uncovered = new Set(missingSkills);
  const result: string[] = [];
  const available = allCourses.filter((c) =>
    c.skills.some((s) => uncovered.has(s)),
  );

  while (uncovered.size > 0) {
    const best = selectBestCourse(available, uncovered);
    if (!best) break;

    result.push(best.id);

    for (const skill of best.skills) {
      uncovered.delete(skill);
    }
  }

  return result;
}

function selectBestCourse(courses: Course[], uncovered: Set<Skill>): Course | null {
  let best: Course | null = null;
  let bestCoverage = 0;
  let bestDuration = Infinity;

  for (const course of courses) {
    const coverage = course.skills.filter((s) => uncovered.has(s)).length;
    if (coverage === 0) continue;

    const duration = parseDurationHours(course.duration);

    if (
      coverage > bestCoverage ||
      (coverage === bestCoverage && duration < bestDuration)
    ) {
      best = course;
      bestCoverage = coverage;
      bestDuration = duration;
    }
  }

  return best;
}

function parseDurationHours(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : Infinity;
}

function intersect<T>(a: Set<T>, b: Set<T>): T[] {
  const result: T[] = [];
  for (const item of a) {
    if (b.has(item)) result.push(item);
  }
  return result;
}

function subtract<T>(a: Set<T>, b: Set<T>): T[] {
  const result: T[] = [];
  for (const item of a) {
    if (!b.has(item)) result.push(item);
  }
  return result;
}
