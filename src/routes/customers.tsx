import CustomerManagement from "@/ui/pages/ customerManagement/CustomerManagement";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/customers")({
  staticData: { title: "Gestión de Clientes" },
  component: CustomerManagement,
});
