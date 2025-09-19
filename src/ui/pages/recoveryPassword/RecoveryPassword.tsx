import * as React from "react";
import { X, Mail, Info, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import {
  changePassword,
  generatePasswordKey,
} from "@/infrastructure/adapters/api/service/recoveryPassword/recoveryPassword.service";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type Props = {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
};

const Panel: React.FC<
  React.PropsWithChildren<{ title: string; onClose: () => void }>
> = ({ title, onClose, children }) => (
  <div
    className="w-full max-w-sm rounded-2xl bg-white shadow-2xl"
    onMouseDown={(e) => e.stopPropagation()}
  >
    <div className="flex items-center justify-between border-b border-slate-200 p-5">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <button
        onClick={onClose}
        className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function RecoverPasswordModal({
  open,
  onClose,
  // initialEmail,
}: Props) {
  const [step, setStep] = React.useState<"request" | "confirm">("request");

  // Paso 1
  const [email, setEmail] = React.useState("");
  // Paso 2
  const [temporaryKey, setTemporaryKey] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    // Reset al abrir
    setStep("request");
    setEmail("");
    setTemporaryKey("");
    setPassword("");
    setConfirmPassword("");
    setShowNew(false);
    setShowConfirm(false);
    setErrorMsg(null);
    setOkMsg(null);
  }, [open]);

  if (!open) return null;

  /* ============ Handlers ============ */

  // Paso 1: pide código/clave temporal usando TU servicio GET
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOkMsg(null);

    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk) {
      setErrorMsg("Ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      const res = await generatePasswordKey(email);
      // Esperado: { code: 200, message: "...", data: null }
      if (res.code === 200) {
        setOkMsg(res.message ?? "Te enviamos una clave temporal a tu correo.");
        setTemporaryKey("");
        setPassword("");
        setConfirmPassword("");
        setStep("confirm");
      } else {
        throw new Error(res.message || "No pudimos iniciar la recuperación.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "No pudimos enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: cambia contraseña usando TU servicio POST
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOkMsg(null);

    if (!temporaryKey.trim()) return setErrorMsg("Ingresa el código temporal.");
    if (password.length < 6)
      return setErrorMsg(
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
    if (password !== confirmPassword)
      return setErrorMsg("Las contraseñas no coinciden.");

    try {
      setLoading(true);
      const res = await changePassword({
        temporaryKey,
        password,
        confirmPassword,
      });

      if (res.code === 200) {
        // 1) cierra el modal
        onClose();

        // 2) muestra el mensaje del backend
        // (pequeño delay para evitar solaparse con el fade del modal)
        setTimeout(() => {
          Swal.fire({
            icon: "success",
            title: "Contraseña actualizada",
            text: res.message ?? "La contraseña se cambió correctamente.",
            confirmButtonText: "Entendido",
          });
        }, 60);

        // (opcional) limpia estados
        setTemporaryKey("");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      throw new Error(res.message || "No se pudo cambiar la contraseña.");
    } catch (err: any) {
      setErrorMsg(err?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      {step === "request" ? (
        <Panel title="Recuperar Contraseña" onClose={onClose}>
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Te enviaremos una contraseña temporal a tu correo. Úsala para
            ingresar y cámbiala después en tu perfil.
          </div>

          <form onSubmit={handleRequest} noValidate>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="w-full border-0 p-0 text-sm focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {errorMsg && (
              <p className="mb-3 text-xs text-rose-600">{errorMsg}</p>
            )}
            {okMsg && <p className="mb-3 text-xs text-emerald-600">{okMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Recuperar contraseña"}
            </button>
          </form>
        </Panel>
      ) : (
        <Panel title="Cambiar contraseña" onClose={onClose}>
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 flex gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Ingresa el código temporal que te enviamos y define tu nueva
            contraseña.
          </div>

          <form
            onSubmit={handleConfirm}
            noValidate
            autoComplete="off"
            className="space-y-3"
            key={step}
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Código temporal
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  name="one_time_code" // 👈 nombre no típico de email/pass
                  placeholder="Ej: 482931"
                  className="w-full border-0 p-0 text-sm focus:outline-none"
                  inputMode="numeric"
                  autoComplete="one-time-code" // 👈 sugiere OTP, evita email
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={temporaryKey} // 👈 solo value (sin defaultValue)
                  onChange={(e) => setTemporaryKey(e.target.value)}
                />
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nueva contraseña
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type={showNew ? "text" : "password"}
                  name="new_password" // 👈 nombre explícito
                  placeholder="••••••••"
                  className="w-full border-0 p-0 text-sm focus:outline-none"
                  autoComplete="new-password" // 👈 evita contraseña guardada
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-slate-500"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                <Lock className="h-4 w-4 text-slate-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm_new_password" // 👈 nombre distinto
                  placeholder="••••••••"
                  className="w-full border-0 p-0 text-sm focus:outline-none"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="text-slate-500"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Mostrar/ocultar confirmación"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
            {okMsg && <p className="text-xs text-emerald-600">{okMsg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </Panel>
      )}
    </div>
  );
}
