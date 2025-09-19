// src/infrastructure/adapters/api/service/userImage/userImage.service.ts
import axios from "axios";
import apiClient from "../../apiClient";
import { getUserData } from "@/core/helpers/authUserData";
// import { getAuthToken } from "@/core/helpers/authToken";

/**
 * Obtiene la imagen del usuario autenticado (el backend usa el token para identificarlo).
 * Respuesta: Blob de imagen.
 */
export async function getMyUserImage(opts?: {
  signal?: AbortSignal;
}): Promise<Blob> {
  const endpoint = "/api/v1/userImage/getByIdUserImage";

  try {
    const token = getUserData()
    if (!token) throw new Error("No autenticado");

    const res = await apiClient.get<Blob>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "image/*",
      },
      responseType: "blob",
      signal: opts?.signal,
    });

    // Validación rápida de content-type
    const ct = (res.headers as any)?.["content-type"] as string | undefined;
    if (!ct || !ct.startsWith("image/")) {
      // Puede ser un JSON de error; intenta leerlo para mensaje
      try {
        const text = await (res.data as any).text?.();
        throw new Error(text || "El servidor no envió una imagen válida.");
      } catch {
        throw new Error("El servidor no envió una imagen válida.");
      }
    }

    return res.data;
  } catch (error) {
    console.error("[UserImageService] Error al obtener imagen:", error);
    let message = "Ocurrió un error al obtener la imagen de usuario.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

