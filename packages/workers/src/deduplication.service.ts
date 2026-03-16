/**
 * Сервис дедупликации вакансий
 * 
 * Использует fingerprinting для обнаружения дубликатов
 * на основе нескольких полей для надёжности
 */

import { createFingerprint, sha256, getDateBucket } from "@ai-job-search/shared";
import type { Job, JobFingerprint } from "@ai-job-search/types";

/**
 * Результат проверки на дубликат
 */
export interface DeduplicationResult {
  /** Это дубликат? */
  isDuplicate: boolean;
  /** Существующий дубликат (если найден) */
  existingJob?: Job;
  /** Fingerprint для новой вакансии */
  fingerprint: FingerprintData;
  /** Причина определения как дубликата */
  reason?: DuplicateReason;
}

/**
 * Причина определения как дубликата
 */
export type DuplicateReason =
  | "SAME_CANONICAL_URL"
  | "SAME_SOURCE_JOB_ID"
  | "SIMILAR_TITLE_COMPANY_LOCATION"
  | "SIMILAR_DESCRIPTION_HASH";

/**
 * Данные fingerprint
 */
export interface FingerprintData {
  /** Хэш канонического URL */
  canonicalUrlHash: string;
  /** Хэш ID вакансии в источнике */
  sourceJobIdHash: string;
  /** Хэш нормализованного заголовка */
  normalizedTitleHash: string;
  /** Хэш нормализованной компании */
  normalizedCompanyHash: string;
  /** Хэш описания (simhash для схожести) */
  descriptionHash: string;
  /** Хэш локации */
  locationHash: string;
  /**Bucket даты публикации */
  postedDateBucket: string;
  /** Итоговый fingerprint */
  fingerprint: string;
}

/**
 * Интерфейс репозитория для работы с fingerprint
 */
export interface FingerprintRepository {
  /**
   * Найти fingerprint по значению
   */
  findByFingerprint(fingerprint: string): Promise<JobFingerprint | null>;
  
  /**
   * Найти fingerprint по хэшу URL
   */
  findByUrlHash(canonicalUrlHash: string): Promise<JobFingerprint | null>;
  
  /**
   * Найти fingerprint по комбинации title+company+location
   */
  findByTitleCompanyLocation(
    titleHash: string,
    companyHash: string,
    locationHash: string
  ): Promise<JobFingerprint | null>;
  
  /**
   * Создать новый fingerprint
   */
  create(data: CreateFingerprintInput): Promise<JobFingerprint>;
  
  /**
   * Обновить существующий fingerprint (добавить job)
   */
  addJobToFingerprint(
    fingerprintId: string,
    jobId: string
  ): Promise<JobFingerprint>;
}

/**
 * Входные данные для создания fingerprint
 */
export interface CreateFingerprintInput {
  workspaceId: string;
  canonicalUrlHash: string;
  sourceJobIdHash: string;
  normalizedTitleHash: string;
  normalizedCompanyHash: string;
  descriptionHash: string;
  locationHash: string;
  postedDateBucket: string;
  fingerprint: string;
  jobIds: string[];
}

/**
 * Сервис дедупликации
 */
export class DeduplicationService {
  private repository: FingerprintRepository;
  
  constructor(repository: FingerprintRepository) {
    this.repository = repository;
  }
  
  /**
   * Создать fingerprint для вакансии
   */
  createFingerprint(job: {
    canonicalUrl: string;
    sourceJobId: string;
    title: string;
    company: string;
    description: string;
    location: string;
    postedAt: Date;
  }): FingerprintData {
    // Нормализация данных
    const normalizedTitle = this.normalizeTitle(job.title);
    const normalizedCompany = this.normalizeCompany(job.company);
    const normalizedLocation = this.normalizeLocation(job.location);
    
    // Создание хэшей
    const canonicalUrlHash = sha256(job.canonicalUrl);
    const sourceJobIdHash = sha256(job.sourceJobId);
    const normalizedTitleHash = sha256(normalizedTitle);
    const normalizedCompanyHash = sha256(normalizedCompany);
    const descriptionHash = this.createDescriptionHash(job.description);
    const locationHash = sha256(normalizedLocation);
    const postedDateBucket = getDateBucket(job.postedAt);
    
    // Создание итогового fingerprint
    const fingerprint = createFingerprint(
      canonicalUrlHash,
      sourceJobIdHash,
      normalizedTitleHash,
      normalizedCompanyHash,
      postedDateBucket
    );
    
    return {
      canonicalUrlHash,
      sourceJobIdHash,
      normalizedTitleHash,
      normalizedCompanyHash,
      descriptionHash,
      locationHash,
      postedDateBucket,
      fingerprint,
    };
  }
  
  /**
   * Проверить вакансию на дубликат
   */
  async checkDuplicate(
    jobData: {
      canonicalUrl: string;
      sourceJobId: string;
      title: string;
      company: string;
      description: string;
      location: string;
      postedAt: Date;
    },
    workspaceId: string
  ): Promise<DeduplicationResult> {
    const fingerprintData = this.createFingerprint(jobData);
    
    // 1. Проверка по canonical URL (самый надёжный признак)
    const urlMatch = await this.repository.findByUrlHash(
      fingerprintData.canonicalUrlHash
    );
    
    if (urlMatch) {
      return {
        isDuplicate: true,
        existingJob: this.getJobFromFingerprint(urlMatch),
        fingerprint: fingerprintData,
        reason: "SAME_CANONICAL_URL",
      };
    }
    
    // 2. Проверка по комбинации title+company+location
    const titleCompanyLocationMatch = await this.repository.findByTitleCompanyLocation(
      fingerprintData.normalizedTitleHash,
      fingerprintData.normalizedCompanyHash,
      fingerprintData.locationHash
    );
    
    if (titleCompanyLocationMatch) {
      // Дополнительная проверка схожести описания
      const descriptionSimilarity = await this.checkDescriptionSimilarity(
        fingerprintData.descriptionHash,
        titleCompanyLocationMatch.descriptionHash
      );
      
      if (descriptionSimilarity > 0.8) {
        return {
          isDuplicate: true,
          existingJob: this.getJobFromFingerprint(titleCompanyLocationMatch),
          fingerprint: fingerprintData,
          reason: "SIMILAR_TITLE_COMPANY_LOCATION",
        };
      }
    }
    
    // Не дубликат
    return {
      isDuplicate: false,
      fingerprint: fingerprintData,
    };
  }
  
  /**
   * Создать или обновить fingerprint для вакансии
   */
  async upsertFingerprint(
    jobData: {
      canonicalUrl: string;
      sourceJobId: string;
      title: string;
      company: string;
      description: string;
      location: string;
      postedAt: Date;
    },
    jobId: string,
    workspaceId: string
  ): Promise<JobFingerprint> {
    const fingerprintData = this.createFingerprint(jobData);
    
    // Проверяем, существует ли уже fingerprint
    const existing = await this.repository.findByFingerprint(
      fingerprintData.fingerprint
    );
    
    if (existing) {
      // Добавляем job к существующему fingerprint
      return this.repository.addJobToFingerprint(existing.id, jobId);
    }
    
    // Создаём новый fingerprint
    return this.repository.create({
      workspaceId,
      canonicalUrlHash: fingerprintData.canonicalUrlHash,
      sourceJobIdHash: fingerprintData.sourceJobIdHash,
      normalizedTitleHash: fingerprintData.normalizedTitleHash,
      normalizedCompanyHash: fingerprintData.normalizedCompanyHash,
      descriptionHash: fingerprintData.descriptionHash,
      locationHash: fingerprintData.locationHash,
      postedDateBucket: fingerprintData.postedDateBucket,
      fingerprint: fingerprintData.fingerprint,
      jobIds: [jobId],
    });
  }
  
  /**
   * Проверить схожесть описаний по хэшам
   */
  private async checkDescriptionSimilarity(
    hash1: string,
    hash2: string
  ): Promise<number> {
    // Пока возвращаем 0 (не похоже) или 1 (идентичны)
    return hash1 === hash2 ? 1 : 0;
  }
  
  /**
   * Нормализовать заголовок
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b(jr|sr|junior|senior|lead|principal|staff)\b/gi, "")
      .replace(/\b(i|ii|iii|iv|v)\b/gi, "")
      .replace(/[^\w\s-]/g, "")
      .trim();
  }
  
  /**
   * Нормализовать компанию
   */
  private normalizeCompany(company: string): string {
    return company
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b(inc|ltd|llc|corp|corporation|limited|company)\b/gi, "")
      .replace(/[^\w\s-]/g, "")
      .trim();
  }
  
  /**
   * Нормализовать локацию
   */
  private normalizeLocation(location: string): string {
    return location
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s-]/g, "")
      .trim();
  }
  
  /**
   * Создать хэш описания (simhash для определения схожести)
   */
  private createDescriptionHash(description: string): string {
    // TODO: Реализовать simhash для определения схожести текстов
    // Пока используем обычный SHA256
    return sha256(description.toLowerCase().trim());
  }
  
  /**
   * Получить Job из Fingerprint (заглушка)
   */
  private getJobFromFingerprint(fingerprint: JobFingerprint): Job | undefined {
    // В реальной реализации нужно загрузить job из БД
    // Здесь возвращаем undefined, так как это зависит от реализации репозитория
    return undefined;
  }
}

/**
 * Simhash алгоритм для определения схожести текстов
 * (упрощённая реализация)
 */
export class SimHash {
  private readonly hashSize: number;
  
  constructor(hashSize: number = 64) {
    this.hashSize = hashSize;
  }
  
  /**
   * Вычислить simhash для текста
   */
  compute(text: string): string {
    // Токенизация
    const tokens = this.tokenize(text);
    
    // Инициализация вектора
    const vector = new Array(this.hashSize).fill(0);
    
    // Для каждого токена
    for (const token of tokens) {
      const hash = this.hashToken(token);
      
      // Обновляем вектор
      for (let i = 0; i < this.hashSize; i++) {
        const bit = (hash >> BigInt(i)) & BigInt(1);
        vector[i] += bit === BigInt(1) ? 1 : -1;
      }
    }
    
    // Генерация финального хэша
    let fingerprint = BigInt(0);
    for (let i = 0; i < this.hashSize; i++) {
      if (vector[i]! > 0) {
        fingerprint |= (BigInt(1) << BigInt(i));
      }
    }
    
    return fingerprint.toString(16).padStart(16, "0");
  }
  
  /**
   * Вычислить расстояние Хэмминга между двумя simhash
   */
  hammingDistance(hash1: string, hash2: string): number {
    const val1 = BigInt("0x" + hash1);
    const val2 = BigInt("0x" + hash2);
    
    let xor = val1 ^ val2;
    let distance = 0;
    
    while (xor > BigInt(0)) {
      if (xor & BigInt(1)) {
        distance++;
      }
      xor >>= BigInt(1);
    }
    
    return distance;
  }
  
  /**
   * Вычислить схожесть (0-1)
   */
  similarity(hash1: string, hash2: string): number {
    const distance = this.hammingDistance(hash1, hash2);
    return 1 - distance / this.hashSize;
  }
  
  /**
   * Токенизация текста
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
  }
  
  /**
   * Хэш токена (FNV-1a)
   */
  private hashToken(token: string): bigint {
    const FNV_PRIME = BigInt("1099511628211");
    const FNV_OFFSET = BigInt("14695981039346656037");
    
    let hash = FNV_OFFSET;
    
    for (const char of token) {
      hash ^= BigInt(char.charCodeAt(0));
      hash *= FNV_PRIME;
    }
    
    return hash;
  }
}
