import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WorkspacesService, CreateWorkspaceDto } from "./workspaces.service";

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: "List user's workspaces" })
  @ApiResponse({ status: 200 })
  async listWorkspaces(@Request() req: any) {
    return this.workspacesService.getMemberships(req.user?.id || "user-id");
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get workspace by slug" })
  @ApiResponse({ status: 200 })
  async getWorkspace(@Param("slug") slug: string) {
    return this.workspacesService.findBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: "Create a new workspace" })
  @ApiResponse({ status: 201 })
  async createWorkspace(@Request() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user?.id || "user-id", dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update workspace" })
  @ApiResponse({ status: 200 })
  async updateWorkspace(
    @Param("id") id: string,
    @Body() dto: { name?: string; settings?: Record<string, unknown> }
  ) {
    return this.workspacesService.update(id, dto);
  }
}
