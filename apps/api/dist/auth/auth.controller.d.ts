import { AuthService } from "./auth.service";
declare class RegisterRequest {
    email: string;
    password: string;
    name?: string;
}
declare class LoginRequest {
    email: string;
    password: string;
}
declare class AuthResponse {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterRequest): Promise<AuthResponse>;
    login(dto: LoginRequest): Promise<AuthResponse>;
}
export {};
