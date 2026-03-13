import { IntegrationsService } from "./integrations.service";
export declare class IntegrationsController {
    private integrationsService;
    constructor(integrationsService: IntegrationsService);
    getAccounts(userId: string): Promise<never[]>;
    getMailboxes(workspaceId: string): Promise<never[]>;
}
