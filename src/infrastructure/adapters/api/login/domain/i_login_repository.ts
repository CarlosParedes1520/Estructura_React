import type { ApiResponse } from "@/core/types/apiResponse";
import type { Login } from "@/core/types/login";

export interface IAuthRepository {
  // el backend solo necesita email y password
  login(data: Pick<Login, "email" | "password">): Promise<ApiResponse>;
}
