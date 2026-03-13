import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MatchingService } from "./matching.service";

class ScoreJobDto {
  candidateProfileId!: string;
}

@ApiTags("matching")
@Controller("matching")
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post("jobs/:jobId/score")
  @ApiOperation({ summary: "Score a job against candidate profile" })
  @ApiResponse({ status: 201 })
  async scoreJob(
    @Param("jobId") jobId: string,
    @Body() dto: ScoreJobDto
  ) {
    return this.matchingService.scoreJob(jobId, dto.candidateProfileId);
  }

  @Get("candidates/:candidateProfileId/scores")
  @ApiOperation({ summary: "Get all scores for a candidate" })
  @ApiResponse({ status: 200 })
  async getCandidateScores(
    @Param("candidateProfileId") candidateProfileId: string,
    @Query("workspaceId") workspaceId: string,
    @Query("limit") limit?: string
  ) {
    return this.matchingService.getCandidateScores(
      candidateProfileId,
      workspaceId,
      limit ? parseInt(limit) : undefined
    );
  }

  @Get("candidates/:candidateProfileId/best-matches")
  @ApiOperation({ summary: "Get best matches for a candidate" })
  @ApiResponse({ status: 200 })
  async getBestMatches(
    @Param("candidateProfileId") candidateProfileId: string,
    @Query("workspaceId") workspaceId: string,
    @Query("minScore") minScore?: string
  ) {
    return this.matchingService.getBestMatches(
      candidateProfileId,
      workspaceId,
      minScore ? parseInt(minScore) : undefined
    );
  }

  @Post("candidates/:candidateProfileId/batch-score")
  @ApiOperation({ summary: "Batch score all jobs for a candidate" })
  @ApiResponse({ status: 201 })
  async batchScore(
    @Param("candidateProfileId") candidateProfileId: string,
    @Body() dto: { candidateProfileId?: string },
    @Query("workspaceId") workspaceId: string
  ) {
    return this.matchingService.batchScoreForCandidate(
      dto.candidateProfileId || candidateProfileId,
      workspaceId
    );
  }

  @Post("scores/:matchScoreId/recommendation")
  @ApiOperation({ summary: "Update recommendation for a match score" })
  @ApiResponse({ status: 200 })
  async updateRecommendation(
    @Param("matchScoreId") matchScoreId: string,
    @Body() dto: { recommendation: string; applyMode?: string }
  ) {
    return this.matchingService.updateRecommendation(
      matchScoreId,
      dto.recommendation,
      dto.applyMode
    );
  }
}
