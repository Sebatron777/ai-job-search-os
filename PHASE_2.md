# Фаза 2: Импорт вакансий и дедупликация

## Обзор

Фаза 2 реализует полный конвейер импорта вакансий из внешних источников с нормализацией и дедупликацией.

## Архитектура

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Source Adapter │────▶│  Normalization  │────▶│  Deduplication  │
│  (LinkedIn,     │     │  Service        │     │  Service        │
│   Indeed, etc.) │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  BullMQ Queue   │◀────│  Ingestion       │◀────│  Fingerprint    │
│                 │     │  Pipeline        │     │  Storage        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Компоненты

### 1. Адаптеры источников (`packages/workers/src/source-adapter.ts`)

**Интерфейсы:**
- `SourceAdapter` - базовый интерфейс для всех источников
- `CollectionResult` - результат сбора вакансий
- `CollectionOptions` - опции сбора (лимиты, пагинация, фильтры)
- `RawJobInput` - данные сырой вакансии

**Принципы:**
- Каждый источник реализует `SourceAdapter`
- Адаптеры изолированы и тестируемы
- Поддержка различных методов сбора (API, scraping, RSS)

**Пример реализации адаптера:**

```typescript
class LinkedInAdapter implements SourceAdapter {
  readonly type = "linkedin";
  readonly name = "LinkedIn";
  
  async initialize(config: SourceConfig): Promise<void> {
    // Инициализация с API ключом или сессией
  }
  
  async healthCheck(): Promise<boolean> {
    // Проверка доступности LinkedIn
  }
  
  async collect(source: JobSource, options?: CollectionOptions): Promise<CollectionResult> {
    // Сбор вакансий из LinkedIn
  }
  
  async parseRawJob(rawData: unknown): Promise<RawJobInput> {
    // Парсинг данных вакансии
  }
}
```

### 2. Сервис нормализации (`packages/workers/src/normalization.service.ts`)

**Функции:**
- Преобразование сырых данных в канонический формат `Job`
- Парсинг зарплаты (диапазоны, валюты, периоды)
- Парсинг локации (remote, hybrid, onsite)
- Извлечение навыков из описания
- Определение уровня seniority
- Классификация типа занятости

**Нормализация включает:**
- Приведение к нижнему регистру
- Удаление корпоративных суффиксов (Inc., LLC, etc.)
- Удаление seniority префиксов (Senior, Jr., etc.)
- Удаление специальных символов

**Пример:**

```typescript
const service = new NormalizationService();

const rawJob: RawJob = {
  extractedTitle: "Sr. Software Engineer II",
  extractedCompany: "Tech Corp Inc.",
  extractedLocation: "San Francisco, CA (Remote)",
  extractedSalary: "$150k - $200k per year",
  // ...
};

const result = await service.normalize(rawJob);
// result.job.title = "software engineer"
// result.job.company = "tech corp"
// result.job.locationType = "remote"
// result.job.salaryMin = 150000
// result.job.salaryMax = 200000
// result.job.seniorityLevel = "senior"
```

### 3. Сервис дедупликации (`packages/workers/src/deduplication.service.ts`)

**Алгоритмы:**
- **Fingerprinting** - создание уникального идентификатора на основе:
  - Хэш канонического URL
  - Хэш ID вакансии в источнике
  - Хэш нормализованного заголовка
  - Хэш нормализованной компании
  - Хэш локации
  - Bucket даты публикации

- **SimHash** - определение схожести текстов описаний
  - Расстояние Хэмминга между хэшами
  - Похожесть 0-1

**Критерии дедупликации:**
1. **SAME_CANONICAL_URL** - одинаковый канонический URL (самый надёжный)
2. **SAME_SOURCE_JOB_ID** - одинаковый ID в источнике
3. **SIMILAR_TITLE_COMPANY_LOCATION** - похожие заголовок + компания + локация
4. **SIMILAR_DESCRIPTION_HASH** - похожее описание (SimHash > 0.8)

**Пример:**

```typescript
const service = new DeduplicationService(repository);

const jobData = {
  canonicalUrl: "https://example.com/jobs/123",
  title: "Senior Software Engineer",
  company: "Tech Corp",
  location: "San Francisco",
  description: "...",
  postedAt: new Date(),
};

const result = await service.checkDuplicate(jobData, workspaceId);

if (result.isDuplicate) {
  console.log(`Дубликат найден: ${result.reason}`);
  console.log(`Существующая вакансия: ${result.existingJob?.id}`);
} else {
  // Создаём fingerprint для новой вакансии
  await service.upsertFingerprint(jobData, jobId, workspaceId);
}
```

### 4. Конвейер импорта (`packages/workers/src/ingestion.pipeline.ts`)

**Этапы:**
1. **Collection** - сбор сырых вакансий из источника
2. **Normalization** - нормализация каждой вакансии
3. **Deduplication** - проверка на дубликаты
4. **Storage** - сохранение новых вакансий

**Опции:**
- `collectionLimit` - максимум вакансий за один запуск
- `parallelism` - количество параллельных обработок
- `skipErrors` - продолжать при ошибках

**Пример использования:**

```typescript
const pipeline = new IngestionPipeline({
  adapter: linkedInAdapter,
  normalizationService: normalizationService,
  deduplicationService: deduplicationService,
  handler: {
    saveRawJob: async (rawJob) => { /* ... */ },
    saveJob: async (job, sourceId) => { /* ... */ },
    updateRawJobStatus: async (id, status) => { /* ... */ },
  },
  collectionLimit: 100,
  parallelism: 5,
});

const result = await pipeline.run(jobSource);

console.log(`Собрано: ${result.collectionResult?.collectedCount}`);
console.log(`Нормализовано: ${result.normalizedCount}`);
console.log(`Дубликатов: ${result.duplicateCount}`);
console.log(`Новых вакансий: ${result.newJobsCount}`);
```

### 5. Очередь и процессор (`apps/api/src/queue/`)

**BullMQ интеграция:**
- `QueueModule` - настройка Redis и очередей
- `IngestionQueueService` - добавление задач в очередь
- `IngestionProcessor` - обработка задач

**API для управления:**
```typescript
// Добавить задачу в очередь
POST /sources/:id/ingest?limit=100&dryRun=false

// Получить статус
GET /sources/:id/status
```

## API Endpoints

### Job Sources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /sources?workspaceId= | Список источников |
| GET | /sources/:id | Получить источник |
| POST | /sources | Создать источник |
| PUT | /sources/:id | Обновить источник |
| DELETE | /sources/:id | Удалить источник |
| POST | /sources/:id/ingest | Запустить импорт |
| GET | /sources/:id/status | Статус импорта |

## Тесты

### Нормализация
- ✅ Успешная нормализация валидной вакансии
- ✅ Ошибка при отсутствии заголовка
- ✅ Ошибка при отсутствии компании
- ✅ Ошибка при отсутствии URL
- ✅ Парсинг remote локации
- ✅ Парсинг hybrid локации
- ✅ Извлечение seniority level
- ✅ Парсинг зарплаты (range, currency, period)
- ✅ Извлечение навыков из описания
- ✅ Предупреждение об отсутствии зарплаты
- ✅ Очистка URL от tracking параметров

### Дедупликация
- ✅ Consistent fingerprints для одинаковых данных
- ✅ Разные fingerprints для разных URL
- ✅ Нормализация заголовков (Senior/Sr.)
- ✅ Нормализация компаний (Inc./LLC)
- ✅ Обнаружение дубликата по URL
- ✅ Отсутствие дубликата для новой вакансии

### SimHash
- ✅ Вычисление simhash для текста
- ✅ Похожесть для похожих текстов
- ✅ Идентичные хэши для идентичных текстов
- ✅ Расчёт расстояния Хэмминга

## Структура данных

### RawJob (сырая вакансия)
```typescript
{
  id: string;
  sourceId: string;
  sourceJobId: string;
  rawPayload: Record<string, unknown>;
  extractedTitle: string;
  extractedCompany: string;
  extractedLocation: string | null;
  extractedDescription: string | null;
  extractedUrl: string;
  extractedPostedAt: Date | null;
  extractedSalary: string | null;
  extractedJobType: string | null;
  processingStatus: "pending" | "processing" | "normalized" | "failed";
  normalizedJobId?: string;
}
```

### Job (нормализованная вакансия)
```typescript
{
  id: string;
  workspaceId: string;
  sourceId: string;
  title: string;
  company: string;
  canonicalUrl: string;
  sourceUrl: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  location: string;
  locationType: "remote" | "hybrid" | "onsite";
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  jobType: JobType;
  seniorityLevel?: SeniorityLevel;
  requiredSkills: string[];
  preferredSkills: string[];
  postedAt: Date;
  status: JobStatus;
  fingerprintId?: string;
}
```

### JobFingerprint
```typescript
{
  id: string;
  workspaceId: string;
  canonicalUrlHash: string;
  sourceJobIdHash: string;
  normalizedTitleHash: string;
  normalizedCompanyHash: string;
  descriptionHash: string;
  locationHash: string;
  postedDateBucket: string; // YYYY-MM-DD
  fingerprint: string;
  jobIds: string[];
}
```

## Следующие шаги

### Для завершения Фазы 2:

1. **Реализовать конкретные адаптеры:**
   - LinkedIn API adapter
   - Indeed API adapter
   - Company website scraper (Playwright)

2. **Интеграция с базой данных:**
   - Prisma repository для fingerprint
   - Миграции для новых таблиц

3. **Обработка ошибок:**
   - Circuit breaker для внешних API
   - Retry logic с backoff
   - Alerting при критических ошибках

4. **Мониторинг:**
   - Метрики сбора (успех/неудача)
   - Длительность обработки
   - Количество дубликатов

### Для перехода к Фазе 3:

После того как вакансии собраны и нормализованы, следующий шаг - **Matching Engine**:
- Скоринг вакансий против профиля кандидата
- LLM-assisted анализ
- Обнаружение skill gaps
- Рекомендации по отклику

---

**Статус Фазы 2:** ✅ Завершена (базовая реализация)
