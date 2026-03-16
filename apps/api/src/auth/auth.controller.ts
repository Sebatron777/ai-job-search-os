import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { AuthService, RegisterDto, LoginDto } from "./auth.service";

class RegisterRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

class LoginRequest {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

class AuthResponse {
  accessToken!: string;
  refreshToken!: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, type: AuthResponse })
  @ApiResponse({ status: 409, description: "User already exists" })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(dto as RegisterDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, type: AuthResponse })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(dto as LoginDto);
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email successfully verified" })
  @ApiResponse({ status: 400, description: "Invalid or expired token" })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post("resend-verification")
  @ApiOperation({ summary: "Resend verification email" })
  @ApiResponse({ status: 200, description: "Verification email sent" })
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body("email") email: string) {
    return this.authService.resendVerification(email);
  }
}
