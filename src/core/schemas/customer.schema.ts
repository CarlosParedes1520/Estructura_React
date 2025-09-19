import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/, "Solo letras y espacios."),
  last_name: z
    .string()
    .trim()
    .min(1, "El apellido es requerido.")
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/, "Solo letras y espacios."),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
  phone: z
    .string() // 1. Recibimos un string del input del formulario.
    .optional()
    .refine(
      (val) => {
        // 2. Si el string existe, validamos que solo contenga dígitos.
        if (!val) return true; // Si es opcional y no está, es válido.
        return /^\d+$/.test(val);
      },
      {
        message: "El teléfono solo puede contener números.",
      }
    )
    .transform((val) => {
      // 3. Si es un string de dígitos válido (o no existe), lo transformamos.
      return val ? Number(val) : undefined;
    }),
  plan: z.enum(["basic", "premium"]),
  status: z.enum(["active", "suspended"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
