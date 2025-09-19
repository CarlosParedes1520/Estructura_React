import axios from "axios";
import type { Customer } from "@/core/types/customer";
import type { ApiResponse } from "@/core/types/apiResponse";
import apiClient from "../../apiClient";
import { getCompanyCode } from "@/core/helpers/company";
// import { getAuthToken } from "@/core/helpers/authToken";
import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";
import { getUserData } from "@/core/helpers/authUserData";

type CreateCustomerPayload = Pick<
  Customer,
  "name" | "last_name" | "email" | "phone"
>;

export async function createCustomer(
  customerData: CreateCustomerPayload
): Promise<Customer> {
  console.log("[CustomerService] Iniciando creación de cliente...");

  try {
    const endpoint = "/api/v1/users/createUser";

    const fullUrl =
      `${apiClient.defaults.baseURL?.replace(/\/+$/, "")}/` +
      `${endpoint.replace(/^\/+/, "")}`;
    console.log("[CustomerService] Conectando a:", fullUrl);

    const body = {
      name: customerData.name,
      last_name: customerData.last_name,
      email: customerData.email,
      phone: customerData.phone,
    };
    console.log("[CustomerService] Enviando datos:", body);

    const companyCode = getCompanyCode() ?? "";
    console.log("company :", companyCode);
    const response = await apiClient.post<ApiResponse>(endpoint, body, {
      headers: {
        "x-companycode": companyCode,
      },
    });

    console.log("[CustomerService] Respuesta completa del servidor:", response);

    if (response.data && response.data.code === 200 && response.data.data) {
      console.log(
        "[CustomerService] Cliente creado con éxito. Mensaje:",
        response.data.message
      );
      console.log(
        "[CustomerService] Datos devueltos por el servidor:",
        response.data.data
      );
      return response.data.data as Customer;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[CustomerService] Ha ocurrido un error:", error);

    let errorMessage = "Ocurrió un error inesperado al crear el cliente.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("[CustomerService] El servidor respondió con un error:", {
          status: error.response.status,
          data: error.response.data,
        });
        const serverMessage = (error.response.data as any)?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: Datos inválidos o problema en el servidor.`;
      } else if (error.request) {
        console.error(
          "[CustomerService] No se recibió respuesta del servidor."
        );
        errorMessage = "No se pudo conectar al servidor.";
      }
    }
    console.log(
      `[CustomerService] Lanzando error para la UI: "${errorMessage}"`
    );
    throw new Error(errorMessage);
  }
}

type UpsertCustomerPayload = Pick<
  Customer,
  "name" | "last_name" | "email" | "phone"
>;

export async function updateCustomerByEmail(
  email: string,
  updates: UpsertCustomerPayload
): Promise<Customer> {
  console.log(
    "[CustomerService] Iniciando actualización de cliente por email..."
  );

  try {
    const endpoint = "/api/v1/users/updateEmailUser";
    const fullUrl =
      `${apiClient.defaults.baseURL?.replace(/\/+$/, "")}/` +
      `${endpoint.replace(/^\/+/, "")}`;
    console.log("[CustomerService] Conectando a:", `${fullUrl}?email=${email}`);

    const token = getUserData();
    if (!token) {
      throw new Error("No hay token en sesión. Inicia sesión nuevamente.");
    }

    const response = await apiClient.put<ApiResponse>(endpoint, updates, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { email },
    });

    console.log("[CustomerService] Respuesta completa del servidor:", response);

    if (response.data && response.data.code === 200 && response.data.data) {
      console.log(
        "[CustomerService] Cliente actualizado. Mensaje:",
        response.data.message
      );
      return response.data.data as Customer;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[CustomerService] Error al actualizar cliente:", error);

    let errorMessage = "Ocurrió un error inesperado al actualizar el cliente.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("[CustomerService] Servidor respondió con error:", {
          status: error.response.status,
          data: error.response.data,
        });
        const serverMessage = (error.response.data as any)?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: Datos inválidos o problema en el servidor.`;
      } else if (error.request) {
        console.error(
          "[CustomerService] No se recibió respuesta del servidor."
        );
        errorMessage = "No se pudo conectar al servidor.";
      }
    }
    throw new Error(errorMessage);
  }
}
/**
 * GET /api/v1/users/getUser
 */
export async function listCustomers(): Promise<Customer[]> {
  console.log("[CustomerService] Listando clientes...");

  try {
    const endpoint = "/api/v1/users/getUser";
    const fullUrl =
      `${apiClient.defaults.baseURL?.replace(/\/+$/, "")}/` +
      `${endpoint.replace(/^\/+/, "")}`;
    console.log("[CustomerService] Conectando a:", fullUrl);

    const token = getUserData();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    // const companyCode = getCompanyCode() ?? "";
    const response = await apiClient.get<ApiResponse>(endpoint, {
      //   headers: { "x-companycode": companyCode },
      headers,
    });

    console.log("[CustomerService] Respuesta completa del servidor:", response);

    if (response.data && response.data.code === 200 && response.data.data) {
      const data = response.data.data as Customer[];
      console.log(`[CustomerService] ${data.length} clientes encontrados.`);
      return data;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[CustomerService] Error al listar clientes:", error);

    let errorMessage = "Ocurrió un error inesperado al listar los clientes.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("[CustomerService] Servidor respondió con error:", {
          status: error.response.status,
          data: error.response.data,
        });
        const serverMessage = (error.response.data as any)?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: Problema en el servidor.`;
      } else if (error.request) {
        console.error(
          "[CustomerService] No se recibió respuesta del servidor."
        );
        errorMessage = "No se pudo conectar al servidor.";
      }
    }
    throw new Error(errorMessage);
  }
}

export async function listCustomersPaginated(
  page: number,
  limit: number
): Promise<ApiResponsePaginate & { data: Customer[] }> {
  console.log("[CustomerService] Listando clientes (paginado)...");

  try {
    const endpoint = "/api/v1/users/getUserPaginated";
    const fullUrl =
      `${apiClient.defaults.baseURL?.replace(/\/+$/, "")}/` +
      `${endpoint.replace(/^\/+/, "")}`;
    console.log(
      "[CustomerService] Conectando a:",
      `${fullUrl}?page=${page}&limit=${limit}`
    );

    const token = getUserData();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    // const companyCode = getCompanyCode() ?? "";
    // if (companyCode) headers["x-companycode"] = companyCode;

    const response = await apiClient.get<ApiResponsePaginate>(endpoint, {
      headers,
      params: { page, limit }, // cache-buster
    });

    console.log("[CustomerService] Respuesta completa (paginado):", response);

    if (response.data && response.data.code === 200 && response.data.data) {
      const payload = response.data as ApiResponsePaginate & {
        data: Customer[];
      };
      console.log(
        `[CustomerService] Página ${payload.currentPage}/${payload.totalPages} | items: ${payload.data.length} de ${payload.totalItems}`
      );
      return payload;
    }

    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[CustomerService] Error al listar paginado:", error);

    let errorMessage = "Ocurrió un error inesperado al listar (paginado).";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(
          "[CustomerService] Servidor respondió con error (paginado):",
          {
            status: error.response.status,
            data: error.response.data,
          }
        );
        const serverMessage = (error.response.data as any)?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: Problema en el servidor.`;
      } else if (error.request) {
        console.error(
          "[CustomerService] No se recibió respuesta del servidor (paginado)."
        );
        errorMessage = "No se pudo conectar al servidor.";
      }
    }
    throw new Error(errorMessage);
  }
}

export async function inactiveCustomerByEmail(
  email: string
): Promise<Customer> {
  console.log(
    `[CustomerService] Iniciando inactivación de cuenta para el email: ${email}`
  );

  try {
    const endpoint = "/api/v1/accounts/inactiveAccount";
    const fullUrl =
      `${apiClient.defaults.baseURL?.replace(/\/+$/, "")}/` +
      `${endpoint.replace(/^\/+/, "")}`;
    console.log("[CustomerService] Conectando a:", `${fullUrl}?email=${email}`);

    // Obtenemos el token de autenticación
    const token = getUserData();
    if (!token) {
      throw new Error("No hay token en sesión. Inicia sesión nuevamente.");
    }

    // Realizamos la llamada PATCH. El método PATCH no siempre requiere un body,
    // por lo que pasamos `null` como segundo argumento.
    const response = await apiClient.patch<ApiResponse>(endpoint, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { email },
    });

    console.log("[CustomerService] Respuesta completa del servidor:", response);

    // Verificamos si la respuesta es exitosa y contiene datos
    if (response.data && response.data.code === 200 && response.data.data) {
      console.log(
        "[CustomerService] Cliente inactivado con éxito. Mensaje:",
        response.data.message
      );
      return response.data.data as Customer;
    }

    // Si el formato no es el esperado, lanzamos un error
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[CustomerService] Error al inactivar cliente:", error);

    let errorMessage = "Ocurrió un error inesperado al inactivar el cliente.";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("[CustomerService] El servidor respondió con un error:", {
          status: error.response.status,
          data: error.response.data,
        });
        const serverMessage = (error.response.data as any)?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: El email no existe o hubo un problema en el servidor.`;
      } else if (error.request) {
        console.error(
          "[CustomerService] No se recibió respuesta del servidor."
        );
        errorMessage = "No se pudo conectar al servidor.";
      }
    }

    throw new Error(errorMessage);
  }
}
