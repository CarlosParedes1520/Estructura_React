import Login from "@/ui/pages/auth/Login";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
 
  staticData: { hideChrome: true },
  component: Login,
});
