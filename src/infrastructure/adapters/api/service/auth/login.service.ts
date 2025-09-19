import axios from "axios";
import type { Login } from "@/core/types/login";
import type { ApiResponse } from "@/core/types/apiResponse";
import apiClient from "../../apiClient";

type LoginCredentials = Pick<Login, "email" | "password">;
export async function loginUser(credentials: LoginCredentials): Promise<any> {
  console.log("[AuthService] Iniciando el proceso de login...");

  try {
    const endpoint = "/api/v1/accounts/login";

    console.log(
      `[AuthService] Conectando a: ${apiClient.defaults.baseURL}${endpoint}`
    );
    console.log("[AuthService] Enviando credenciales:", {
      email: credentials.email,
      password: "●●●●●●●●",
    });

    const response = await apiClient.post<ApiResponse>(endpoint, {
      email: credentials.email,
      password: credentials.password,
    });

    console.log("[AuthService] Respuesta completa del servidor:", response);

    if (response.data && response.data.code === 200 && response.data.data) {
      console.log(
        "[AuthService] Login exitoso. Mensaje:",
        response.data.message
      );
      console.log(
        "[AuthService] Devolviendo los datos del usuario:",
        response.data.data
      );

      return response.data.data;
    } else {
      throw new Error(
        "La respuesta del servidor no tiene el formato esperado."
      );
    }
  } catch (error) {
    console.error("[AuthService] Ha ocurrido un error:", error);

    let errorMessage = "Ocurrió un error inesperado al iniciar sesión.";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("[AuthService] El servidor respondió con un error:", {
          status: error.response.status,
          data: error.response.data,
        });

        const serverMessage = error.response.data?.message;
        errorMessage =
          serverMessage ||
          `Error ${error.response.status}: Credenciales inválidas o problema en el servidor.`;
      } else if (error.request) {
        console.error("[AuthService] No se recibió respuesta del servidor.");
        errorMessage = "No se pudo conectar al servidor.";
      }
    }

    console.log(`[AuthService] Lanzando error para la UI: "${errorMessage}"`);
    throw new Error(errorMessage);
  }
}
