// src/infrastructure/adapters/api/apiClient.ts
import axios from "axios";
import { getUserData } from "@/core/helpers/authUserData";
import { getCompanyCode } from "@/core/helpers/company";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error("La variable de entorno VITE_API_BASE_URL no está definida.");
}

export type SessionUser = { token?: string };

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// 👉 Interceptor para inyectar Authorization y x-companycode
apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  try {
    // Bearer token desde localStorage (user_data.token)
    const user = getUserData<SessionUser>();
    const token = user?.token;
    if (
      token &&
      !config.headers.Authorization &&
      !config.headers.authorization
    ) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    // Código de compañía si aplica
    const companyCode = getCompanyCode();
    if (companyCode && !config.headers["x-companycode"]) {
      (config.headers as any)["x-companycode"] = companyCode;
    }
  } catch {
    // silencioso
  }

  return config;
});

export default apiClient;
