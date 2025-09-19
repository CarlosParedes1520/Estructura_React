import * as React from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter, useSearch } from "@tanstack/react-router";

import { loginSchema } from "@/core/schemas/login.schema";
import type { Login } from "@/core/types/login";
import { loginUser } from "@/infrastructure/adapters/api/service/auth/login.service";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { setUserData } from "@/core/helpers/authUserData";
import RecoverPasswordModal from "../recoveryPassword/RecoveryPassword";
export default function Login() {
  const logoSrc = `${import.meta.env.BASE_URL}logo/app.png`;
  const loginSrc = `${import.meta.env.BASE_URL}logo/login.png`;

  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [openRecover, setOpenRecover] = React.useState(false);

  const [form, setForm] = React.useState<Login>({
    email: "mateosalazar7@gmail.com", //mateosalazar7@gmail.com
    password: "Mateo.com345", //Mateo.com345
    remember: false,
  });

  // Errores por campo
  const [errors, setErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const router = useRouter();
  const search = useSearch({ from: "/login" }) as { redirect?: string };

  async function handleLogin(credentials: Pick<Login, "email" | "password">) {
    try {
      const data = await loginUser(credentials);
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("company", data.company);
        localStorage.setItem("email", data.email);
        // localStorage.setItem("email", data.email);
        setUserData(data);
        await router.navigate({
          to: search?.redirect ?? "/",
          replace: true,
        });
      } else {
        throw new Error("La respuesta del servidor no es válida.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error desconocido.";

      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: errorMessage,
        confirmButtonText: "Entendido",
      });
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        email: f.email?.[0],
        password: f.password?.[0],
      });
      setLoading(false);
      return;
    }

    handleLogin({
      email: parsed.data.email,
      password: parsed.data.password,
    }).finally(() => setLoading(false));
  }

  const onChange =
    (name: keyof Login) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [name]: value as any }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="relative hidden lg:flex flex-1 min-h-screen items-center justify-center overflow-hidden">
        <img
          src={loginSrc}
          alt="Logo"
          className="absolute inset-0 z-0 h-full w-full "
          draggable={false}
        />
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-indigo-100/30 to-transparent" />
        <div className="absolute -top-20 -right-24 z-10 h-[28rem] w-[28rem] rounded-full bg-blue-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 z-10 h-[26rem] w-[26rem] rounded-full bg-indigo-200/50 blur-3xl pointer-events-none" />
      </div>

      {/* Lado del formulario */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Logo"
                className="h-10 w-auto rounded-md bg-white"
                draggable={false}
              />
              <div>
                <CardTitle className="text-2xl tracking-tight">
                  Iniciar sesión
                </CardTitle>
                <CardDescription>
                  Bienvenido de vuelta. Ingresa tus credenciales.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form noValidate onSubmit={onSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@dominio.com"
                    className="pl-9"
                    autoComplete="email"
                    value={form.email}
                    onChange={onChange("email")}
                    aria-invalid={Boolean(errors.email) || undefined}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={onChange("password")}
                    aria-invalid={Boolean(errors.password) || undefined}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Opciones */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox
                    checked={!!form.remember}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, remember: Boolean(v) }))
                    }
                  />
                  Recuérdame
                </label>

                {/* 👇 antes era <a href="#">... */}
                <button
                  type="button"
                  onClick={() => setOpenRecover(true)}
                  className="text-sm font-medium text-[#0B61E0] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón */}
              <Button
                type="submit"
                className="w-full bg-[#0B61E0] hover:bg-[#0A56C7]"
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <p className="text-center text-sm text-slate-600">
              ¿No tienes cuenta?{" "}
              <a
                href="#"
                className="font-medium text-[#0B61E0] hover:underline"
              >
                Crear una cuenta
              </a>
            </p>
            <p className="text-center text-xs text-slate-400">
              Al continuar aceptas nuestros Términos y Política de Privacidad.
            </p>
          </CardFooter>
        </Card>
      </div>
      {openRecover && (
        <RecoverPasswordModal
          open={openRecover}
          onClose={() => setOpenRecover(false)}
          initialEmail={form.email}
        />
      )}
    </div>
  );
}
