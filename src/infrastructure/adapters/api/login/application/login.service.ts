// src/application/auth/service/auth_service.ts
import type { Login } from "@/core/types/login";
import HttpException from "@/core/errors/HttpException";
import type { IAuthRepository } from "../domain/i_login_repository";

export default class AuthService {
  private readonly repo: IAuthRepository;

  constructor(repo: IAuthRepository) {
    this.repo = repo;
  }
  private assertOk<T = any>(payload: any): T {
    if (!payload || payload.code !== 200) {
      throw new HttpException({
        code: payload?.code,
        message: payload?.message || "Error en servidor",
      });
    }
    return payload.data as T;
  }

  async login(credentials: Pick<Login, "email" | "password">) {
    const payload = await this.repo.login(credentials);
    return this.assertOk(payload);
  }
}
