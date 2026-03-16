import { SetMetadata } from "@nestjs/common";

export const RequireLimit = (limitType: "jobs" | "resumes" | "workspaces") => SetMetadata("limitType", limitType);
