import { createFileRoute } from "@tanstack/react-router";
import CustomerManagement from "@/ui/pages/ customerManagement/CustomerManagement";

export const Route = createFileRoute("/")({
  staticData: { title: "Dashboard" },
  component: CustomerManagement,
});
