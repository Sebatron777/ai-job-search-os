import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IntegrationsService } from "./integrations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Public } from "../auth/public.decorator";

@ApiTags("integrations")
@Controller("integrations")
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get("accounts")
  async getAccounts(@Request() req: any) {
    const accounts = await this.integrationsService.getConnectedAccounts(req.user.id);
    return accounts.map(({ accessToken, refreshToken, ...rest }: any) => rest);
  }

  @Get("mailboxes")
  async getMailboxes(@Query("workspaceId") workspaceId: string) {
    return this.integrationsService.getMailboxConnections(workspaceId);
  }

  @Get("gmail/connect")
  async connectGmail(@Request() req: any) {
    const url = await this.integrationsService.getGmailConnectUrl(req.user.id);
    return { url };
  }

  @Public()
  @Get("gmail/callback")
  async handleGmailCallback(
    @Query("code") code: string,
    @Query("state") state: string
  ) {
    return this.integrationsService.handleGmailCallback(code, state);
  }
}
