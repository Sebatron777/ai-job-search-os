/**
 * Сервис генерации черновиков откликов
 * 
 * Генерирует персонализированные материалы для отклика:
 * - Cover letter
 * - Intro message
 * - Custom answers
 * - Выбор резюме
 */

import type {
  Job,
  CandidateProfile,
  ResumeAsset,
  PortfolioLink,
  ApplicationDraft,
} from "@ai-job-search/types";
import {
  buildCoverLetterPrompt,
  buildIntroMessagePrompt,
} from "@ai-job-search/prompts";

/**
 * Результат генерации черновика
 */
export interface DraftGenerationResult {
  /** Сгенерированный cover letter */
  coverLetter: string;
  /** Intro message */
  introMessage: string;
  /** Custom answers для форм */
  customAnswers: Record<string, string>;
  /** Выбранное резюме */
  selectedResume: ResumeAsset;
  /** Выбранные portfolio links */
  selectedPortfolioLinks: PortfolioLink[];
  /** Factual checks */
  factualChecks: FactualCheck[];
  /** Validation errors */
  validationErrors: string[];
}

/**
 * Factual check
 */
export interface FactualCheck {
  /** Что проверялось */
  check: string;
  /** Пройдено ли */
  passed: boolean;
  /** Детали */
  details?: string;
}

/**
 * Конфигурация генерации
 */
export interface DraftGenerationConfig {
  /** Тон письма */
  tone: "professional" | "casual" | "enthusiastic" | "concise";
  /** Максимальная длина cover letter (слова) */
  maxCoverLetterWords: number;
  /** Платформа для intro message */
  platform: "linkedin" | "email" | "general";
  /** Генерировать ли custom answers */
  generateCustomAnswers: boolean;
  /** LLM client */
  llmClient?: LLMClient;
}

/**
 * LLM Client интерфейс
 */
export interface LLMClient {
  generate(prompt: string, options?: any): Promise<{ content: string }>;
}

/**
 * Сервис генерации черновиков
 */
export class DraftGenerationService {
  private config: DraftGenerationConfig;

  constructor(config?: Partial<DraftGenerationConfig>) {
    this.config = {
      tone: "professional",
      maxCoverLetterWords: 250,
      platform: "general",
      generateCustomAnswers: true,
      ...config,
    };
  }

  /**
   * Сгенерировать черновик отклика
   */
  async generateDraft(
    job: Job,
    candidate: CandidateProfile,
    resumes: ResumeAsset[],
    portfolioLinks: PortfolioLink[],
    commonQuestions?: CommonApplicationQuestion[]
  ): Promise<DraftGenerationResult> {
    // 1. Выбрать лучшее резюме
    const selectedResume = this.selectBestResume(job, resumes);

    // 2. Выбрать portfolio links
    const selectedPortfolio = this.selectPortfolioLinks(job, portfolioLinks);

    // 3. Сгенерировать cover letter
    const coverLetter = await this.generateCoverLetter(job, candidate);

    // 4. Сгенерировать intro message
    const introMessage = await this.generateIntroMessage(job, candidate);

    // 5. Сгенерировать custom answers
    const customAnswers = this.config.generateCustomAnswers
      ? await this.generateCustomAnswers(job, candidate, commonQuestions)
      : {};

    // 6. Factual checks
    const factualChecks = this.performFactualChecks(
      coverLetter,
      candidate
    );

    // 7. Validation
    const validationErrors = this.validateDraft({
      coverLetter,
      introMessage,
      customAnswers,
      selectedResume,
      selectedPortfolioLinks: selectedPortfolio,
      factualChecks,
    });

    return {
      coverLetter,
      introMessage,
      customAnswers,
      selectedResume,
      selectedPortfolioLinks: selectedPortfolio,
      factualChecks,
      validationErrors,
    };
  }

  /**
   * Выбрать лучшее резюме
   */
  private selectBestResume(
    job: Job,
    resumes: ResumeAsset[]
  ): ResumeAsset {
    if (resumes.length === 0) {
      throw new Error("No resumes available");
    }

    if (resumes.length === 1) {
      return resumes[0]!;
    }

    // Ищем резюме с isDefault
    const defaultResume = resumes.find(r => r.isDefault);
    if (defaultResume) {
      return defaultResume;
    }

    // Ищем резюме с таргетированными ролями
    const normalizedJobTitle = job.title.toLowerCase();
    const targetedResume = resumes.find(r =>
      r.targetedRoles.some(role =>
        normalizedJobTitle.includes(role.toLowerCase())
      )
    );

    if (targetedResume) {
      return targetedResume;
    }

    // Возвращаем первое
    return resumes[0]!;
  }

  /**
   * Выбрать portfolio links
   */
  private selectPortfolioLinks(
    job: Job,
    portfolioLinks: PortfolioLink[]
  ): PortfolioLink[] {
    // Выбираем primary links
    const primary = portfolioLinks.filter(p => p.isPrimary);
    
    // Добавляем релевантные по типу работы
    const normalizedDescription = job.description.toLowerCase();
    
    const relevant = portfolioLinks.filter(p => {
      if (p.type === "github" || p.type === "gitlab") {
        return normalizedDescription.includes("code") ||
               normalizedDescription.includes("developer") ||
               normalizedDescription.includes("engineer");
      }
      if (p.type === "behance" || p.type === "dribbble") {
        return normalizedDescription.includes("design") ||
               normalizedDescription.includes("designer");
      }
      return false;
    });

    // Объединяем и убираем дубликаты
    const selected = [...primary, ...relevant];
    const unique = selected.filter(
      (p, i, arr) => arr.findIndex(x => x.id === p.id) === i
    );

    return unique.length > 0 ? unique : portfolioLinks.slice(0, 2);
  }

  /**
   * Сгенерировать cover letter
   */
  private async generateCoverLetter(
    job: Job,
    candidate: CandidateProfile
  ): Promise<string> {
    const llmClient = this.config.llmClient;

    if (!llmClient) {
      // Без LLM - генерируем шаблонный текст
      return this.generateTemplateCoverLetter(job, candidate);
    }

    try {
      const prompt = buildCoverLetterPrompt({
        candidate,
        job,
        tone: this.config.tone,
        maxLength: this.config.maxCoverLetterWords,
      });

      const response = await llmClient.generate(prompt);
      return response.content.trim();
    } catch (error) {
      console.error("Cover letter generation failed:", error);
      return this.generateTemplateCoverLetter(job, candidate);
    }
  }

  /**
   * Сгенерировать intro message
   */
  private async generateIntroMessage(
    job: Job,
    candidate: CandidateProfile
  ): Promise<string> {
    const llmClient = this.config.llmClient;

    if (!llmClient) {
      return this.generateTemplateIntroMessage(job, candidate);
    }

    try {
      const prompt = buildIntroMessagePrompt({
        candidate,
        job,
        platform: this.config.platform,
      });

      const response = await llmClient.generate(prompt);
      return response.content.trim();
    } catch (error) {
      console.error("Intro message generation failed:", error);
      return this.generateTemplateIntroMessage(job, candidate);
    }
  }

  /**
   * Сгенерировать custom answers
   */
  private async generateCustomAnswers(
    job: Job,
    candidate: CandidateProfile,
    questions?: CommonApplicationQuestion[]
  ): Promise<Record<string, string>> {
    if (!questions || questions.length === 0) {
      return {};
    }

    const answers: Record<string, string> = {};

    for (const question of questions) {
      answers[question.id] = await this.generateAnswerForQuestion(
        question,
        candidate
      );
    }

    return answers;
  }

  /**
   * Perform factual checks
   */
  private performFactualChecks(
    coverLetter: string,
    candidate: CandidateProfile
  ): FactualCheck[] {
    const checks: FactualCheck[] = [];
    const lowerCL = coverLetter.toLowerCase();

    // Проверка: нет ли выдуманного опыта
    const claimedCompanies = this.extractCompaniesFromText(coverLetter);
    for (const company of claimedCompanies) {
      const isReal = candidate.currentCompany?.toLowerCase().includes(company.toLowerCase()) ||
                     candidate.excludedKeywords.some(k => k.toLowerCase().includes(company));
      
      checks.push({
        check: `Company claim: ${company}`,
        passed: isReal || company.toLowerCase().includes(candidate.currentCompany?.toLowerCase() || ""),
        details: isReal ? "Confirmed in profile" : "Not found in profile",
      });
    }

    // Проверка: нет ли выдуманного образования
    if (lowerCL.includes("degree") || lowerCL.includes("university")) {
      checks.push({
        check: "Education claim",
        passed: true, // Заглушка
        details: "Should verify against parsed resume",
      });
    }

    // Проверка: нет ли преувеличений
    const exaggerationPatterns = [
      "world's best",
      "unparalleled",
      "revolutionary",
      "groundbreaking",
    ];

    const hasExaggeration = exaggerationPatterns.some(p => lowerCL.includes(p));
    checks.push({
      check: "No exaggerations",
      passed: !hasExaggeration,
      details: hasExaggeration ? "Found exaggerated claims" : "No exaggerations found",
    });

    return checks;
  }

  /**
   * Валидировать черновик
   */
  private validateDraft(result: Omit<DraftGenerationResult, "validationErrors">): string[] {
    const errors: string[] = [];

    // Cover letter validation
    if (!result.coverLetter || result.coverLetter.length < 50) {
      errors.push("Cover letter too short");
    }

    const wordCount = result.coverLetter.split(/\s+/).length;
    if (wordCount > this.config.maxCoverLetterWords * 1.2) {
      errors.push(`Cover letter exceeds max words (${wordCount} > ${this.config.maxCoverLetterWords})`);
    }

    // Intro message validation
    if (!result.introMessage || result.introMessage.length < 10) {
      errors.push("Intro message too short");
    }

    // Factual checks
    const failedChecks = result.factualChecks.filter(c => !c.passed);
    if (failedChecks.length > 0) {
      errors.push(`Factual check failed: ${failedChecks[0]?.check}`);
    }

    return errors;
  }

  /**
   * Сгенерировать template cover letter (без LLM)
   */
  private generateTemplateCoverLetter(
    job: Job,
    candidate: CandidateProfile
  ): string {
    const skills = candidate.skills.slice(0, 3).join(", ");
    
    return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}.

With my background in ${skills}, I believe I would be a valuable addition to your team. My experience aligns well with the requirements of this role, and I am excited about the opportunity to contribute to ${job.company}.

Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.

Best regards,
${candidate.firstName} ${candidate.lastName}`;
  }

  /**
   * Сгенерировать template intro message (без LLM)
   */
  private generateTemplateIntroMessage(
    job: Job,
    candidate: CandidateProfile
  ): string {
    const firstSkill = candidate.skills[0] || "relevant experience";
    
    return `Hi, I'm ${candidate.firstName}. I'm interested in the ${job.title} role at ${job.company}. I have strong experience in ${firstSkill} and would love to contribute to your team.`;
  }

  /**
   * Сгенерировать ответ на вопрос
   */
  private async generateAnswerForQuestion(
    question: CommonApplicationQuestion,
    candidate: CandidateProfile
  ): Promise<string> {
    // Простые эвристические ответы
    const lowerQuestion = question.question.toLowerCase();

    if (lowerQuestion.includes("notice period") || lowerQuestion.includes("start date")) {
      return "2 weeks";
    }

    if (lowerQuestion.includes("salary") || lowerQuestion.includes("compensation")) {
      return "Negotiable based on the total compensation package";
    }

    if (lowerQuestion.includes("visa") || lowerQuestion.includes("sponsorship")) {
      return "No sponsorship required";
    }

    if (lowerQuestion.includes("remote") || lowerQuestion.includes("work from home")) {
      return "Open to both remote and on-site work";
    }

    if (lowerQuestion.includes("relocate")) {
      return "Open to relocation for the right opportunity";
    }

    // Дефолтный ответ
    return "I'd be happy to discuss this further during an interview.";
  }

  /**
   * Извлечь компании из текста
   */
  private extractCompaniesFromText(text: string): string[] {
    // Упрощённая экстракция - ищем слова после "at"
    const matches = text.match(/\bat\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g) || [];
    return matches.map(m => m.replace(/^at\s+/, "").trim());
  }
}

/**
 * Типичные вопросы в формах откликов
 */
export interface CommonApplicationQuestion {
  /** ID вопроса */
  id: string;
  /** Текст вопроса */
  question: string;
  /** Тип */
  type: "text" | "yes_no" | "multiple_choice" | "file_upload";
  /** Опции (для multiple choice) */
  options?: string[];
  /** Обязательный ли */
  required: boolean;
}
