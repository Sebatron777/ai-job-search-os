import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { OrganizationsService } from "./organizations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@ApiTags("organizations")
@Controller("organizations")
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  async create(@CurrentUser() user: any, @Body("name") name: string) {
    return this.organizationsService.create(user.userId, name);
  }

  @Get()
  @ApiOperation({ summary: "Get user's organizations" })
  async findAll(@CurrentUser() user: any) {
    return this.organizationsService.findByUser(user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get organization details" })
  async findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }
}
