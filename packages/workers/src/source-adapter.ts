/**
 * Интерфейсы для адаптеров источников вакансий
 * 
 * Все источники вакансий должны реализовывать эти интерфейсы
 * для обеспечения единообразия и тестируемости
 */

import type { JobSource, RawJob } from "@ai-job-search/types";

/**
 * Результат сбора вакансий из источника
 */
export interface CollectionResult {
  /** Количество собранных вакансий */
  collectedCount: number;
  /** Количество ошибок */
  errorCount: number;
  /** Ошибки с деталями */
  errors: CollectionError[];
  /** Время начала сбора */
  startedAt: Date;
  /** Время окончания сбора */
  completedAt: Date;
  /** Список собранных вакансий */
  collectedJobs?: RawJobInput[];
}

/**
 * Ошибка сбора
 */
export interface CollectionError {
  /** URL или идентификатор, где произошла ошибка */
  location: string;
  /** Код ошибки */
  code: string;
  /** Сообщение об ошибке */
  message: string;
  /** Стек ошибки (для отладки) */
  stack?: string;
}

/**
 * Конфигурация для конкретного источника
 */
export interface SourceConfig {
  /** URL для сбора (если применимо) */
  baseUrl?: string;
  /** URL поиска */
  searchUrl?: string;
  /** API ключ */
  apiKey?: string;
  /** Дополнительные параметры */
  [key: string]: unknown;
}

/**
 * Интерфейс адаптера источника вакансий
 * 
 * Каждый источник (LinkedIn, Indeed, и т.д.) должен реализовать этот интерфейс
 */
export interface SourceAdapter {
  /**
   * Тип источника (должен совпадать с JobSourceType)
   */
  readonly type: string;
  
  /**
   * Название источника
   */
  readonly name: string;
  
  /**
   * Инициализация адаптера с конфигурацией
   */
  initialize(config: SourceConfig): Promise<void>;
  
  /**
   * Проверка доступности источника
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Сбор вакансий из источника
   * 
   * @param source - Конфигурация источника
   * @param options - Опции сбора
   * @returns Результат сбора
   */
  collect(source: JobSource, options?: CollectionOptions): Promise<CollectionResult>;
  
  /**
   * Парсинг сырой вакансии из HTML/JSON
   * 
   * @param rawData - Сырые данные от источника
   * @returns Распарсенная вакансия
   */
  parseRawJob(rawData: unknown): Promise<RawJobInput>;
}

/**
 * Опции для сбора вакансий
 */
export interface CollectionOptions {
  /** Максимальное количество вакансий для сбора */
  limit?: number;
  /** Начальная страница (для пагинации) */
  page?: number;
  /** Размер страницы */
  pageSize?: number;
  /** Ключевые слова для поиска */
  keywords?: string[];
  /** Локация для поиска */
  location?: string;
  /** Фильтр по типу занятости */
  jobTypes?: string[];
  /** Только новые вакансии (после этой даты) */
  since?: Date;
  /** Отладочный режим */
  dryRun?: boolean;
}

/**
 * Входные данные для создания RawJob
 */
export interface RawJobInput {
  /** ID вакансии в источнике */
  sourceJobId: string;
  /** Сырой payload (оригинальные данные) */
  rawPayload: Record<string, unknown>;
  /** Извлечённый заголовок */
  extractedTitle: string;
  /** Извлечённая компания */
  extractedCompany: string;
  /** Извлечённая локация */
  extractedLocation: string | null;
  /** Извлечённое описание */
  extractedDescription: string | null;
  /** Извлечённый URL */
  extractedUrl: string;
  /** Извлечённая дата публикации */
  extractedPostedAt: Date | null;
  /** Статус обработки */
  processingStatus?: string;
  /** Таймстампы */
  createdAt?: Date;
  updatedAt?: Date;
  /** Извлечённая зарплата (как строка) */
  extractedSalary?: string | null;
  /** Извлечённый тип занятости */
  extractedJobType?: string | null;
}

/**
 * Стратегия пагинации для источников
 */
export interface PaginationStrategy {
  /**
   * Получить следующую страницу
   */
  getNextPage(currentPage: number): Promise<number | null>;
  
  /**
   * Проверить, есть ли ещё страницы
   */
  hasMorePages(currentPage: number, items: unknown[]): boolean;
  
  /**
   * Получить параметр страницы для запроса
   */
  getPageParam(page: number): Record<string, string | number>;
}

/**
 * Стратегия анти-бот защиты
 */
export interface AntiBotStrategy {
  /**
   * Получить задержку перед запросом (мс)
   */
  getDelay(requestNumber: number): number;
  
  /**
   * Получить заголовки для запроса
   */
  getHeaders(): Record<string, string>;
  
  /**
   * Обработать ответ на предмет блокировок
   */
  checkForBlock(response: Response): Promise<boolean>;
}

/**
 * Фабрика для создания адаптеров
 */
export interface SourceAdapterFactory {
  /**
   * Создать адаптер для типа источника
   */
  create(type: string): SourceAdapter;
  
  /**
   * Зарегистрировать адаптер
   */
  register(type: string, adapter: SourceAdapter): void;
  
  /**
   * Получить все зарегистрированные типы
   */
  getRegisteredTypes(): string[];
}
