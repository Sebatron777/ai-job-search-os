import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import {
  DraftGenerationService as DraftWorkerService,
  createLLMClient,
  type LLMProvider,
  type LLMClient,
} from "@ai-job-search/workers";

export interface GenerateDraftDto {
  jobId: string;
  candidateProfileId: string;
  tone?: "professional" | "casual" | "enthusiastic" | "concise";
}

@Injectable()
export class DraftGenerationService {
  private workerService: DraftWorkerService;
  private llmClient: LLMClient;
  private modelName: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    const apiKey = this.configService.get<string>("LLM_API_KEY");
    this.modelName = this.configService.get<string>(
      "LLM_MODEL",
      "claude-3-5-sonnet-20241022"
    );
    const provider = this.configService.get<LLMProvider>(
      "LLM_PROVIDER",
      "anthropic"
    );

    this.llmClient = createLLMClient({
      provider,
      apiKey,
      model: this.modelName,
    });

    this.workerService = new DraftWorkerService({
      llmClient: this.llmClient,
      tone: "professional",
      maxCoverLetterWords: 250,
    });
  }

  /**
   * Сгенерировать черновик отклика
   */
  async generateDraft(
    jobId: string,
    candidateProfileId: string,
    tone: "professional" | "casual" | "enthusiastic" | "concise" = "professional"
  ) {
    const [job, candidate, resumes] = await Promise.all([
      this.prisma.job.findUnique({
        where: { id: jobId },
      }),
      this.prisma.candidateProfile.findUnique({
        where: { id: candidateProfileId },
      }),
      this.prisma.resumeAsset.findMany({
        where: { candidateProfileId },
      }),
    ]);

    if (!job) {
      throw new NotFoundException("Job not found");
    }
    if (!candidate) {
      throw new NotFoundException("Candidate not found");
    }
    if (!resumes || resumes.length === 0) {
      throw new BadRequestException(
        "Candidate has no resumes uploaded. Please upload a resume before generating a draft."
      );
    }

    // Configure worker tone for this generation
    const worker = new DraftWorkerService({
      llmClient: this.llmClient,
      tone,
      maxCoverLetterWords: 250,
    });

    // Генерируем черновик
    const result = await worker.generateDraft(
      job as any,
      candidate as any,
      resumes as any,
      []
    );

    // Сохраняем черновик в БД
    const draft = await this.prisma.applicationDraft.create({
      data: {
        workspaceId: job.workspaceId,
        jobId,
        candidateProfileId,
        coverLetter: result.coverLetter,
        introMessage: result.introMessage,
        customAnswers: result.customAnswers,
        resumeAssetId: result.selectedResume.id,
        portfolioLinkIds: (result.selectedPortfolioLinks || []).map(
          (p) => p.id
        ),
        generationModel: this.modelName,
        generationVersion: "1.0",
        validationStatus:
          result.validationErrors.length === 0 ? "validated" : "failed",
        validationErrors: result.validationErrors,
        factualChecks: result.factualChecks as any,
        approvalStatus: "pending",
      },
    });

    return {
      draft,
      result,
    };
  }

  /**
   * Получить черновик по ID
   */
  async getDraft(draftId: string) {
    const draft = await this.prisma.applicationDraft.findUnique({
      where: { id: draftId },
      include: {
        job: true,
        candidateProfile: true,
      },
    });

    if (!draft) {
      throw new NotFoundException("Draft not found");
    }

    return draft;
  }

  /**
   * Обновить черновик
   */
  async updateDraft(
    draftId: string,
    updates: {
      coverLetter?: string;
      introMessage?: string;
      customAnswers?: Record<string, string>;
      resumeAssetId?: string;
    }
  ) {
    const existing = await this.prisma.applicationDraft.findUnique({
      where: { id: draftId },
    });
    if (!existing) {
      throw new NotFoundException("Draft not found");
    }

    return this.prisma.applicationDraft.update({
      where: { id: draftId },
      data: updates,
    });
  }

  /**
   * Удалить черновик
   */
  async deleteDraft(draftId: string) {
    const existing = await this.prisma.applicationDraft.findUnique({
      where: { id: draftId },
    });
    if (!existing) {
      throw new NotFoundException("Draft not found");
    }

    await this.prisma.applicationDraft.delete({
      where: { id: draftId },
    });

    return { success: true };
  }
}
