import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ApplicationsService, CreateApplicationDto } from "./applications.service";
import { DraftGenerationService, GenerateDraftDto } from "./draft-generation.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("applications")
@Controller("applications")
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(
    private applicationsService: ApplicationsService,
    private draftGenerationService: DraftGenerationService
  ) {}

  @Get()
  @ApiOperation({ summary: "List applications" })
  @ApiResponse({ status: 200 })
  async list(
    @Query("workspaceId") workspaceId: string,
    @Query("status") status?: string
  ) {
    return this.applicationsService.findAll(workspaceId, { status });
  }

  @Get("drafts/:id")
  @ApiOperation({ summary: "Get application draft by ID" })
  @ApiResponse({ status: 200 })
  async getDraft(@Param("id") id: string) {
    return this.draftGenerationService.getDraft(id);
  }

  @Post("drafts/generate")
  @ApiOperation({ summary: "Generate tailored application draft using Claude" })
  @ApiResponse({ status: 201 })
  async generateDraft(@Body() dto: GenerateDraftDto) {
    return this.draftGenerationService.generateDraft(
      dto.jobId,
      dto.candidateProfileId,
      dto.tone
    );
  }

  @Put("drafts/:id")
  @ApiOperation({ summary: "Update application draft" })
  @ApiResponse({ status: 200 })
  async updateDraft(
    @Param("id") id: string,
    @Body()
    dto: {
      coverLetter?: string;
      introMessage?: string;
      customAnswers?: Record<string, string>;
      resumeAssetId?: string;
    }
  ) {
    return this.draftGenerationService.updateDraft(id, dto);
  }

  @Delete("drafts/:id")
  @ApiOperation({ summary: "Delete application draft" })
  @ApiResponse({ status: 200 })
  async deleteDraft(@Param("id") id: string) {
    return this.draftGenerationService.deleteDraft(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get application by ID" })
  @ApiResponse({ status: 200 })
  async get(@Param("id") id: string) {
    return this.applicationsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create application" })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(dto);
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Approve application" })
  @ApiResponse({ status: 200 })
  async approve(@Param("id") id: string, @Request() req: any) {
    return this.applicationsService.approve(id, req.user.id);
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Reject application" })
  @ApiResponse({ status: 200 })
  async reject(
    @Param("id") id: string,
    @Body() dto: { reason: string }
  ) {
    return this.applicationsService.reject(id, dto.reason);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update application status" })
  @ApiResponse({ status: 200 })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: { status: string; reason?: string }
  ) {
    return this.applicationsService.updateStatus(id, dto.status, dto.reason);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete application" })
  @ApiResponse({ status: 200 })
  async delete(@Param("id") id: string) {
    await this.applicationsService.delete(id);
    return { success: true };
  }
}

