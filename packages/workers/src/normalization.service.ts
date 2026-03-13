/**
 * Сервис нормализации вакансий
 * 
 * Преобразует сырые данные из различных источников
 * в канонический формат Job
 */

import type { RawJob, Job, JobType, WorkMode, SeniorityLevel } from "@ai-job-search/types";
import {
  normalizeText,
  normalizeCompanyName,
  normalizeJobTitle,
  extractDomain,
  parseDate,
} from "@ai-job-search/shared";

/**
 * Результат нормализации
 */
export interface NormalizationResult {
  /** Успешно ли нормализовано */
  success: boolean;
  /** Нормализованная вакансия (если успешно) */
  job?: JobInput;
  /** Ошибки нормализации */
  errors?: NormalizationError[];
  /** Предупреждения (некритичные проблемы) */
  warnings?: string[];
}

/**
 * Ошибка нормализации
 */
export interface NormalizationError {
  /** Поле, где произошла ошибка */
  field: string;
  /** Код ошибки */
  code: string;
  /** Сообщение */
  message: string;
  /** Исходное значение */
  originalValue?: unknown;
}

/**
 * Входные данные для создания Job
 */
export interface JobInput {
  title: string;
  company: string;
  canonicalUrl: string;
  sourceUrl: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  locationType: WorkMode;
  country?: string;
  city?: string;
  state?: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: "hourly" | "monthly" | "yearly";
  salaryDisplay?: string;
  jobType: JobType;
  seniorityLevel?: SeniorityLevel;
  industry?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  postedAt: Date;
  expiresAt?: Date;
  applicationDeadline?: Date;
}

/**
 * Парсер описания вакансии
 */
export interface DescriptionParser {
  /**
   * Извлечь требования из описания
   */
  extractRequirements(description: string): string[];
  
  /**
   * Извлечь обязанности из описания
   */
  extractResponsibilities(description: string): string[];
  
  /**
   * Извлечь benefits из описания
   */
  extractBenefits(description: string): string[];
  
  /**
   * Извлечь навыки из описания
   */
  extractSkills(description: string): {
    required: string[];
    preferred: string[];
  };
}

/**
 * Парсер зарплаты
 */
export interface SalaryParser {
  /**
   * Распарсить зарплату из строки
   * 
   * @param salaryText - Текст с зарплатой (например, "$120k - $150k")
   * @returns Распарсенные данные
   */
  parse(salaryText: string): SalaryData | null;
}

/**
 * Распарсенные данные о зарплате
 */
export interface SalaryData {
  min: number;
  max: number;
  currency: string;
  period: "hourly" | "monthly" | "yearly";
  display: string;
}

/**
 * Парсер локации
 */
export interface LocationParser {
  /**
   * Распарсить локацию из строки
   * 
   * @param locationText - Текст локации
   * @returns Распарсенные данные
   */
  parse(locationText: string): LocationData;
}

/**
 * Распарсенные данные о локации
 */
export interface LocationData {
  fullLocation: string;
  country?: string;
  state?: string;
  city?: string;
  isRemote: boolean;
  locationType: WorkMode;
}

/**
 * Сервис нормализации вакансий
 */
export class NormalizationService {
  private descriptionParser: DescriptionParser;
  private salaryParser: SalaryParser;
  private locationParser: LocationParser;
  
  constructor(options?: {
    descriptionParser?: DescriptionParser;
    salaryParser?: SalaryParser;
    locationParser?: LocationParser;
  }) {
    this.descriptionParser = options?.descriptionParser || new DefaultDescriptionParser();
    this.salaryParser = options?.salaryParser || new DefaultSalaryParser();
    this.locationParser = options?.locationParser || new DefaultLocationParser();
  }
  
  /**
   * Нормализовать сырую вакансию
   */
  async normalize(rawJob: RawJob): Promise<NormalizationResult> {
    const errors: NormalizationError[] = [];
    const warnings: string[] = [];
    
    try {
      // Валидация обязательных полей
      if (!rawJob.extractedTitle) {
        errors.push({
          field: "extractedTitle",
          code: "MISSING_TITLE",
          message: "Название вакансии отсутствует",
          originalValue: rawJob.extractedTitle,
        });
      }
      
      if (!rawJob.extractedCompany) {
        errors.push({
          field: "extractedCompany",
          code: "MISSING_COMPANY",
          message: "Название компании отсутствует",
          originalValue: rawJob.extractedCompany,
        });
      }
      
      if (!rawJob.extractedUrl) {
        errors.push({
          field: "extractedUrl",
          code: "MISSING_URL",
          message: "URL вакансии отсутствует",
          originalValue: rawJob.extractedUrl,
        });
      }
      
      if (errors.length > 0) {
        return { success: false, errors };
      }
      
      // Парсинг описания
      const description = rawJob.extractedDescription || "";
      const { requirements, responsibilities, benefits } = 
        this.descriptionParser.parseDescription(description);
      
      // Парсинг зарплаты
      const salaryData = rawJob.extractedSalary 
        ? this.salaryParser.parse(rawJob.extractedSalary)
        : null;
      
      // Парсинг локации
      const locationData = this.locationParser.parse(
        rawJob.extractedLocation || ""
      );
      
      // Определение типа занятости
      const jobType = this.parseJobType(rawJob.extractedJobType);
      
      // Определение уровня seniority
      const seniorityLevel = this.parseSeniorityLevel(
        rawJob.extractedTitle,
        description
      );
      
      // Извлечение навыков
      const skills = this.descriptionParser.extractSkills(description);
      
      // Парсинг даты публикации
      const postedAt = parseDate(rawJob.extractedPostedAt || new Date());
      
      // Формирование результата
      const job: JobInput = {
        title: normalizeText(rawJob.extractedTitle),
        company: normalizeCompanyName(rawJob.extractedCompany),
        canonicalUrl: this.buildCanonicalUrl(rawJob.extractedUrl),
        sourceUrl: rawJob.extractedUrl,
        description: description.trim(),
        requirements,
        responsibilities,
        benefits,
        location: locationData.fullLocation,
        locationType: locationData.locationType,
        country: locationData.country,
        city: locationData.city,
        state: locationData.state,
        isRemote: locationData.isRemote,
        salaryMin: salaryData?.min,
        salaryMax: salaryData?.max,
        salaryCurrency: salaryData?.currency,
        salaryPeriod: salaryData?.period,
        salaryDisplay: salaryData?.display || rawJob.extractedSalary || undefined,
        jobType,
        seniorityLevel,
        requiredSkills: skills.required,
        preferredSkills: skills.preferred,
        postedAt: postedAt || new Date(),
        expiresAt: undefined,
        applicationDeadline: undefined,
      };
      
      // Добавление предупреждений
      if (!salaryData) {
        warnings.push("Зарплата не указана");
      }
      
      if (skills.required.length === 0) {
        warnings.push("Навыки не извлечены");
      }
      
      return {
        success: true,
        job,
        warnings,
      };
    } catch (error) {
      errors.push({
        field: "_global",
        code: "NORMALIZATION_ERROR",
        message: error instanceof Error ? error.message : "Неизвестная ошибка",
        originalValue: rawJob,
      });
      
      return { success: false, errors };
    }
  }
  
  /**
   * Построить канонический URL
   */
  private buildCanonicalUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Удаляем UTM-метки и другие параметры трекинга
      urlObj.search = "";
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  /**
   * Определить тип занятости
   */
  private parseJobType(jobTypeText?: string | null): JobType {
    if (!jobTypeText) return "full_time";
    
    const normalized = normalizeText(jobTypeText);
    
    if (normalized.includes("part time") || normalized.includes("part_time")) {
      return "part_time";
    }
    if (normalized.includes("contract") || normalized.includes("contractor")) {
      return "contract";
    }
    if (normalized.includes("intern")) {
      return "internship";
    }
    if (normalized.includes("apprentice")) {
      return "apprenticeship";
    }
    
    return "full_time";
  }
  
  /**
   * Определить уровень seniority
   */
  private parseSeniorityLevel(title: string, description: string): SeniorityLevel | undefined {
    const combined = normalizeText(`${title} ${description}`);
    
    if (combined.includes("c-level") || combined.includes("chief")) {
      return "c_level";
    }
    if (combined.includes("vp") || combined.includes("vice president")) {
      return "vp";
    }
    if (combined.includes("director")) {
      return "director";
    }
    if (combined.includes("principal")) {
      return "principal";
    }
    if (combined.includes("staff")) {
      return "staff";
    }
    if (combined.includes("lead") || combined.includes("lead")) {
      return "lead";
    }
    if (combined.includes("senior") || combined.includes("sr")) {
      return "senior";
    }
    if (combined.includes("mid") || combined.includes("middle")) {
      return "mid";
    }
    if (combined.includes("junior") || combined.includes("jr")) {
      return "junior";
    }
    if (combined.includes("entry") || combined.includes("graduate")) {
      return "entry";
    }
    
    return undefined;
  }
}

/**
 * Парсер описания по умолчанию
 */
class DefaultDescriptionParser implements DescriptionParser {
  extractRequirements(description: string): string[] {
    return this.extractSection(description, [
      "requirements",
      "qualifications",
      "you must have",
      "must have",
      "required skills",
    ]);
  }
  
  extractResponsibilities(description: string): string[] {
    return this.extractSection(description, [
      "responsibilities",
      "you will",
      "your role",
      "what you'll do",
      "duties",
    ]);
  }
  
  extractBenefits(description: string): string[] {
    return this.extractSection(description, [
      "benefits",
      "perks",
      "we offer",
      "what we offer",
      "compensation",
    ]);
  }
  
  extractSkills(description: string): { required: string[]; preferred: string[] } {
    const commonSkills = [
      "javascript", "typescript", "python", "java", "go", "rust",
      "react", "vue", "angular", "svelte",
      "node.js", "nodejs", "express", "nestjs",
      "postgresql", "mysql", "mongodb", "redis",
      "aws", "gcp", "azure", "docker", "kubernetes",
      "graphql", "rest", "api",
    ];
    
    const foundSkills: string[] = [];
    const normalized = description.toLowerCase();
    
    for (const skill of commonSkills) {
      if (normalized.includes(skill)) {
        foundSkills.push(skill.toUpperCase());
      }
    }
    
    // Разделяем на required/preferred по контексту
    const required: string[] = [];
    const preferred: string[] = [];
    
    for (const skill of foundSkills) {
      const skillLower = skill.toLowerCase();
      if (
        normalized.includes(`required ${skillLower}`) ||
        normalized.includes(`must have ${skillLower}`)
      ) {
        required.push(skill);
      } else if (
        normalized.includes(`preferred ${skillLower}`) ||
        normalized.includes(`nice to have ${skillLower}`) ||
        normalized.includes(`familiarity with ${skillLower}`)
      ) {
        preferred.push(skill);
      } else {
        // По умолчанию считаем required
        required.push(skill);
      }
    }
    
    return { required, preferred };
  }
  
  /**
   * Извлечь секцию по ключевым словам
   */
  private extractSection(description: string, keywords: string[]): string[] {
    const normalized = description.toLowerCase();
    const items: string[] = [];
    
    for (const keyword of keywords) {
      const index = normalized.indexOf(keyword);
      if (index === -1) continue;
      
      // Извлекаем текст после ключевого слова
      const section = description.slice(index + keyword.length);
      
      // Разбиваем на пункты по маркерам списка
      const lines = section.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // Пропускаем заголовки
        if (trimmed.length < 10) continue;
        if (trimmed.endsWith(":")) continue;
        
        // Очищаем от маркеров списка
        const cleaned = trimmed.replace(/^[-•*]\s*/, "");
        if (cleaned.length > 10) {
          items.push(cleaned);
        }
        
        // Ограничиваем количество пунктов
        if (items.length >= 10) break;
      }
      
      if (items.length > 0) break;
    }
    
    return items;
  }
  
  parseDescription(description: string): {
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
  } {
    return {
      requirements: this.extractRequirements(description),
      responsibilities: this.extractResponsibilities(description),
      benefits: this.extractBenefits(description),
    };
  }
}

/**
 * Парсер зарплаты по умолчанию
 */
class DefaultSalaryParser implements SalaryParser {
  parse(salaryText: string): SalaryData | null {
    if (!salaryText) return null;
    
    const normalized = salaryText.toLowerCase();
    
    // Определение периода
    let period: "hourly" | "monthly" | "yearly" = "yearly";
    if (normalized.includes("/hour") || normalized.includes("per hour")) {
      period = "hourly";
    } else if (normalized.includes("/month") || normalized.includes("per month")) {
      period = "monthly";
    }
    
    // Определение валюты
    let currency = "USD";
    if (normalized.includes("€") || normalized.includes("eur")) {
      currency = "EUR";
    } else if (normalized.includes("£") || normalized.includes("gbp")) {
      currency = "GBP";
    }
    
    // Извлечение чисел
    const numbers = normalized.match(/[\d,.]+[kmb]?/g);
    if (!numbers || numbers.length === 0) return null;
    
    const parseNumber = (numStr: string): number => {
      const clean = numStr.replace(/[,.]/g, "");
      let value = parseFloat(clean);
      
      if (numStr.toLowerCase().includes("k")) {
        value *= 1000;
      } else if (numStr.toLowerCase().includes("m")) {
        value *= 1000000;
      }
      
      return value;
    };
    
    let min: number;
    let max: number;
    
    if (numbers.length >= 2) {
      min = parseNumber(numbers[0]!);
      max = parseNumber(numbers[1]!);
    } else {
      // Одно число - используем как min, max = min * 1.2
      min = parseNumber(numbers[0]!);
      max = Math.round(min * 1.2);
    }
    
    return {
      min,
      max,
      currency,
      period,
      display: salaryText,
    };
  }
}

/**
 * Парсер локации по умолчанию
 */
class DefaultLocationParser implements LocationParser {
  parse(locationText: string): LocationData {
    if (!locationText) {
      return {
        fullLocation: "Unknown",
        isRemote: false,
        locationType: "onsite",
      };
    }
    
    const normalized = locationText.toLowerCase();
    
    // Определение remote
    const isRemote = 
      normalized.includes("remote") ||
      normalized.includes("work from home") ||
      normalized.includes("distributed");
    
    // Определение hybrid
    const isHybrid = 
      normalized.includes("hybrid") ||
      (normalized.includes("flexible") && !isRemote);
    
    let locationType: WorkMode = "onsite";
    if (isRemote) locationType = "remote";
    else if (isHybrid) locationType = "hybrid";
    
    // Парсинг города/страны
    const parts = locationText.split(",").map(p => p.trim());
    
    return {
      fullLocation: locationText,
      city: parts[0],
      state: parts[1],
      country: parts[parts.length - 1],
      isRemote,
      locationType,
    };
  }
}
