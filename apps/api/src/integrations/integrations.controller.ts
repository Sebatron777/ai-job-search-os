import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IntegrationsService } from "./integrations.service";

@ApiTags("integrations")
@Controller("integrations")
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @Get("accounts")
  async getAccounts(@Query("userId") userId: string) {
    return this.integrationsService.getConnectedAccounts(userId);
  }

  @Get("mailboxes")
  async getMailboxes(@Query("workspaceId") workspaceId: string) {
    return this.integrationsService.getMailboxConnections(workspaceId);
  }

  @Get("gmail/connect")
  async connectGmail(@Query("userId") userId: string) {
    const url = await this.integrationsService.getGmailConnectUrl(userId);
    return { url };
  }

  @Get("gmail/callback")
  async handleGmailCallback(
    @Query("code") code: string,
    @Query("state") state: string
  ) {
    return this.integrationsService.handleGmailCallback(code, state);
  }
}
