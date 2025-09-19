// src/infrastructure/adapters/api/service/service/service.service.ts
import axios from "axios";
import type { Service } from "@/core/types/service";
import type { ApiResponse } from "@/core/types/apiResponse";
import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";
import { getAuthToken } from "@/core/helpers/authToken";
import apiClient from "../../apiClient";

type UpsertServiceData = Omit<Service, "id" | "createdAt" | "updatedAt">;

/** BACKEND -> FRONT (tolerante a faltantes) */
function mapBackendToService(b: any): Service {
  const toNumOrNull = (v: any) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : null;
  };

  return {
    id: b._id ?? b.id,
    // en tu backend viene category_service (string). Lo usamos como categoryId.
    categoryId: b.categoryId ?? b.category_id ?? b.category_service ?? "",
    name: b.name ?? b.name_service ?? "",
    description: b.description ?? b.description_service ?? "",
    address: b.address ?? b.address_service ?? "",
    // el backend no los envía: dejamos defaults seguros
    days: (b.days ?? b.days_service ?? []) as Service["days"],
    timeFrom: b.timeFrom ?? b.time_from ?? "",
    timeTo: b.timeTo ?? b.time_to ?? "",
    lat: toNumOrNull(b.latitude_service ?? b.lat),
    lng: toNumOrNull(b.longitude_service ?? b.lng),
    active:
      typeof b.active === "boolean"
        ? b.active
        : typeof b.active_service === "boolean"
          ? b.active_service
          : true,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

/** FRONT -> BACKEND (si tu API ignora algunos, no pasa nada al enviarlos) */
function mapToBackendPayload(d: Partial<UpsertServiceData>) {
  return {
    name_service: d.name,
    description_service: d.description ?? "",
    address_service: d.address,
    // usando category_service como “id”/clave elegida por el backend
    category_service: d.categoryId,

    // si tu backend no los usa, los puede ignorar:
    days_service: d.days, // ["L","M","X"...]
    time_from: d.timeFrom, // "HH:mm"
    time_to: d.timeTo, // "HH:mm"

    latitude_service: d.lat,
    longitude_service: d.lng,
    active_service: d.active,
  };
}

/** POST: crear */
export async function createService(data: UpsertServiceData): Promise<Service> {
  console.log("[ServiceService] Creando servicio...");
  try {
    const endpoint = "/api/v1/service/createService";
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const body = mapToBackendPayload(data);
    const response = await apiClient.post<ApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = (response.data as any)?.data;
    // tu backend a veces devuelve array; tomamos el primero si es el caso
    const item = Array.isArray(payload) ? payload[0] : payload;
    if (response.data?.code === 200 && item) {
      return mapBackendToService(item);
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[ServiceService] Error al crear servicio:", error);
    let message = "Ocurrió un error inesperado al crear el servicio.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/** PUT: actualizar por id */
export async function updateService(
  id: string,
  updates: Partial<UpsertServiceData>
): Promise<Service> {
  console.log(`[ServiceService] Actualizando servicio ${id}...`);
  try {
    const endpoint = `/api/v1/service/updateService?id=${id}`;
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const body = mapToBackendPayload(updates);
    const response = await apiClient.put<ApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });

    const payload = (response.data as any)?.data;
    const item = Array.isArray(payload) ? payload[0] : payload;
    if (response.data?.code === 200 && item) {
      return mapBackendToService(item);
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[ServiceService] Error al actualizar servicio:", error);
    let message = "Ocurrió un error inesperado al actualizar el servicio.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/** PATCH: inactivar/eliminar */
export async function deleteService(id: string): Promise<void> {
  console.log(`[ServiceService] Inactivando/eliminando servicio ${id}...`);
  try {
    const endpoint = `/api/v1/service/inactiveService?id=${id}`;
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const response = await apiClient.patch<ApiResponse>(endpoint, null, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });

    if (response.data?.code === 200) return;
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[ServiceService] Error al eliminar servicio:", error);
    let message = "Ocurrió un error inesperado al eliminar el servicio.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/** GET: paginado */
export async function listServicesPaginated(
  page: number,
  limit: number
): Promise<ApiResponsePaginate & { data: Service[] }> {
  console.log("[ServiceService] Listando servicios (paginado)...");
  try {
    const endpoint = "/api/v1/service/getAllServicePaginated";
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const response = await apiClient.get<ApiResponsePaginate>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });

    const raw = response.data;
    const list = Array.isArray(raw?.data) ? raw.data : [];
    const mapped = list.map(mapBackendToService);

    return {
      ...raw,
      data: mapped,
      totalPages: (raw as any).totalPages ?? 1,
      currentPage: (raw as any).currentPage ?? page,
      pageSize: (raw as any).pageSize ?? limit,
      totalItems: (raw as any).totalItems ?? mapped.length,
    } as any;
  } catch (error) {
    console.error("[ServiceService] Error al listar servicios:", error);
    let message = "Ocurrió un error inesperado al listar los servicios.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}
