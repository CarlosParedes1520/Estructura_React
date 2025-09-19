import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
// 1. Importa el plugin de TanStack Router
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  // 2. Añade el plugin a tu lista de plugins
  plugins: [react(), tailwindcss(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
