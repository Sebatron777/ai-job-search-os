import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ProfilesService, CreateProfileDto, CreateJobPreferenceDto } from "./profiles.service";

@ApiTags("profiles")
@Controller("profiles")
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user's candidate profile" })
  @ApiResponse({ status: 200 })
  async getMyProfile(@Request() req: any, @Query("workspaceId") workspaceId: string) {
    return this.profilesService.findByUserAndWorkspace(
      req.user?.id || "user-id",
      workspaceId
    );
  }

  @Post()
  @ApiOperation({ summary: "Create candidate profile" })
  @ApiResponse({ status: 201 })
  async createProfile(
    @Request() req: any,
    @Query("workspaceId") workspaceId: string,
    @Body() dto: CreateProfileDto
  ) {
    return this.profilesService.create(req.user?.id || "user-id", workspaceId, dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update candidate profile" })
  @ApiResponse({ status: 200 })
  async updateProfile(@Param("id") id: string, @Body() dto: Partial<CreateProfileDto>) {
    return this.profilesService.update(id, dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get profile by ID" })
  @ApiResponse({ status: 200 })
  async getProfile(@Param("id") id: string) {
    return this.profilesService.findById(id);
  }

  @Post(":id/preferences")
  @ApiOperation({ summary: "Create/update job preferences" })
  @ApiResponse({ status: 201 })
  async upsertPreferences(
    @Param("id") id: string,
    @Body() dto: CreateJobPreferenceDto
  ) {
    return this.profilesService.upsertJobPreference(id, dto);
  }
}
