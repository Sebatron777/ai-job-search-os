import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WorkspacesService, CreateWorkspaceDto } from "./workspaces.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("workspaces")
@Controller("workspaces")
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: "List user's workspaces" })
  @ApiResponse({ status: 200 })
  async listWorkspaces(@Request() req: any) {
    return this.workspacesService.getMemberships(req.user.id);
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
    return this.workspacesService.create(req.user.id, dto);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update workspace" })
  @ApiResponse({ status: 200 })
  async updateWorkspace(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: { name?: string; settings?: Record<string, unknown> }
  ) {
    return this.workspacesService.update(id, req.user.id, dto);
  }
}
