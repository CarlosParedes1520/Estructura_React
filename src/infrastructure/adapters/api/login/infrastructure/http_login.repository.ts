// src/application/auth/infrastructure/http_auth_repository.ts
import apiClient from "@/infrastructure/adapters/api/apiClient";
import type { ApiResponse } from "@/core/types/apiResponse";
import type { Login } from "@/core/types/login";
import type { IAuthRepository } from "../domain/i_login_repository";

export default class HttpAuthRepository implements IAuthRepository {
  async login(
    credentials: Pick<Login, "email" | "password">
  ): Promise<ApiResponse> {
    const endpoint = "/api/v1/accounts/login";
    const res = await apiClient.post<ApiResponse>(endpoint, credentials);
    return res.data;
  }
}
