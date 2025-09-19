// ../domain/i_customer_repository.ts
import type { ApiResponse } from "@/core/types/apiResponse";
import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";
import type { CreateCustomerPayload, UpsertCustomerPayload } from "./customer"; 

export interface ICustomerRepository {
  create(data: CreateCustomerPayload): Promise<ApiResponse>;
  updateByEmail(
    email: string,
    updates: UpsertCustomerPayload
  ): Promise<ApiResponse>;
  list(): Promise<ApiResponse>;
  listPaginated(page: number, limit: number): Promise<ApiResponsePaginate>;
  inactiveByEmail(email: string): Promise<ApiResponse>;
}
