# AI Job Search OS - Сводка по Фазе 3

## ✅ Завершено: Matching Engine & Application Drafts

### Что было реализовано

#### 1. Детерминированный скоринг (`deterministic-scoring.service.ts`)

**6 компонент скоринга:**

| Компонент | Вес | Алгоритм |
|-----------|-----|----------|
| Title Score | 20% | Text similarity + normalization |
| Skill Score | 30% | Required/preferred overlap |
| Seniority Score | 15% | Years → level mapping |
| Work Mode Score | 10% | Remote/hybrid/onsite match |
| Location Score | 10% | City/country preference |
| Salary Score | 10% | Min/max expectations |

**Функции:**
- Нормализация заголовков (удаление seniority префиксов)
- Извлечение навыков из описания
- Определение seniority по годам опыта
- Парсинг локации (remote/hybrid/onsite)
- Skill gap identification

#### 2. LLM-Assisted скоринг (`llm-scoring.service.ts`)

**Возможности:**
- **Reasoning summary** - объяснение решения
- **Hard fail detection** - 9 типов критических несоответствий
- **Risk flags** - 9 типов рисков
- **Recommendation** - 5 уровней рекомендации
- **Apply mode** - manual/assisted/auto

**Hard Fail Reasons:**
- `seniority_mismatch`
- `skill_gap_critical`
- `location_dealbreaker`
- `salary_below_minimum`
- `work_mode_incompatible`
- `excluded_company`
- `excluded_keyword`
- `visa_sponsorship_required`
- `relocation_required`

**Risk Flag Types:**
- `job_posting_age` (>30/60/90 дней)
- `salary_transparency` (нет зарплаты)
- `vague_description` (<200 символов)
- `too_many_requirements` (>15 пунктов)
- `ghost_job` (признаки неактивной)

#### 3. Matching Service (`matching.service.ts`)

**Объединение результатов:**
```typescript
totalScore = deterministic * 0.7 + llm * 0.3 + adjustment
confidence = avg(det_conf, llm_conf) ± skillGaps
```

**Результат:**
- Total score (0-100)
- Confidence (0-1)
- Hard fail reasons
- Skill gaps
- Risk flags
- Recommendation
- Recommended apply mode

#### 4. Draft Generation Service (`draft-generation.service.ts`)

**Компоненты:**
- **Resume selection** - isDefault → targeted → first
- **Portfolio selection** - primary + relevant by job type
- **Cover letter** - LLM или template
- **Intro message** - LLM или template
- **Custom answers** - эвристические ответы на типовые вопросы
- **Factual checks** - проверка на выдуманную информацию
- **Validation** - длина, factual accuracy

**Factual Checks:**
- Company claims verification
- Education claims verification
- Exaggeration detection ("world's best", "unparalleled")

#### 5. Интеграция с API

**Новые/обновлённые модули:**
- `apps/api/src/matching/` - MatchingController + MatchingService
- `apps/api/src/applications/` - ApplicationsController + Services
- `apps/api/src/applications/draft-generation.service.ts`

**Mock LLM Client** для тестирования без реального API

### API Endpoints

#### Matching (5 endpoints)

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/matching/jobs/:jobId/score` | Скорить вакансию |
| GET | `/matching/candidates/:id/scores` | Все скоринги |
| GET | `/matching/candidates/:id/best-matches` | Лучшие матчи (score ≥ 70) |
| POST | `/matching/candidates/:id/batch-score` | Batch скоринг всех вакансий |
| POST | `/matching/scores/:id/recommendation` | Обновить рекомендацию |

#### Applications (9 endpoints)

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/applications` | Список откликов |
| GET | `/applications/:id` | Детали |
| POST | `/applications` | Создать из черновика |
| POST | `/applications/:id/approve` | Одобрить |
| POST | `/applications/:id/reject` | Отклонить |
| PUT | `/applications/:id/status` | Обновить статус |
| POST | `/applications/drafts/generate` | Генерация черновика |
| PUT | `/applications/drafts/:id` | Обновить черновик |
| DELETE | `/applications/drafts/:id` | Удалить черновик |

### Тесты

**Всего тестов:** 32+

#### DeterministicScoringService (18 тестов)
- ✅ Total score calculation
- ✅ Title scoring (exact, similar, case insensitive)
- ✅ Skill scoring (overlap, gaps)
- ✅ Seniority scoring (matching levels)
- ✅ Work mode scoring
- ✅ Location scoring
- ✅ Salary scoring
- ✅ Custom weights
- ✅ Edge cases (missing data)

#### LLMScoringService (14 тестов)
- ✅ LLM analysis
- ✅ Hard fail detection (companies, keywords)
- ✅ Risk flag detection (age, salary, vague, too many)
- ✅ Apply mode recommendation
- ✅ Default analysis (no LLM)
- ✅ Recommendation parsing

### Структура данных

#### MatchScore (БД)
```prisma
{
  id: string
  jobId: string
  candidateProfileId: string
  totalScore: int (0-100)
  confidence: float (0-1)
  titleScore: int
  skillScore: int
  seniorityScore: int
  workModeScore: int
  locationScore: int
  salaryScore: int
  llmReasoning: string?
  llmRecommendation: enum?
  hasHardFail: boolean
  hardFailReasons: string[]
  skillGaps: json
  riskFlags: json
  recommendation: enum
  recommendedApplyMode: string?
}
```

#### ApplicationDraft (БД)
```prisma
{
  id: string
  jobId: string
  candidateProfileId: string
  coverLetter: string
  introMessage: string
  customAnswers: json
  resumeAssetId: string
  portfolioLinkIds: string[]
  validationStatus: enum
  validationErrors: string[]
  factualChecks: json
  approvalStatus: enum
}
```

### Статистика Фазы 3

| Метрика | Значение |
|---------|----------|
| Новых файлов | 10+ |
| Строк кода | ~3000+ |
| Тестов | 32 |
| API endpoints | 14 |
| Сервисов | 4 |

### Примеры использования

#### 1. Score job

```typescript
const result = await matchingService.scoreJob(
  "job-123",
  "candidate-456"
);

console.log(result.matchScore.totalScore); // 85
console.log(result.matchScore.recommendation); // "highly_recommended"
console.log(result.matchScore.recommendedApplyMode); // "assisted"
```

#### 2. Generate draft

```typescript
const draft = await draftService.generateDraft(
  "job-123",
  "candidate-456"
);

console.log(draft.result.coverLetter);
console.log(draft.result.introMessage);
console.log(draft.result.selectedResume);
```

#### 3. Batch score

```typescript
const stats = await matchingService.batchScoreForCandidate(
  "candidate-456",
  "workspace-1"
);

console.log(`Scored ${stats.scored}/${stats.total} jobs`);
```

### Архитектурные решения

1. **Гибридный скоринг** - детерминированный (70%) + LLM (30%)
2. **Конфигурируемые веса** - можно настроить под кандидата
3. **Fallback без LLM** - работает без подключения AI
4. **Factual checks** - предотвращение выдуманной информации
5. **4 режима отклика** - manual/assisted/auto_safe/auto_full

### Интеграция с другими фазами

**С Фазой 1:**
- Использует CandidateProfile, JobPreference
- Интеграция с ResumeAsset, PortfolioLink

**С Фазой 2:**
- Скорит нормализованные Job
- Использует skills из normalization

**С Фазой 4:**
- Передаёт drafts в approval workflow
- recommendedApplyMode определяет режим approval

### Что осталось для продакшена

#### Требуется реализовать:

1. **Real LLM Client:**
   - Anthropic/Claude integration
   - OpenAI/GPT integration
   - Rate limiting
   - Token usage tracking

2. **Prompt Optimization:**
   - A/B testing
   - Few-shot examples
   - Output schema validation

3. **Performance:**
   - Batch LLM requests
   - Result caching
   - Parallel scoring

4. **Monitoring:**
   - Score distribution metrics
   - LLM confidence tracking
   - Draft validation error rates

---

## 📊 Общий прогресс

| Фаза | Статус | completion |
|------|--------|------------|
| Фаза 1: Фундамент | ✅ | 100% |
| Фаза 2: Импорт | ✅ | 100% |
| **Фаза 3: Matching** | **✅** | **100%** |
| Фаза 4: Approval | 🔜 | 0% |
| Фаза 5: Gmail | 🔜 | 0% |
| Фаза 6: Sync | 🔜 | 0% |

**Общий прогресс:** 50% (3 из 6 фаз)

---

## 🎯 Следующий шаг: Фаза 4

**Approval Workflow & Application Automation**

Хотите продолжить с Фазой 4? Она включает:
- 4 режима approval (manual/assisted/auto_safe/auto_full)
- Approval requests и история
- Application submission automation
- Playwright browser automation
- Apply attempt tracking и retry logic
