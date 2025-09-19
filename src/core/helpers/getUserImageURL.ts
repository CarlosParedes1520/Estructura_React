import { getMyUserImage } from "@/infrastructure/adapters/api/service/userImage/userImage.service";

/** Helper: crea un Object URL (recuerda revocarlo con URL.revokeObjectURL). */
export async function getMyUserImageURL(opts?: {
  signal?: AbortSignal;
}): Promise<string> {
  const blob = await getMyUserImage(opts);
  return URL.createObjectURL(blob);
}

/** Helper: devuelve la imagen como data URL (base64). */
export async function getMyUserImageBase64(opts?: {
  signal?: AbortSignal;
}): Promise<string> {
  const blob = await getMyUserImage(opts);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
