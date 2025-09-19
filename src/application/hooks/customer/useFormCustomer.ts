import * as React from "react";
import type { Customer } from "@/core/types/customer";
import { customerSchema } from "@/core/schemas/customer.schema";

export interface FormCustomerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => Promise<void>;
  initialValues?: Partial<Customer>;
  title?: string;
}

export function useFormCustomer({
  open,
  //   onClose,
  onSubmit,
  initialValues,
}: FormCustomerProps) {
  // 1. TODA LA LÓGICA DE ESTADO SE MUEVE AQUÍ
  const defaults = {
    name: "",
    last_name: "",
    email: "",
    phone: "",
    plan: "basic" as Customer["plan"],
    status: "active" as Customer["status"],
  };

  const [values, setValues] = React.useState(defaults);
  const [errors, setErrors] = React.useState<
    Record<string, string[] | undefined>
  >({});
  
  const [isSubmitting, setSubmitting] = React.useState(false);

  // 2. EL USEEFFECT PARA INICIALIZAR EL FORMULARIO SE MUEVE AQUÍ
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

  // 3. TODOS LOS MANEJADORES DE EVENTOS SE MUEVEN Y GENERALIZAN AQUÍ

  // Un manejador genérico para todos los inputs y selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Limpia el error del campo que está siendo modificado
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const candidate = {
      ...values,
      name: values.name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim().toLowerCase(),
    };

    const parsed = customerSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(parsed.data as unknown as Customer);
    } catch (error) {
      console.error("[useFormCustomer] Error al guardar cliente:", error);
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. EL HOOK DEVUELVE TODO LO QUE EL COMPONENTE DE UI NECESITA
  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
