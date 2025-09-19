// ✨ Definición centralizada de las columnas para la tabla
export const documentTableColumns = [
  { id: "documento", label: "Documento", width: "w-32" },
  { id: "asociadoA", label: "Asociado a", width: "w-40" },
  { id: "vencimiento", label: "Vencimiento", width: "w-28" },
  { id: "estado", label: "Estado", width: "w-24" },
  { id: "acciones", label: "Acciones", width: "w-24" },
];

export const customerTableColumns = [
  { id: "nombre", label: "Nombre", width: "w-40" },
  { id: "email", label: "Email", width: "w-56" },
  { id: "plan", label: "Plan", width: "w-24" },
  { id: "estado", label: "Estado", width: "w-24" },
  { id: "acciones", label: "Acciones", width: "w-20" },
];

export const serviceTableColumns = [
  { id: "servicio", label: "Servicio", width: "w-40" },
  { id: "categoria", label: "Categoría", width: "w-28" },
  { id: "direccion", label: "Dirección", width: "w-56" },
  { id: "estado", label: "Estado", width: "w-20" },
  { id: "acciones", label: "Acciones", width: "w-24" },
];

export const vehicleTableColumns = [
  { id: "placa", label: "Placa", width: "w-24" },
  { id: "marcaModelo", label: "Marca / Modelo", width: "w-32" },
  { id: "ano", label: "Año", width: "w-16" },
  { id: "categoria", label: "Categoría", width: "w-20" },
  { id: "propietario", label: "Propietario", width: "w-28" },
  { id: "estadoGps", label: "Estado GPS", width: "w-20" },
  { id: "acciones", label: "Acciones", width: "w-24" },
];
