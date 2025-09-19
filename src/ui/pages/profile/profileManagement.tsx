import * as React from "react";
import { Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserData, updateUserData } from "@/core/helpers/authUserData";
import { getMyUserImageURL } from "@/core/helpers/getUserImageURL";
import type { Profile } from "@/core/types/profileUser";
import { updateUserWithImage } from "@/infrastructure/adapters/api/service/profileUser/profileUser.service";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { profileUpdater } from "@/core/helpers/profileEvent";

const inputStyles =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";

function extractProfileFromUserData(obj: any): Profile {
  const raw = obj?.data ?? obj ?? {};
  return {
    name: String(raw.name ?? "").trim(),
    last_name: String(raw.last_name ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    phone: String(raw.phone ?? "").trim(),
    avatarUrl: undefined,
  };
}

export default function ProfilePage() {
  const [values, setValues] = React.useState<Profile>({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    avatarUrl: undefined,
  });

  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<
    string | undefined
  >();
  const [serverAvatarUrl, setServerAvatarUrl] = React.useState<string | null>(
    null
  );
  const [errors, setErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const [loading, setLoading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const originalEmailRef = React.useRef<string>("");
  const objectUrlRef = React.useRef<string | null>(null);

  const loadProfileFromLocalStorage = React.useCallback(() => {
    try {
      const ud = getUserData();
      if (ud) {
        const profile = extractProfileFromUserData(ud);
        setValues(profile);
        originalEmailRef.current = profile.email || "";
      }
    } catch {}
  }, []);

  const loadAvatarFromServer = React.useCallback(async () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    try {
      const url = await getMyUserImageURL(); 
      objectUrlRef.current = url;
      setServerAvatarUrl(url);
    } catch {
      setServerAvatarUrl(null);
    }
  }, []);

  React.useEffect(() => {
    loadProfileFromLocalStorage();
    loadAvatarFromServer();
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [loadProfileFromLocalStorage, loadAvatarFromServer]);

  const onPickImage = () => fileInputRef.current?.click();
  const onRemoveImage = () => {
    setAvatarFile(null);
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_MB = 3;
    if (!file.type.startsWith("image/")) {
      Swal.fire(
        "Archivo no válido",
        "El archivo debe ser una imagen.",
        "warning"
      );
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      Swal.fire(
        "Archivo demasiado grande",
        `La imagen no debe superar ${MAX_MB} MB.`,
        "warning"
      );
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next: Record<string, string | undefined> = {};
    if (!values.name.trim()) next.name = "El nombre es requerido.";
    if (!values.last_name.trim()) next.last_name = "El apellido es requerido.";
    if (!values.email.trim()) next.email = "El email es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Email inválido.";
    if (!values.phone.trim()) next.phone = "El teléfono es requerido.";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // endpoint (multipart/form-data)
      const res = await updateUserWithImage(
        originalEmailRef.current,
        {
          name: values.name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        },
        avatarFile || undefined
      );

      profileUpdater.dispatch();

      // Actualiza user_data en localStorage 
      const updated = res?.data ?? {
        name: values.name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
      };
      updateUserData(updated);

      // Recarga la imagen desde el backend 
      await loadAvatarFromServer();
      setAvatarPreview(undefined);
      setAvatarFile(null);

   
      originalEmailRef.current = (updated as any).email || values.email;

      // Notificación
      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Los cambios se guardaron correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text:
          err instanceof Error
            ? err.message
            : "Ocurrió un error al actualizar el perfil.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    loadProfileFromLocalStorage();
    onRemoveImage();
    await loadAvatarFromServer();
    setErrors({});
  };

  const avatarSrc = avatarPreview ?? serverAvatarUrl ?? null;

  return (
    <div className="p-2 sm:p-6">
      <h1 className="text-2xl font-bold text-slate-900">Perfil</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">
            Información de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {/* Avatar */}
            <div className="md:col-span-1">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500">
                      <Camera className="h-7 w-7" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageChange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" variant="default" onClick={onPickImage}>
                    Seleccionar foto
                  </Button>
                  {/* 
                  {(avatarPreview || serverAvatarUrl) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onRemoveImage}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Quitar
                    </Button>
                  )} */}
                </div>

                <p className="text-xs text-slate-500">
                  Formatos: JPG/PNG. Máx 3MB.
                </p>
              </div>
            </div>

            {/* Campos */}
            <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombres
                </label>
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="Tus apellidos"
                  autoComplete="family-name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.last_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="tucorreo@dominio.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  className={inputStyles}
                  placeholder="099 123 4567"
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="md:col-span-3 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscard}
                disabled={loading}
              >
                Descartar
              </Button>
              <Button
                type="submit"
                className="bg-[#0B61E0] hover:bg-[#0A56C7]"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
