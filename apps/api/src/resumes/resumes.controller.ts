import { Controller, Get, Post, Query, UploadedFile, UseInterceptors, UseGuards, BadRequestException, Body } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { ResumesService } from "./resumes.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@ApiTags("resumes")
@Controller("resumes")
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  @ApiOperation({ summary: "List resumes for a profile" })
  async list(@Query("profileId") profileId: string) {
    return this.resumesService.findByProfile(profileId);
  }

  @Post("upload")
  @ApiOperation({ summary: "Upload and parse a resume" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        workspaceId: { type: "string" },
        profileId: { type: "string" },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { workspaceId: string; profileId: string },
    @CurrentUser() user: { userId: string }
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return this.resumesService.uploadAndParse(user.userId, body.workspaceId, body.profileId, file);
  }
}
