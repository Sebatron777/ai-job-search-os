# Фаза 3: Matching Engine & Application Drafts

## Обзор

Фаза 3 реализует систему скоринга вакансий и генерации черновиков откликов.

## Архитектура

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Job + Candidate    │────▶│  Deterministic   │────▶│  Score Components│
│  Profiles           │     │  Scoring         │     │  - Title (20%)   │
│                     │     │                  │     │  - Skills (30%)  │
│                     │     │                  │     │  - Seniority     │
│                     │     │                  │     │  - etc.          │
└─────────────────────┘     └──────────────────┘     └──────────────────┘
                                    │
                                    ▼
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Recommendation     │◀────│  LLM Analysis    │◀────│  Hard Fails     │
│  & Apply Mode       │     │  - Reasoning     │     │  & Risk Flags   │
│                     │     │  - Confidence    │     │                 │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
```

## Компоненты

### 1. Детерминированный скоринг

**Файл:** `packages/workers/src/deterministic-scoring.service.ts`

**Компоненты скора:**

| Компонент | Вес | Описание |
|-----------|-----|----------|
| Title | 20% | Схожесть заголовка вакансии с текущим заголовком кандидата |
| Skills | 30% | Пересечение required/preferred навыков |
| Seniority | 15% | Соответствие уровня seniority |
| Work Mode | 10% | Совместимость формата работы (remote/hybrid/onsite) |
| Location | 10% | Совместимость локации |
| Salary | 10% | Соответствие зарплатных ожиданий |

**Алгоритмы:**

#### Title Scoring
```typescript
// Нормализация заголовков
"Senior Software Engineer II" → "software engineer"
"Sr. Developer" → "developer"

// Схожесть через пересечение слов + Levenshtein
score = max(overlap, similarity) * 100
```

#### Skill Scoring
```typescript
// Для каждого required skill
if skill in candidateSkills:
  if level >= advanced: score += 100
  else: score += 50
else:
  add to skillGaps (severity: critical)

// Бонус за покрытие всех required
coverageBonus = (matched / required) * 20
```

#### Seniority Scoring
```typescript
levels = [entry, junior, mid, senior, lead, principal, ...]

candidateIndex = indexOf(yearsToSeniority(years))
jobIndex = indexOf(jobSeniority)

diff = jobIndex - candidateIndex

if diff == 0: return 100  // Идеальное попадание
if diff == 1: return 80   // На уровень ниже
if diff == -1: return 85  // На уровень выше
if |diff| >= 3: return 30 // Сильное несоответствие
```

**Пример использования:**

```typescript
const service = new DeterministicScoringService();

const result = service.score(job, candidate, preference);

console.log(result.totalScore); // 0-100
console.log(result.titleScore); // 0-100
console.log(result.skillScore); // 0-100
console.log(result.skillGaps);  // [{skill, severity, ...}]
```

### 2. LLM-Assisted скоринг

**Файл:** `packages/workers/src/llm-scoring.service.ts`

**Функции:**

#### Reasoning Summary
LLM генерирует объяснение почему кандидат подходит/не подходит:
```
"Кандидат хорошо подходит по навыкам (TypeScript, React, Node.js),
но опыт работы (6 лет) немного ниже требуемого для senior позиции.
Рекомендуется откликнуться с персонализированным cover letter."
```

#### Hard Fail Detection
Автоматическое обнаружение критических несоответствий:
- `seniority_mismatch` - Сильное несоответствие по уровню
- `skill_gap_critical` - Критические пробелы в навыках
- `location_dealbreaker` - Локация не подходит
- `salary_below_minimum` - Зарплата ниже минимума
- `excluded_company` - Компания в blacklist
- `excluded_keyword` - Ключевые слова в описании

#### Risk Flags
Обнаружение рисков:
- `job_posting_age` - Вакансия старше 30/60/90 дней
- `salary_transparency` - Зарплата не указана
- `vague_description` - Описание слишком короткое (<200 символов)
- `too_many_requirements` - Нереалистичное количество требований (>15)
- `ghost_job` - Признаки неактивной вакансии

#### Recommendation
Рекомендация по отклику:
- `highly_recommended` - Отличный матч, высокий приоритет
- `recommended` - Хороший матч
- `neutral` - Нейтрально, стоит рассмотреть
- `not_recommended` - Плохой матч
- `avoid` - Не откликаться

#### Apply Mode Recommendation
- `manual` - Только ручное подтверждение (hard fails, high risk)
- `assisted` - AI готовит, человек утверждает (default)
- `auto` - Автоматический отклик (высокий score + confidence)

**Пример:**

```typescript
const llmService = new LLMScoringService(llmClient);

const analysis = await llmService.analyze(job, candidate);

console.log(analysis.reasoning);
console.log(analysis.recommendation);
console.log(analysis.hardFailReasons);
console.log(analysis.riskFlags);
console.log(analysis.confidence); // 0-1
```

### 3. Главный Matching Service

**Файл:** `packages/workers/src/matching.service.ts`

**Объединяет результаты:**

```typescript
totalScore = deterministic.totalScore * 0.7 + 
             llmRecommendationScore * 0.3 +
             llmAdjustment

confidence = average(deterministicConfidence, llmConfidence)
             adjusted for skillGaps
```

**Результат:**

```typescript
interface MatchingResult {
  jobId: string;
  totalScore: number;        // 0-100
  confidence: number;        // 0-1
  deterministicResult: {...};
  llmAnalysis?: {...};
  hardFailReasons: string[];
  skillGaps: SkillGap[];
  riskFlags: RiskFlag[];
  recommendation: string;
  recommendedApplyMode: "manual" | "assisted" | "auto";
}
```

### 4. Генерация черновиков

**Файл:** `packages/workers/src/draft-generation.service.ts`

**Компоненты:**

#### Resume Selection
```typescript
// Логика выбора:
1. Если есть isDefault=true → используем его
2. Ищем резюме с таргетированными ролями
3. Используем первое доступное
```

#### Portfolio Link Selection
```typescript
// Выбираем:
1. Все primary links
2. Релевантные по типу работы:
   - GitHub/GitLab для developer
   - Behance/Dribbble для designer
```

#### Cover Letter Generation
```typescript
// С LLM:
prompt = buildCoverLetterPrompt({candidate, job, tone})
response = llm.generate(prompt)

// Без LLM (template):
"Dear Hiring Manager,
I am writing to express my interest in the ${job.title} position..."
```

#### Intro Message Generation
```typescript
// Короткое сообщение для LinkedIn/email
// 100-300 символов в зависимости от платформы
```

#### Custom Answers
```typescript
// Типичные вопросы:
- "What is your notice period?" → "2 weeks"
- "Do you require visa sponsorship?" → "No"
- "Salary expectations?" → "Negotiable"
- "Remote or on-site?" → "Open to both"
```

#### Factual Checks
```typescript
// Проверки на выдуманную информацию:
- Company claims → verify against profile
- Education claims → verify against parsed resume
- Exaggerations → detect patterns ("world's best", "unparalleled")
```

**Пример:**

```typescript
const draftService = new DraftGenerationService({
  llmClient,
  tone: "professional",
  maxCoverLetterWords: 250,
});

const result = await draftService.generateDraft(
  job,
  candidate,
  resumes,
  portfolioLinks
);

console.log(result.coverLetter);
console.log(result.introMessage);
console.log(result.selectedResume);
console.log(result.validationErrors);
```

## API Endpoints

### Matching

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | /matching/jobs/:jobId/score | Скорить вакансию |
| GET | /matching/candidates/:id/scores | Все скоринги кандидата |
| GET | /matching/candidates/:id/best-matches | Лучшие матчи |
| POST | /matching/candidates/:id/batch-score | Batch скоринг |
| POST | /matching/scores/:id/recommendation | Обновить рекомендацию |

### Applications

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | /applications | Список откликов |
| GET | /applications/:id | Детали отклика |
| POST | /applications | Создать из черновика |
| POST | /applications/:id/approve | Одобрить |
| POST | /applications/:id/reject | Отклонить |
| PUT | /applications/:id/status | Обновить статус |
| POST | /applications/drafts/generate | Генерация черновика |
| PUT | /applications/drafts/:id | Обновить черновик |
| DELETE | /applications/drafts/:id | Удалить черновик |

## Примеры использования

### 1. Скоринг вакансии

```bash
POST /matching/jobs/job-123/score
Content-Type: application/json

{
  "candidateProfileId": "candidate-456"
}

Response:
{
  "matchScore": {
    "id": "score-789",
    "totalScore": 85,
    "confidence": 0.82,
    "recommendation": "highly_recommended",
    "recommendedApplyMode": "assisted"
  },
  "result": {
    "deterministicResult": {
      "titleScore": 90,
      "skillScore": 88,
      "seniorityScore": 80,
      "skillGaps": []
    },
    "llmAnalysis": {
      "reasoning": "Кандидат хорошо подходит...",
      "confidence": 0.85
    }
  }
}
```

### 2. Генерация черновика

```bash
POST /applications/drafts/generate
Content-Type: application/json

{
  "jobId": "job-123",
  "candidateProfileId": "candidate-456"
}

Response:
{
  "draft": {
    "id": "draft-789",
    "coverLetter": "Dear Hiring Manager...",
    "introMessage": "Hi, I'm John...",
    "selectedResume": {...},
    "validationErrors": []
  }
}
```

### 3. Batch скоринг

```bash
POST /matching/candidates/candidate-456/batch-score?workspaceId=ws-1

Response:
{
  "scored": 45,
  "total": 50
}
```

## Тесты

### DeterministicScoringService (18 тестов)

- ✅ Total score calculation
- ✅ Title score (exact match, similar, case insensitive)
- ✅ Skill score (overlap, gaps)
- ✅ Seniority score (matching, mismatch)
- ✅ Work mode score
- ✅ Location score
- ✅ Salary score
- ✅ Custom weights
- ✅ Edge cases (missing data)

### LLMScoringService (14 тестов)

- ✅ Analysis with LLM
- ✅ Hard fail detection (excluded companies/keywords)
- ✅ Risk flag detection (age, salary, vague, too many)
- ✅ Apply mode recommendation
- ✅ Default analysis without LLM
- ✅ Recommendation parsing

## Интеграция с БД

### MatchScore модель

```prisma
model MatchScore {
  id              String   @id @default(uuid())
  jobId           String
  candidateProfileId String
  totalScore      Int
  confidence      Float
  titleScore      Int
  skillScore      Int
  seniorityScore  Int
  workModeScore   Int
  locationScore   Int
  salaryScore     Int
  llmReasoning    String?
  llmRecommendation MatchRecommendation?
  hasHardFail     Boolean
  hardFailReasons String[]
  skillGaps       Json
  riskFlags       Json
  recommendation  MatchRecommendation
  recommendedApplyMode String?
  
  @@unique([jobId, candidateProfileId])
}
```

### ApplicationDraft модель

```prisma
model ApplicationDraft {
  id              String   @id @default(uuid())
  jobId           String
  candidateProfileId String
  coverLetter     String
  introMessage    String
  customAnswers   Json
  resumeAssetId   String
  portfolioLinkIds String[]
  validationStatus String
  validationErrors String[]
  factualChecks   Json
  approvalStatus  String
  
  @@index([jobId])
  @@index([approvalStatus])
}
```

## Конфигурация LLM

### Environment variables

```env
# LLM Provider
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-...
LLM_MODEL=claude-sonnet-4-5-20250929
LLM_TEMPERATURE=0.3
```

### Production LLM Client

```typescript
class AnthropicClient implements LLMClient {
  async generate(prompt: string): Promise<LLMResponse> {
    const response = await anthropic.messages.create({
      model: process.env.LLM_MODEL,
      max_tokens: 1000,
      messages: [{role: "user", content: prompt}],
    });
    
    return {
      content: response.content[0].text,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }
}
```

## Метрики

### Для мониторинга

- **Средний score** - общий quality матчинга
- **Распределение рекомендаций** - highly_recommended vs avoid
- **Hard fail rate** - сколько вакансий отфильтровано
- **Skill gap frequency** - какие навыки чаще всего отсутствуют
- **LLM confidence** - уверенность AI анализа
- **Draft validation errors** - проблемы генерации

## Следующие шаги

### Для завершения Фазы 3:

1. **Интеграция с реальным LLM:**
   - Anthropic/Claude client
   - OpenAI/GPT client
   - Rate limiting & retry logic

2. **Улучшение промтов:**
   - A/B testing промтов
   - Few-shot examples
   - Output validation

3. **Оптимизация производительности:**
   - Batch scoring для больших объёмов
   - Кэширование результатов
   - Parallel LLM requests

### Для перехода к Фазе 4:

После того как черновики сгенерированы, следующий шаг - **Approval Workflow**:
- 4 режима approval (manual/assisted/auto_safe/auto_full)
- Approval requests
- Revision feedback
- Apply automation

---

**Статус Фазы 3:** ✅ Завершена (базовая реализация)
