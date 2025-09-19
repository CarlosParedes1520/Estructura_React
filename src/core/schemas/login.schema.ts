import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El correo es requerido.")
    .email("Correo inválido."),
  password: z
    .string()
    .min(1, "La contraseña es requerida.")
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
