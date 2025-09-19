import {
  Outlet,
  createRootRouteWithContext,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import Layout from "@/ui/layouts/Layout";

function Shell() {
  // Para saber qué ruta está activa y ocultar el shell en /login
  const { matches } = useRouterState();
  const isLogin = matches.some((m) => m.routeId === "/login");

  // /login → sin Layout (solo Outlet)
  if (isLogin) return <Outlet />;

  // Resto → con Layout (el Layout ya hace <Outlet/> adentro)
  return <Layout />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Shell,

    beforeLoad: ({ location }) => {
      const token = localStorage.getItem("token");

      if (!token && location.pathname !== "/login") {
        throw redirect({
          to: "/login",
          search: { redirect: location.href }, 
        });
      }

      // Logueado y en /login → al dashboard
      if (token && location.pathname === "/login") {
        throw redirect({ to: "/" });
      }
    },
  }
);
