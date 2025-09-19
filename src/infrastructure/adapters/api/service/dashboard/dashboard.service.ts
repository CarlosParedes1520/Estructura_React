import axios from "axios";
import apiClient from "../../apiClient";
import { getAuthToken } from "@/core/helpers/authToken";
import { getAuthEmail } from "@/core/helpers/authEmail";

type DashboardAccount = {
  totalcustomer: number;
  totalvehicle: number;
  serviceTotal: number;
  documentExpired: number;
};

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export async function getDashboardAccount(): Promise<DashboardAccount> {
  console.log("[AccountService] Obteniendo dashboard...");
  const endpoint = "/api/v1/accounts/getDashboardAccount";

  try {
    const email = getAuthEmail();
    if (!email) throw new Error("No se encontró el email en la sesión.");

    const token = getAuthToken(); // si tu endpoint requiere auth; si no, puedes omitir
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const res = await apiClient.get<ApiResponse<DashboardAccount>>(endpoint, {
      headers,
      params: { email },
    });

    if (res.data?.code === 200 && res.data?.data) {
      return res.data.data;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[AccountService] Error dashboard:", error);
    let message = "Ocurrió un error al cargar el dashboard.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}
