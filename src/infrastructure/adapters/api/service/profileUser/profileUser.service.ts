// src/infrastructure/adapters/api/service/user/profileUser.service.ts
import axios from "axios";
import apiClient from "../../apiClient";
import { getAuthToken } from "@/core/helpers/authToken";
import type { ApiResponse } from "@/core/types/apiResponse";

export type UpdateUserPayload = {
  name: string;
  last_name: string;
  email: string; // nuevo email
  phone: string;
};

const ENDPOINT = "/api/v1/users/updateEmailUserWithImage";

export async function updateUserWithImage(
  currentEmail: string,
  payload: UpdateUserPayload, 
  file?: File 
): Promise<ApiResponse> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const form = new FormData();
    form.append("name", payload.name);
    form.append("last_name", payload.last_name);
    form.append("email", payload.email);
    form.append("phone", payload.phone);

    //  File
    if (file instanceof File) {
      form.append("file", file); 
    }

    const res = await apiClient.request<ApiResponse>({
      method: "put",
      url: ENDPOINT,
      data: form,
      params: { email: currentEmail }, 
      headers: {
        Authorization: `Bearer ${token}`, 
        "Content-Type": "multipart/form-data",
      },

      transformRequest: (d) => d,
    });

    if (!res.data || typeof res.data.code !== "number") {
      throw new Error(
        "La respuesta del servidor no tiene el formato esperado."
      );
    }
    return res.data;
  } catch (error) {
    console.error("[UsersService] Error al actualizar usuario:", error);
    let message = "Ocurrió un error al actualizar el usuario.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}
