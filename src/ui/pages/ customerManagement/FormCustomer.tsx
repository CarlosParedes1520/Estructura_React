import * as React from "react";
import { X } from "lucide-react";
import type { Customer } from "@/core/types/customer";
import { customerSchema } from "@/core/schemas/customer.schema";
import type { CreateCustomerPayload } from "@/infrastructure/adapters/api/customer/domain/customer";

export interface FormCustomerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerPayload) => Promise<void>; // 👈 payload del dominio
  initialValues?: Customer;
  title?: string;
}

export function FormCustomer({
  open,
  onClose,
  onSubmit,
  initialValues,
  title = "Crear / Editar Cliente",
}: FormCustomerProps) {
  const defaults = {
    name: "",
    last_name: "",
    email: "",
    phone: "", // 👈 string, para coincidir con CreateCustomerPayload
    plan: "basic" as Customer["plan"],
    status: "active" as Customer["status"],
  };

  const [values, setValues] = React.useState(defaults);
  const [errors, setErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const [, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setValues({
      name: initialValues?.name ?? defaults.name,
      last_name: initialValues?.last_name ?? defaults.last_name,
      email: initialValues?.email ?? defaults.email,
      phone: initialValues?.phone?.toString() ?? defaults.phone,
      plan: initialValues?.plan ?? defaults.plan,
      status: initialValues?.status ?? defaults.status,
    });
    setErrors({});
  }, [open, initialValues]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const candidate: CreateCustomerPayload = {
      name: values.name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone, // 👈 string
    };

    const parsed = customerSchema.safeParse({
      ...candidate,
      plan: values.plan,
      status: values.status,
    });

    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        name: f.name?.[0],
        last_name: f.last_name?.[0],
        email: f.email?.[0],
        phone: f.phone?.[0],
        plan: f.plan?.[0],
        status: f.status?.[0],
      });
      return;
    }

    try {
      setSubmitting(true);
      // 👇 pasa el payload validado (CreateCustomerPayload)
      await onSubmit(candidate);
    } catch (error) {
      console.error("[FormCustomer] Error al guardar cliente:", error);
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40"
      onMouseDown={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Ej: Juan"
                value={values.name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, name: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            {/* Apellido */}
            <div>
              <label
                htmlFor="last_name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Apellido
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="Ej: Pérez"
                value={values.last_name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, last_name: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-rose-600">{errors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Ej: juan.perez@email.com"
                value={values.email}
                onChange={(e) =>
                  setValues((v) => ({ ...v, email: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Ej: 998050443"
                value={values.phone}
                onChange={(e) =>
                  setValues((v) => ({ ...v, phone: e.target.value }))
                }
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            {/* Plan / Estado (si tu schema lo valida, lo dejamos) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Plan
                </label>
                <select
                  value={values.plan}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      plan: e.target.value as Customer["plan"],
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
                >
                  <option value="basic">Plan Básico</option>
                  <option value="premium">Plan Premium</option>
                </select>
                {errors.plan && (
                  <p className="mt-1 text-xs text-rose-600">{errors.plan}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={values.status}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      status: e.target.value as Customer["status"],
                    }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#0B61E0] focus:outline-none focus:ring-2 focus:ring-[#0B61E0]/30"
                >
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-rose-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[#0B61E0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0A56C7]"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
