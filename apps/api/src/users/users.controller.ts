import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

class UpdateUserDto {
  name?: string;
  avatarUrl?: string;
}

@ApiTags("users")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200 })
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Put("me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200 })
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }
}
