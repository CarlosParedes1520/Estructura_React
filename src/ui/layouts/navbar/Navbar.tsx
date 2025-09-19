// src/components/navbar/Navbar.tsx

import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users2,
  CarFront,
  Wrench,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import { useOnClickOutside } from "@/application/hooks/useOnClickOutside";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  matchPrefix?: boolean;
};

const NAV_ITEMS: Item[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, matchPrefix: false },
  {
    label: "Gestión de Clientes",
    to: "/customers",
    icon: Users2,
    matchPrefix: true,
  },
  // {
  //   label: "Gestión de Vehículos",
  //   to: "/vehicles",
  //   icon: CarFront,
  //   matchPrefix: true,
  // },
  // { label: "Servicios", to: "/services", icon: Wrench, matchPrefix: true },
  // { label: "Gestión de Planes", to: "/plans", icon: Layers, matchPrefix: true },
  // {
  //   label: "Gestión Documental",
  //   to: "/documents",
  //   icon: FileText,
  //   matchPrefix: true,
  // },
];

const NavItem = ({ item, collapsed }: { item: Item; collapsed: boolean }) => {
  const Icon = item.icon;
  const linkClasses =
    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[status=active]:bg-blue-50 data-[status=active]:text-blue-600";

  const content = (
    <Link
      to={item.to}
      activeOptions={{ exact: !item.matchPrefix }}
      className={linkClasses}
      activeProps={{ "data-status": "active" }}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" align="center">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

type NavbarProps = {
  isMobileMenuOpen: boolean;
  onClose: () => void;
};

export default function Navbar({ isMobileMenuOpen, onClose }: NavbarProps) {
  const logoSrc = `${import.meta.env.BASE_URL}logo/logo.png`;

  // Detectar si es teléfono (md < 768px)
  const isMobileNow = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  // Estado 'collapsed' inicial:
  // - En teléfonos: siempre FALSE (mostrar texto), ignorando localStorage= "true".
  // - En desktop: usa localStorage si existe, si no, false.
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      const mobile = isMobileNow();
      if (mobile) return false;
      const raw = localStorage.getItem("sidebar:collapsed");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });

  // Guardar cambios en localStorage (solo tiene efecto real en desktop)
  React.useEffect(() => {
    try {
      localStorage.setItem("sidebar:collapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  // Reaccionar a cambios de tamaño: si pasa a móvil, forzar FALSE
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        // Ahora es móvil => forzar labels visibles
        setCollapsed(false);
      } else {
        // De vuelta a desktop => respetar lo que haya en localStorage
        try {
          const raw = localStorage.getItem("sidebar:collapsed");
          setCollapsed(raw ? JSON.parse(raw) : false);
        } catch {
          setCollapsed(false);
        }
      }
    };
    // Setea una vez por si ya es móvil al montar
    if (mql.matches) setCollapsed(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const navRef = React.useRef<HTMLElement>(null);
  // useOnClickOutside(navRef, onClose);

  // Ancho en desktop; en móvil usamos overlay ancho fijo
  const desktopWidth = collapsed ? "md:w-20" : "md:w-64";

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        ref={navRef}
        className={[
          // móvil (overlay)
          "fixed inset-y-0 left-0 z-50",
          "flex flex-col w-64 shrink-0",
          "bg-white border-r border-slate-200 text-slate-900",
          "transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",

          // desktop
          "md:relative md:translate-x-0 md:transition-[width]",
          desktopWidth,
        ].join(" ")}
      >
        {/* Cabecera (más alta en móvil para logo más grande) */}
        <div className="relative h-20 md:h-20 lg:h-24 px-3 flex items-center justify-center shrink-0 transition-colors bg-[#0B61E0]">
          {collapsed ? (
            <CarFront className="h-8 w-8 md:h-9 md:w-9 text-white" />
          ) : (
            <img
              src={logoSrc}
              alt="Logo"
              className="h-16 md:h-30 lg:h-30 w-auto object-contain"
              draggable={false}
            />
          )}

          {/* Botón cerrar (solo móvil) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="absolute right-2 top-2 md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Botón colapsar/expandir (solo desktop) */}
        <div className="hidden md:block absolute top-5 -right-4 z-20">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="h-8 w-8 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
