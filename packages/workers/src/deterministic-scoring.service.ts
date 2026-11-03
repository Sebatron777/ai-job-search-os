/**
 * Сервис детерминированного скоринга вакансий
 * 
 * Вычисляет схожесть вакансии с профилем кандидата
 * на основе детерминированных алгоритмов
 */

import type { CandidateProfile, Job, JobPreference } from "@ai-job-search/types";
import { calculateSimilarity, normalizeText } from "@ai-job-search/shared";

/**
 * Результат детерминированного скоринга
 */
export interface DeterministicScoreResult {
  /** Общий скор (0-100) */
  totalScore: number;
  /** Скор по заголовку (0-100) */
  titleScore: number;
  /** Скор по навыкам (0-100) */
  skillScore: number;
  /** Скор по seniority (0-100) */
  seniorityScore: number;
  /** Скор по формату работы (0-100) */
  workModeScore: number;
  /** Скор по локации (0-100) */
  locationScore: number;
  /** Скор по зарплате (0-100) */
  salaryScore: number;
  /** Матчи навыков */
  skillMatches: SkillMatch[];
  /** Пробелы в навыках */
  skillGaps: SkillGap[];
}

/**
 * Матч навыка
 */
export interface SkillMatch {
  /** Название навыка */
  skill: string;
  /** Категория (если есть) */
  category?: string;
  /** Уровень кандидата */
  candidateLevel: SkillLevel;
  /** Требуемый уровень */
  requiredLevel: SkillLevel;
  /** Превышает требования */
  isExceeds: boolean;
  /** Соответствует */
  isMatch: boolean;
  /** Недостаточный уровень */
  isGap: boolean;
}

/**
 * Пробел в навыках
 */
export interface SkillGap {
  /** Название навыка */
  skill: string;
  /** Категория */
  category?: string;
  /** Уровень кандидата */
  candidateLevel: SkillLevel | "not_found";
  /** Требуемый уровень */
  requiredLevel: SkillLevel;
  /** Серьёзность пробела */
  gapSeverity: "minor" | "moderate" | "significant" | "critical";
}

/**
 * Уровни навыков
 */
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Веса для компонентов скоринга
 */
export interface ScoringWeights {
  /** Вес заголовка (0-1) */
  title: number;
  /** Вес навыков (0-1) */
  skills: number;
  /** Вес seniority (0-1) */
  seniority: number;
  /** Вес формата работы (0-1) */
  workMode: number;
  /** Вес локации (0-1) */
  location: number;
  /** Вес зарплаты (0-1) */
  salary: number;
}

/**
 * Веса по умолчанию
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  title: 0.20,
  skills: 0.30,
  seniority: 0.15,
  workMode: 0.10,
  location: 0.10,
  salary: 0.10,
};

/**
 * Конфигурация скоринга
 */
export interface ScoringConfig {
  /** Веса компонентов */
  weights: ScoringWeights;
  /** Минимальная зарплата кандидата */
  minSalary?: number;
  /** Предпочитаемые локации */
  preferredLocations?: Array<{ city: string; country: string }>;
  /** Готовность к релокации */
  relocationWilling: boolean;
}

/**
 * Сервис детерминированного скоринга
 */
export class DeterministicScoringService {
  private defaultWeights: ScoringWeights;

  constructor(weights?: Partial<ScoringWeights>) {
    this.defaultWeights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /**
   * Скорить вакансию против профиля кандидата
   */
  score(
    job: Job,
    candidate: CandidateProfile,
    preference?: JobPreference,
    config?: Partial<ScoringConfig>
  ): DeterministicScoreResult {
    const weights = config?.weights || this.defaultWeights;

    // Вычисление компонентных скоров
    const titleScore = this.scoreTitle(job.title, candidate.currentTitle);
    const skillScore = this.scoreSkills(
      job.requiredSkills,
      job.preferredSkills,
      candidate.skills
    );
    const seniorityScore = this.scoreSeniority(
      job.seniorityLevel,
      candidate.yearsOfExperience
    );
    const workModeScore = this.scoreWorkMode(
      job.locationType,
      preference?.workModes
    );
    const locationScore = this.scoreLocation(
      job,
      preference,
      config?.relocationWilling ?? false
    );
    const salaryScore = this.scoreSalary(
      job,
      config?.minSalary || preference?.minSalary
    );

    // Вычисление общего скора
    const totalScore = Math.round(
      titleScore * weights.title +
        skillScore.score * weights.skills +
        seniorityScore * weights.seniority +
        workModeScore * weights.workMode +
        locationScore * weights.location +
        salaryScore * weights.salary
    );

    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      titleScore,
      skillScore: skillScore.score,
      seniorityScore,
      workModeScore,
      locationScore,
      salaryScore,
      skillMatches: skillScore.matches,
      skillGaps: skillScore.gaps,
    };
  }

  /**
   * Скор по заголовку
   */
  private scoreTitle(jobTitle: string, candidateTitle?: string | null): number {
    if (!candidateTitle) return 50; // Нейтральный скор если нет текущего заголовка

    const normalizedJob = normalizeText(jobTitle);
    const normalizedCandidate = normalizeText(candidateTitle);

    // Exact match
    if (normalizedJob === normalizedCandidate) return 100;

    // Проверка на частичное совпадение
    const jobWords = new Set(normalizedJob.split(/\s+/));
    const candidateWords = new Set(normalizedCandidate.split(/\s+/));

    // Пересечение слов
    const intersection = [...jobWords].filter(w => candidateWords.has(w));
    const overlap = intersection.length / Math.max(jobWords.size, candidateWords.size);

    // Также проверяем схожесть через Levenshtein для коротких заголовков
    const similarity = this.calculateTextSimilarity(normalizedJob, normalizedCandidate);

    return Math.round(Math.max(overlap, similarity) * 100);
  }

  /**
   * Скор по навыкам
   */
  private scoreSkills(
    requiredSkills: string[] = [],
    preferredSkills: string[] = [],
    candidateSkills: string[] = []
  ): { score: number; matches: SkillMatch[]; gaps: SkillGap[] } {
    const safeCandidate = candidateSkills || [];
    const safeRequired = requiredSkills || [];
    const safePreferred = preferredSkills || [];
    const normalizedCandidate = safeCandidate.map(s => normalizeText(s));
    const matches: SkillMatch[] = [];
    const gaps: SkillGap[] = [];

    let totalScore = 0;
    let requiredMatched = 0;

    // Проверка required навыков
    for (const skill of safeRequired) {
      const normalized = normalizeText(skill);
      const candidateLevel = this.findSkillLevel(normalized, normalizedCandidate);

      if (candidateLevel) {
        // Навык найден
        const match: SkillMatch = {
          skill,
          candidateLevel,
          requiredLevel: "advanced", // По умолчанию требуем advanced
          isExceeds: candidateLevel === "expert",
          isMatch: ["advanced", "expert"].includes(candidateLevel),
          isGap: ["beginner", "intermediate"].includes(candidateLevel),
        };
        matches.push(match);

        if (match.isMatch) requiredMatched++;
        totalScore += this.levelToScore(candidateLevel);
      } else {
        // Навык не найден - это gap
        gaps.push({
          skill,
          candidateLevel: "not_found",
          requiredLevel: "advanced",
          gapSeverity: "critical",
        });
      }
    }

    // Проверка preferred навыков
    for (const skill of safePreferred) {
      const normalized = normalizeText(skill);
      const candidateLevel = this.findSkillLevel(normalized, normalizedCandidate);

      if (candidateLevel) {
        matches.push({
          skill,
          candidateLevel,
          requiredLevel: "intermediate",
          isExceeds: ["advanced", "expert"].includes(candidateLevel),
          isMatch: true,
          isGap: false,
        });
        totalScore += this.levelToScore(candidateLevel) * 0.5; // Preferred весят меньше
      }
    }

    // Бонус за покрытие всех required навыков
    if (safeRequired.length > 0) {
      const coverageBonus = (requiredMatched / safeRequired.length) * 20;
      totalScore += coverageBonus;
    }

    // Нормализация скора
    const maxPossibleScore = (safeRequired.length * 100 + safePreferred.length * 50);
    const score = maxPossibleScore > 0 
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 100; // Если навыков не указано - полный скор

    return {
      score: Math.min(100, Math.max(0, score)),
      matches,
      gaps,
    };
  }

  /**
   * Скор по seniority
   */
  private scoreSeniority(
    jobSeniority?: string | null,
    candidateYears?: number | null
  ): number {
    if (!jobSeniority && !candidateYears) return 80; // Нейтрально

    const candidateLevel = this.yearsToSeniority(candidateYears || 0);
    const jobLevel = this.seniorityStringToLevel(jobSeniority || "");

    if (!jobLevel) return 70; // Если не указан уровень в вакансии

    const levels = ["entry", "junior", "mid", "senior", "lead", "principal", "staff", "director", "vp", "c_level"];
    
    const candidateIndex = levels.indexOf(candidateLevel);
    const jobIndex = levels.indexOf(jobLevel);

    if (candidateIndex === -1 || jobIndex === -1) return 60;

    const diff = jobIndex - candidateIndex;

    // Идеальное попадание
    if (diff === 0) return 100;

    // Кандидат немного ниже требуемого (на 1 уровень)
    if (diff === 1) return 80;

    // Кандидат немного выше требуемого
    if (diff === -1) return 85;

    // Сильное несоответствие
    if (Math.abs(diff) >= 3) return 30;

    // Умеренное несоответствие
    return 50;
  }

  /**
   * Скор по формату работы
   */
  private scoreWorkMode(
    jobWorkMode: string,
    preferredModes?: string[]
  ): number {
    if (!preferredModes || preferredModes.length === 0) return 80;

    const normalized = jobWorkMode.toLowerCase();

    if (preferredModes.includes(normalized)) return 100;

    // Частичное совпадение
    if (normalized.includes("remote") && preferredModes.includes("remote")) {
      return 100;
    }
    if (normalized.includes("hybrid") && preferredModes.includes("hybrid")) {
      return 90;
    }
    if (normalized.includes("onsite") && preferredModes.includes("onsite")) {
      return 80;
    }

    // Полное несоответствие
    return 20;
  }

  /**
   * Скор по локации
   */
  private scoreLocation(
    job: Job,
    preference?: JobPreference,
    relocationWilling?: boolean
  ): number {
    // Если remote - всегда высокий скор
    if (job.isRemote || job.locationType === "remote") {
      return 100;
    }

    if (!preference) return 70;

    // Проверка preferred locations
    const preferredLocations = preference.preferredLocations as any[] || [];
    if (preferredLocations.length === 0) return 70;

    // Упрощённая проверка - совпадение города/страны
    const jobCity = job.city?.toLowerCase() || "";
    const jobCountry = job.country?.toLowerCase() || "";

    for (const loc of preferredLocations) {
      const prefCity = loc.city?.toLowerCase() || "";
      const prefCountry = loc.country?.toLowerCase() || "";

      if (jobCity.includes(prefCity) || jobCountry.includes(prefCountry)) {
        return 100;
      }
    }

    // Если готов к релокации
    if (relocationWilling || preference.relocationWilling) {
      return 80;
    }

    return 30;
  }

  /**
   * Скор по зарплате
   */
  private scoreSalary(
    job: Job,
    candidateMinSalary?: number
  ): number {
    if (!job.salaryMin && !job.salaryMax) return 70; // Нет информации - нейтрально

    if (!candidateMinSalary) return 80; // Кандидат не указал ожидания

    const jobMax = job.salaryMax || job.salaryMin || 0;
    const jobMin = job.salaryMin || 0;

    // Если максимум вакансии ниже минимума кандидата
    if (jobMax < candidateMinSalary) {
      const ratio = jobMax / candidateMinSalary;
      if (ratio < 0.7) return 20; // Значительно ниже
      if (ratio < 0.85) return 50; // Немного ниже
      return 70; // Почти соответствует
    }

    // Если зарплата соответствует или выше
    if (jobMin >= candidateMinSalary) return 100;

    // Что-то посередине
    return 85;
  }

  /**
   * Найти уровень навыка у кандидата
   */
  private findSkillLevel(
    skill: string,
    candidateSkills: string[]
  ): SkillLevel | null {
    if (candidateSkills.some(s => this.matchesSkill(skill, s))) {
      return "advanced";
    }
    return null;
  }

  /**
   * Проверить соответствие навыков по границам слов / токенов
   */
  private matchesSkill(requiredSkill: string, candidateSkill: string): boolean {
    const req = requiredSkill.toLowerCase().trim();
    const cand = candidateSkill.toLowerCase().trim();
    if (!req || !cand) return false;
    if (req === cand) return true;

    // Handle common tech suffixes like .js / js, .ts / ts
    const normalizeTechSuffix = (s: string) => {
      if (s.endsWith(".js") || s.endsWith(".ts")) {
        return s.slice(0, -3);
      }
      if (s.length >= 5 && (s.endsWith("js") || s.endsWith("ts"))) {
        return s.slice(0, -2);
      }
      return s;
    };

    const normReq = normalizeTechSuffix(req);
    const normCand = normalizeTechSuffix(cand);
    if (normReq.length >= 3 && normReq === normCand) return true;

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isBoundaryMatch = (shortStr: string, longStr: string) => {
      // Delimiters: whitespace, slashes, commas, etc., but NOT hyphen or underscore (e.g. objective-c, react-native)
      const pattern = new RegExp(`(^|[^a-z0-9#+_-])` + escapeRegex(shortStr) + `($|[^a-z0-9#+_-])`, "i");
      return pattern.test(longStr);
    };

    return isBoundaryMatch(req, cand) || isBoundaryMatch(cand, req);
  }

  /**
   * Конвертировать уровень навыка в скор
   */
  private levelToScore(level: SkillLevel): number {
    const scores = {
      beginner: 40,
      intermediate: 70,
      advanced: 90,
      expert: 100,
    };
    return scores[level] || 50;
  }

  /**
   * Конвертировать годы опыта в seniority
   */
  private yearsToSeniority(years: number): string {
    if (years < 2) return "entry";
    if (years < 4) return "junior";
    if (years < 7) return "mid";
    if (years < 10) return "senior";
    if (years < 15) return "lead";
    return "principal";
  }

  /**
   * Парсить строку seniority в уровень
   */
  private seniorityStringToLevel(seniority: string): string | null {
    const normalized = seniority.toLowerCase();
    
    if (normalized.includes("entry") || normalized.includes("graduate")) return "entry";
    if (normalized.includes("junior") || normalized.includes("jr")) return "junior";
    if (normalized.includes("mid") || normalized.includes("middle")) return "mid";
    if (normalized.includes("senior")) return "senior";
    if (normalized.includes("lead")) return "lead";
    if (normalized.includes("principal")) return "principal";
    if (normalized.includes("staff")) return "staff";
    if (normalized.includes("director")) return "director";
    if (normalized.includes("vp") || normalized.includes("vice president")) return "vp";
    if (normalized.includes("c-level") || normalized.includes("chief")) return "c_level";
    
    return null;
  }

  /**
   * Вычислить схожесть текстов (упрощённо)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    // Для коротких текстов используем простое пересечение слов
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = [...words1].filter(w => words2.has(w));
    const union = new Set([...words1, ...words2]).size;
    
    return union > 0 ? intersection.length / union : 0;
  }
}
