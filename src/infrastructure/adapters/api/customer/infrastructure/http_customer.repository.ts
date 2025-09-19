// src/application/customer/infrastructure/http_customer_repository.ts
import apiClient from "@/infrastructure/adapters/api/apiClient";
import type { ApiResponse } from "@/core/types/apiResponse";
import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";

import type {
  CreateCustomerPayload,
  UpsertCustomerPayload,
} from "../domain/customer";
import type { ICustomerRepository } from "../domain/i_customer_repository";

export default class HttpCustomerRepository implements ICustomerRepository {
  async create(data: CreateCustomerPayload): Promise<ApiResponse> {
    const endpoint = "/api/v1/users/createUser";
    const res = await apiClient.post<ApiResponse>(endpoint, data);
    return res.data;
  }

  async updateByEmail(
    email: string,
    updates: UpsertCustomerPayload
  ): Promise<ApiResponse> {
    const endpoint = "/api/v1/users/updateEmailUser";
    const res = await apiClient.put<ApiResponse>(endpoint, updates, {
      params: { email },
    });
    return res.data;
  }

  async list(): Promise<ApiResponse> {
    const endpoint = "/api/v1/users/getUser";
    const res = await apiClient.get<ApiResponse>(endpoint);
    return res.data;
  }

  async listPaginated(
    page: number,
    limit: number
  ): Promise<ApiResponsePaginate> {
    const endpoint = "/api/v1/users/getUserPaginated";
    const res = await apiClient.get<ApiResponsePaginate>(endpoint, {
      params: { page, limit },
    });
    return res.data;
  }

  async inactiveByEmail(email: string): Promise<ApiResponse> {
    const endpoint = "/api/v1/accounts/inactiveAccount";
    const res = await apiClient.patch<ApiResponse>(endpoint, null, {
      params: { email },
    });
    return res.data;
  }
}
