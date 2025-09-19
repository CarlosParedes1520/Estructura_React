import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";
import HttpException from "@/core/errors/HttpException";
import type { Customer } from "../domain/customer";
import type { ICustomerRepository } from "../domain/i_customer_repository";

export default class CustomerService {
  private readonly repo: ICustomerRepository; 

  constructor(repo: ICustomerRepository) {
   
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

  async create(
    data: Parameters<ICustomerRepository["create"]>[0]
  ): Promise<Customer> {
    const payload = await this.repo.create(data);
    return this.assertOk<Customer>(payload);
  }

  async updateByEmail(
    email: string,
    updates: Parameters<ICustomerRepository["updateByEmail"]>[1]
  ): Promise<Customer> {
    const payload = await this.repo.updateByEmail(email, updates);
    return this.assertOk<Customer>(payload);
  }

  async list(): Promise<Customer[]> {
    const payload = await this.repo.list();
    return this.assertOk<Customer[]>(payload);
  }

  async listPaginated(
    page: number,
    limit: number
  ): Promise<ApiResponsePaginate & { data: Customer[] }> {
    const payload = await this.repo.listPaginated(page, limit);
    if (payload.code !== 200) {
      throw new HttpException({
        code: payload.code,
        message: (payload as any).message,
      });
    }
    return payload as any;
  }

  async inactiveByEmail(email: string): Promise<Customer> {
    const payload = await this.repo.inactiveByEmail(email);
    return this.assertOk<Customer>(payload);
  }
}
