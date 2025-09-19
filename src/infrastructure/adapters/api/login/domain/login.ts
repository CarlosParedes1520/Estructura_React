export type { Customer } from "@/core/types/customer";

export type CreateCustomerPayload = {
  name: string;
  last_name: string;
  email: string;
  phone: string;
};

export type UpsertCustomerPayload = CreateCustomerPayload;
