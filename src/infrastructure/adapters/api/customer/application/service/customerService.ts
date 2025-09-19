import HttpCustomerRepository from "../../infrastructure/http_customer.repository";
import CustomerService from "../customer.service";

export const customerService = new CustomerService(
  new HttpCustomerRepository()
);
