// src/infrastructure/adapters/api/service/vehicle/vehicle.service.ts

import axios from "axios";
import type {
  GpsStatus,
  Vehicle,
  VehicleCategory,
  VehicleForm,
} from "@/core/types/vehicle";
import type { ApiResponse } from "@/core/types/apiResponse";
import type { ApiResponsePaginate } from "@/core/types/apiResponsePaginate";
import { getAuthToken } from "@/core/helpers/authToken";
import apiClient from "../../apiClient";

type UpsertVehicleData = Omit<VehicleForm, "id" | "_id">;
function mapBackendToVehicle(backendData: any): Vehicle {
  const attributes = backendData.attributes?.[0] ?? {};

  return {
    id: backendData.id,
    _id: backendData._id,
    plate: attributes.brand_label || "N/A",
    brandModel: backendData.name_model || "",

    year: Number(backendData.year_model) || 2000,

    category: (backendData.category_model === "automovil"
      ? "auto"
      : "otro") as VehicleCategory,
    gpsName: backendData.name_model || "",
    gpsSerial: backendData.serial_model || "",
    gpsStatus: (backendData.status_model === "active"
      ? "active"
      : "inactive") as GpsStatus,
    ownerId: backendData.ownerId ?? "Sin Propietario",
    contact: backendData.contact_model || "",
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
  };
}

function mapToBackendPayload(vehicleData: Partial<UpsertVehicleData>) {
  const payload = {
    name_model: vehicleData.brandModel,
    serial_model: vehicleData.gpsSerial,
    status_model: vehicleData.gpsStatus,
    contact_model: vehicleData.contact,
    category_model: vehicleData.category,

    year_model: String(vehicleData.year),

    ownerId: vehicleData.ownerId,
    attributes: [
      {
        deviceImage: vehicleData.deviceImage ?? "",
        brand_label: vehicleData.plate,
      },
    ],
  };
  return payload;
}

/**
 * POST /api/v1/vehicles
 * Crea un nuevo vehículo.
 */
export async function createVehicle(
  vehicleData: UpsertVehicleData
): Promise<Vehicle> {
  console.log("[VehicleService] Iniciando creación de vehículo...");
  try {
    const endpoint = "/api/v1/device/registerDevice";
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    // Mapeamos los datos
    const body = mapToBackendPayload(vehicleData);
    console.log("[VehicleService] Enviando datos mapeados:", body);

    const response = await apiClient.post<ApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.code === 200 && response.data.data) {
      return response.data.data as Vehicle;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[VehicleService] Error al crear vehículo:", error);
    let message = "Ocurrió un error inesperado al crear el vehículo.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/**
 * PUT /api/v1/vehicles/:id
 * Actualiza un vehículo existente.
 */
export async function updateVehicle(
  id: string,
  updates: Partial<UpsertVehicleData>
): Promise<Vehicle> {
  console.log(`[VehicleService] Actualizando vehículo con ID: ${id}...`);
  try {
    const endpoint = `/api/v1/device/updateDevice?id=${id}`; //! <-- AJUSTA TU ENDPOINT
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    // Mapeamos los datos al formato del backend
    const body = mapToBackendPayload(updates);
    console.log("[VehicleService] Enviando datos mapeados:", body);

    const response = await apiClient.put<ApiResponse>(endpoint, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.code === 200 && response.data.data) {
      return response.data.data as Vehicle;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[VehicleService] Error al actualizar vehículo:", error);
    let message = "Ocurrió un error inesperado al actualizar el vehículo.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/**
 * DELETE /api/v1/vehicles/:id
 * Elimina un vehículo.
 */
export async function deleteVehicle(id: string): Promise<void> {
  console.log(`[VehicleService] Eliminando vehículo con ID: ${id}...`);
  try {
    const endpoint = `/api/v1/device/inactiveDevice?${id}`;
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const response = await apiClient.patch<ApiResponse>(endpoint, null, {
      headers: { Authorization: `Bearer ${token}` },
      params: { id },
    });

    if (response.data && response.data.code === 200) {
      console.log("[VehicleService] Vehículo eliminado con éxito.");
      return;
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[VehicleService] Error al eliminar vehículo:", error);
    let message = "Ocurrió un error inesperado al eliminar el vehículo.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}

/**
 * GET /api/v1/vehicles/getPaginated
 * Lista los vehículos de forma paginada.
 */

export async function listVehiclesPaginated(
  page: number,
  limit: number
): Promise<ApiResponsePaginate & { data: Vehicle[] }> {
  console.log("[VehicleService] Listando vehículos (paginado)...");
  try {
    const endpoint = "/api/v1/device/getAllDevicesPaginated";
    const token = getAuthToken();
    if (!token) throw new Error("No autenticado");

    const response = await apiClient.get<ApiResponsePaginate>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });

    if (
      response.data &&
      response.data.code === 200 &&
      Array.isArray(response.data.data)
    ) {
      // Mapeamos cada vehículo en el array 'data'
      const mappedData = response.data.data.map(mapBackendToVehicle);

      // Devolvemos la respuesta con los datos ya transformados
      return {
        ...response.data,
        data: mappedData,
      };
    }
    throw new Error("La respuesta del servidor no tiene el formato esperado.");
  } catch (error) {
    console.error("[VehicleService] Error al listar vehículos:", error);
    let message = "Ocurrió un error inesperado al listar los vehículos.";
    if (axios.isAxiosError(error) && error.response) {
      message = (error.response.data as any)?.message || message;
    }
    throw new Error(message);
  }
}
