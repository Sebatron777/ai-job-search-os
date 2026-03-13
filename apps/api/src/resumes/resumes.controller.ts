import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResumesService } from "./resumes.service";

@ApiTags("resumes")
@Controller("resumes")
export class ResumesController {
  constructor(private resumesService: ResumesService) {}

  @Get()
  async list(@Query("profileId") profileId: string) {
    return this.resumesService.findByProfile(profileId);
  }
}
