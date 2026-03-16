import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { ResumeParserService } from "@ai-job-search/workers";
import { OpenAIClient } from "@ai-job-search/workers"; // Using workers export
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ResumesService {
  private resumeParser: ResumeParserService;
  private llmClient: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    this.resumeParser = new ResumeParserService();
    // Initialize LLM for extraction
    this.llmClient = new OpenAIClient(
      this.config.get<string>("OPENAI_API_KEY")!,
      this.config.get<string>("OPENAI_MODEL", "gpt-4o")
    );
  }

  async findByProfile(profileId: string) {
    return this.prisma.resumeAsset.findMany({
      where: { candidateProfileId: profileId },
    });
  }

  /**
   * Загрузить файл, распарсить его и обновить профиль
   */
  async uploadAndParse(userId: string, workspaceId: string, profileId: string, file: Express.Multer.File) {
    // 1. Parse text from file
    const text = await this.resumeParser.parseToText(file.buffer, file.mimetype);

    // 2. Extract structured data using LLM
    const extractedData = await this.resumeParser.extractProfile(text, this.llmClient);

    // 3. Save resume asset to DB
    const asset = await this.prisma.resumeAsset.create({
      data: {
        candidateProfileId: profileId,
        name: file.originalname,
        storageKey: `resumes/${userId}/${Date.now()}-${file.originalname}`,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        isDefault: true,
      },
    });

    // 4. Update candidate profile with extracted data (if missing)
    if (extractedData) {
      await this.prisma.candidateProfile.update({
        where: {
          id: profileId,
          workspaceId: workspaceId!,
        },
        data: {
          firstName: extractedData.firstName,
          lastName: extractedData.lastName,
          headline: extractedData.headline,
          location: extractedData.location,
          currentTitle: extractedData.currentTitle,
          currentCompany: extractedData.currentCompany,
          yearsOfExperience: extractedData.yearsOfExperience,
          skills: {
            set: extractedData.skills || [],
          },
        },
      });
    }

    return {
      asset,
      extractedData,
    };
  }
}
