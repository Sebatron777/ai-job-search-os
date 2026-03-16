import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../database/prisma.service";
import { VerificationService } from "../users/verification.service";
import { BillingService } from "../billing/billing.service";
import { compare, hash } from "bcrypt";

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private verificationService: VerificationService,
    private billingService: BillingService
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<AuthTokens> {
    // Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        emailVerified: false, // Explicitly set
      },
    });

    // Send verification email
    await this.verificationService.sendVerificationEmail(user.id, user.email);

    // Create default Organization
    const organization = await this.prisma.organization.create({
      data: {
        name: `${dto.name || dto.email.split("@")[0]}'s Org`,
        slug: `org-${user.id.slice(0, 8)}`,
        memberships: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create default workspace
    const workspace = await this.prisma.workspace.create({
      data: {
        name: `${dto.name || dto.email.split("@")[0]}'s Workspace`,
        slug: `ws-${user.id.slice(0, 8)}`,
        ownerId: user.id,
        organizationId: organization.id,
        settings: {
          defaultApprovalMode: "manual",
          autoSyncEnabled: false,
          timezone: "UTC",
          currency: "USD",
        },
      },
    });

    // Create workspace membership
    await this.prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "OWNER",
        acceptedAt: new Date(),
      },
    });

    // Assign Free Plan
    await this.billingService.subscribeToDefaultPlan(organization.id);

    // Generate tokens
    return this.generateTokens(user.id);
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException("Please sign in with your provider");
    }

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user.id);
  }

  /**
   * Refresh access token
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (!user.refreshTokenHash) {
      throw new UnauthorizedException("No refresh token");
    }

    const valid = await compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.generateTokens(user.id);
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(userId: string): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: userId }),
      this.jwt.signAsync(
        { sub: userId, type: "refresh" },
        { expiresIn: this.config.get("REFRESH_TOKEN_EXPIRES_IN", "30d") }
      ),
    ]);

    // Store refresh token hash
    const refreshTokenHash = await hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validate JWT payload
   */
  async validateToken(token: string): Promise<{ userId: string }> {
    try {
      const payload = await this.jwt.verifyAsync(token);
      return { userId: payload.sub };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Verify email by token
   */
  async verifyEmail(token: string) {
    return this.verificationService.verifyEmail(token);
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak user existence? Actually for resend it's fine.
      return { success: true };
    }

    if (user.emailVerified) {
      return { success: true, message: "Email already verified" };
    }

    await this.verificationService.sendVerificationEmail(user.id, user.email);
    return { success: true };
  }
}
