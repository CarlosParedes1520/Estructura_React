export type CustomerStatus = "active" | "suspended";
export type CustomerPlan = "basic" | "premium";

export type Customer = {
  _id?: string;
  name: string;
  last_name: string;
  email: string;
  phone?: number;
  plan?: CustomerPlan;
  status?: CustomerStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerListApiResponse = {
  data: Customer[];
};
