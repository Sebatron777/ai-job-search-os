# AI Job Search OS - Сводка по Фазе 2

## ✅ Завершено: Импорт вакансий и дедупликация

### Что было реализовано

#### 1. Пакет `@ai-job-search/workers`

Новый общий пакет с логикой для воркеров:

**Файлы:**
- `src/source-adapter.ts` - Интерфейсы для адаптеров источников
- `src/normalization.service.ts` - Сервис нормализации вакансий
- `src/deduplication.service.ts` - Сервис дедупликации + SimHash
- `src/ingestion.pipeline.ts` - Конвейер импорта
- `src/*.test.ts` - Тесты для сервисов

**Функциональность:**

##### Адаптеры источников
- **Интерфейс `SourceAdapter`** - контракт для всех источников
- **Типы источников:** LinkedIn, Indeed, Glassdoor, Wellfound, Y Combininator, Remote OK, WeWorkRemotely, company websites, RSS feeds
- **Анти-бот стратегии** - задержки, заголовки, проверка блокировок
- **Стратегии пагинации** - для разных типов источников

##### Нормализация
- **Парсинг зарплаты** - диапазоны, валюты (USD/EUR/GBP), периоды (hourly/monthly/yearly)
- **Парсинг локации** - remote/hybrid/onsite, город/страна
- **Извлечение навыков** - required vs preferred
- **Определение seniority** - entry/junior/mid/senior/lead/principal/staff/director/vp/c_level
- **Классификация job type** - full_time/part_time/contract/internship/apprenticeship
- **Очистка URL** - удаление UTM-меток

##### Дедупликация
- **Fingerprinting** - многопольный хэш для идентификации
- **SimHash** - определение схожести описаний
- **Критерии:**
  - Одинаковый канонический URL
  - Одинаковый source job ID
  - Похожие title + company + location
  - Похожее описание (SimHash > 0.8)

##### Конвейер импорта
- **4 этапа:** Collection → Normalization → Deduplication → Storage
- **Параллелизм** - настройка количества одновременных обработок
- **Обработка ошибок** - continue on error模式
- **Трекинг** - подсчёт нормализованных, дубликатов, новых

#### 2. Интеграция с API (NestJS)

**Новые модули:**
- `src/queue/queue.module.ts` - BullMQ интеграция
- `src/queue/ingestion-queue.service.ts` - сервис очереди
- `src/queue/ingestion.processor.ts` - процессор задач
- Обновлён `src/job-sources/job-sources.service.ts`
- Обновлён `src/job-sources/job-sources.controller.ts`
- Обновлён `src/app.module.ts`

**Новые API эндпоинты:**

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | /sources?workspaceId= | Список источников |
| GET | /sources/:id | Получить источник |
| POST | /sources | Создать источник |
| PUT | /sources/:id | Обновить источник |
| DELETE | /sources/:id | Удалить источник |
| POST | /sources/:id/ingest | Запустить импорт |
| GET | /sources/:id/status | Статус импорта |

#### 3. Тесты

**Нормализация (14 тестов):**
- ✅ Успешная нормализация
- ✅ Валидация обязательных полей
- ✅ Парсинг remote/hybrid локаций
- ✅ Извлечение seniority level
- ✅ Парсинг зарплаты (разные форматы)
- ✅ Извлечение навыков
- ✅ Очистка URL
- ✅ Предупреждения

**Дедупликация (8 тестов):**
- ✅ Consistent fingerprints
- ✅ Разные fingerprints для разных данных
- ✅ Нормализация заголовков и компаний
- ✅ Обнаружение дубликатов по URL
- ✅ SimHash алгоритм
- ✅ Расстояние Хэмминга

### Структура данных

#### RawJob (сырая вакансия)
```prisma
model RawJob {
  id                String
  sourceId          String
  sourceJobId       String
  rawPayload        Json
  extractedTitle    String
  extractedCompany  String
  extractedLocation String?
  extractedDescription String?
  extractedUrl      String
  extractedPostedAt DateTime?
  extractedSalary   String?
  extractedJobType  String?
  processingStatus  RawJobProcessingStatus
  normalizedJobId   String?
}
```

#### Job (нормализованная вакансия)
```prisma
model Job {
  id              String
  workspaceId     String
  sourceId        String
  title           String
  company         String
  canonicalUrl    String
  sourceUrl       String
  description     String
  location        String
  locationType    WorkMode
  isRemote        Boolean
  salaryMin       Int?
  salaryMax       Int?
  jobType         JobType
  seniorityLevel  SeniorityLevel?
  requiredSkills  String[]
  preferredSkills String[]
  postedAt        DateTime
  status          JobStatus
  fingerprintId   String?
}
```

#### JobFingerprint
```prisma
model JobFingerprint {
  id                String
  workspaceId       String
  canonicalUrlHash  String
  sourceJobIdHash   String
  normalizedTitleHash String
  normalizedCompanyHash String
  descriptionHash   String
  locationHash      String
  postedDateBucket  String
  fingerprint       String @unique
  jobIds            String[]
}
```

### Зависимости

Добавлено в `apps/api/package.json`:
- `@nestjs/bull` - BullMQ интеграция
- `bullmq` - очередь задач

### Конфигурация

В `.env.local` добавлено:
```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Queue
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### Как использовать

#### 1. Создать источник вакансий

```bash
POST /sources
Content-Type: application/json

{
  "workspaceId": "ws-123",
  "name": "LinkedIn Tech Jobs",
  "type": "linkedin",
  "config": {
    "apiKey": "...",
    "searchUrl": "https://linkedin.com/jobs/search?keywords=software+engineer"
  }
}
```

#### 2. Запустить импорт

```bash
POST /sources/:id/ingest?limit=100&dryRun=false

Response:
{
  "success": true,
  "jobId": "queue-job-123",
  "message": "Ingestion job queued"
}
```

#### 3. Проверить статус

```bash
GET /sources/:id/status

Response:
{
  "lastCollectionAt": "2024-01-15T10:30:00Z",
  "lastCollectionStatus": "success",
  "totalJobsCollected": 150,
  "activeJobsCount": 120
}
```

### Архитектурные решения

1. **Адаптеры через интерфейсы** - лёгкое добавление новых источников
2. **Разделение нормализации и дедупликации** - каждый сервис отвечает за своё
3. **Fingerprinting для дедупликации** - надёжнее простого сравнения URL
4. **SimHash для текстов** - определяет похожие описания
5. **Очередь для асинхронности** - не блокируем API при импорте
6. **Параллелизм** - быстрая обработка больших объёмов

### Что осталось для продакшена

#### Требуется реализовать:

1. **Конкретные адаптеры:**
   - LinkedIn API adapter (требует API access)
   - Indeed API adapter
   - Playwright scraper для company websites

2. **Миграции БД:**
   - Создать миграцию для RawJob, JobFingerprint
   - Индексы для производительности

3. **Обработка ошибок:**
   - Circuit breaker для внешних API
   - Dead letter queue для неудачных задач
   - Уведомления при критических ошибках

4. **Мониторинг:**
   - Метрики для Grafana/Prometheus
   - Логирование для каждого этапа
   - Трассировка (OpenTelemetry)

### Связь с другими фазами

**Связь с Фазой 1:**
- Использует Prisma модели из схемы
- Интеграция с Workspace через workspaceId
- JobSource модель уже существует

**Связь с Фазой 3 (Matching):**
- Нормализованные Job передаются в matching engine
- Fingerprint предотвращает дубли в скоринге
- Skills из нормализации используются для match score

**Связь с Фазой 6 (Observability):**
- Метрики импорта для analytics
- Логи для аудита
- Трассировка pipeline

---

## 📊 Статистика Фазы 2

- **Новых файлов:** 15+
- **Строк кода:** ~2500+
- **Тестов:** 22
- **API эндпоинтов:** 7
- **Сервисов:** 4 (SourceAdapter, Normalization, Deduplication, IngestionPipeline)

---

## 🎯 Следующий шаг: Фаза 3

**Matching Engine - скоринг вакансий**

Хотите продолжить с Фазой 3? Она включает:
- Гибридный матчинг (детерминированный + LLM)
- Расчёт skill gaps
- Hard fail detection
- Рекомендации по отклику
