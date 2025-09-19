import * as React from "react";
import { Users, CarFront, Wrench, FileWarning } from "lucide-react";
import type { Stat } from "@/core/types/stat";
import { getDashboardAccount } from "@/infrastructure/adapters/api/service/dashboard/dashboard.service";

function StatCard({ label, value, icon, accent }: Stat) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">{label}</span>
        <span
          className={`h-8 w-8 grid place-items-center rounded-lg ${
            accent ?? "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">
        {value.toLocaleString("es-EC")}
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200" />
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<Stat[]>([
    {
      label: "Total Clientes",
      value: 0,
      icon: <Users className="h-5 w-5" />,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Vehículos Activos",
      value: 0,
      icon: <CarFront className="h-5 w-5" />,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Servicios (Mes)",
      value: 0,
      icon: <Wrench className="h-5 w-5" />,
      accent: "bg-teal-50 text-teal-600",
    },
    {
      label: "Documentos por Vencer",
      value: 0,
      icon: <FileWarning className="h-5 w-5" />,
      accent: "bg-rose-50 text-rose-600",
    },
  ]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardAccount();
        setStats((prev) => [
          { ...prev[0], value: data.totalcustomer ?? 0 },
          { ...prev[1], value: data.totalvehicle ?? 0 },
          { ...prev[2], value: data.serviceTotal ?? 0 },
          { ...prev[3], value: data.documentExpired ?? 0 },
        ]);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-0">
      {/* Métricas */}
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Actividad reciente (placeholder) */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Actividad Reciente
        </h2>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Gráfico de actividad reciente
        </div>
      </div>
    </div>
  );
}
