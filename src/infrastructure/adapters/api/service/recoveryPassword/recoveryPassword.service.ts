// src/infrastructure/adapters/api/service/auth/recovery.service.ts
import axios from "axios";
import apiClient from "../../apiClient";
import type { ApiResponse } from "@/core/types/apiResponse";

/** GET /api/v1/recovery/generatePasswordKey?email=... */
export async function generatePasswordKey(email: string): Promise<ApiResponse> {
  try {
    if (!email) throw new Error("El email es requerido.");
    const endpoint = "/api/v1/recovery/generatePasswordKey";
    const res = await apiClient.get<ApiResponse>(endpoint, {
      // No headers extra; solo params
      params: { email },
    });

    if (!res.data || typeof res.data.code !== "number") {
      throw new Error(
        "La respuesta del servidor no tiene el formato esperado."
      );
    }
    return res.data;
  } catch (error) {
    console.error("[RecoveryService] Error al generar clave:", error);
    let message = "No se pudo generar la clave temporal.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

export type ChangePasswordPayload = {
  temporaryKey: string;
  password: string;
  confirmPassword: string;
};

/** POST /api/v1/recovery/changePassword */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ApiResponse> {
  try {
    const endpoint = "/api/v1/recovery/changePassword";
    const res = await apiClient.post<ApiResponse>(endpoint, payload);
    if (!res.data || typeof res.data.code !== "number") {
      throw new Error(
        "La respuesta del servidor no tiene el formato esperado."
      );
    }
    return res.data;
  } catch (error) {
    console.error("[RecoveryService] Error al cambiar contraseña:", error);
    let message = "No se pudo cambiar la contraseña.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}
