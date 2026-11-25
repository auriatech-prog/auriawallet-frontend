import { apiClient } from "./apiClient";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

export interface ExchangeGoogleCodePayload {
  code: string;
  codeVerifier: string;
}

export const authService = {
  login(payload: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/auth/login", payload, {
      requiresAuth: false,
    });
  },

  register(payload: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/api/auth/register", payload, {
      requiresAuth: false,
    });
  },

  exchangeGoogleCode(
    payload: ExchangeGoogleCodePayload,
  ): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/api/auth/google/exchange", payload, {
      requiresAuth: false,
    });
  },

  getMe(): Promise<AuthUser> {
    return apiClient.get<AuthUser>("/api/auth/me");
  },
};
