import * as React from "react";
import {
  Link,
  useMatches,
  useRouterState,
  useRouter,
} from "@tanstack/react-router";
import { User, LogOut, Menu, ChevronDown } from "lucide-react";
import { getMyUserImageURL } from "@/core/helpers/getUserImageURL";
import { profileUpdater } from "@/core/helpers/profileEvent";

function slugToTitle(slug: string): string {
  if (slug === "/" || slug === "") return "Dashboard";
  const clean = slug.replace(/^\//, "").split("/")[0];
  return clean.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type HeaderProps = {
  onMobileMenuToggle: () => void;
};

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return {};
    const obj = JSON.parse(raw);
    const data = obj?.data ?? obj ?? {};
    return {
      name: data?.name as string | undefined,
      last_name: data?.last_name as string | undefined,
      email: data?.email as string | undefined,
      role: data?.role as string | undefined,
    };
  } catch {
    return {};
  }
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const matches = useMatches();
  const { location } = useRouterState();
  const router = useRouter();

  const routeTitle =
    (matches[matches.length - 1]?.staticData as { title?: string } | undefined)
      ?.title ?? slugToTitle(location.pathname);

  const [openMenu, setOpenMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const [userName, setUserName] = React.useState("Admin");
  const [userRole, setUserRole] = React.useState<string>("—");
  const [initial, setInitial] = React.useState<string>("A");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  const loadAvatar = React.useCallback(async () => {
    let objectUrl: string | null = null;
    try {
      const url = await getMyUserImageURL();
      objectUrl = url; // Guardamos la URL para poder revocarla después
      setAvatarUrl(url);
    } catch {
      setAvatarUrl(null);
    }
    // Devolvemos la URL para la limpieza en el useEffect
    return objectUrl;
  }, []);

  React.useEffect(() => {
    // Carga inicial de datos de usuario y avatar
    const { name, last_name, email, role } = readUserFromStorage();
    const displayName =
      [name?.trim(), last_name?.trim()].filter(Boolean).join(" ") ||
      email?.split("@")[0] ||
      "Admin";
    setUserName(displayName);
    setUserRole(role ?? "—");
    setInitial((displayName.trim().charAt(0) || "A").toUpperCase());

    let objectUrl: string | null = null;
    loadAvatar().then((url) => {
      objectUrl = url;
    });

    // 3. Nos suscribimos al evento de actualización del perfil
    const unsubscribe = profileUpdater.subscribe(() => {
      console.log(
        "[Header] Recibida notificación de perfil actualizado. Recargando avatar..."
      );
      // Cuando recibimos la notificación, volvemos a cargar el avatar
      if (objectUrl) URL.revokeObjectURL(objectUrl); // Limpiamos la URL vieja
      loadAvatar().then((url) => {
        objectUrl = url;
      });
    });

    // 4. Limpieza: dejamos de escuchar y revocamos la URL cuando el componente se desmonta
    return () => {
      unsubscribe();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loadAvatar]);

  const signOut = async () => {
    setOpenMenu(false); //! eliminar los que faltan
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("user_data");
    await router.navigate({ to: "/login", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="md:hidden text-slate-600 hover:text-slate-900"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
            {routeTitle}
          </h1>
        </div>

        <div className="relative flex items-center gap-2" ref={menuRef}>
          {/* --- BOTÓN DE AVATAR --- */}
          <button
            type="button"
            onClick={() => setOpenMenu((v) => !v)}
            className="relative h-10 w-10 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-haspopup="menu"
            aria-expanded={openMenu}
          >
            {/* Contenido del Avatar (Imagen o Inicial) */}
            <div className="h-full w-full rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            {/* Overlay de la Flecha */}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0B61E0] ring-2 ring-white hover:bg-slate-900">
              <ChevronDown
                className={`h-2.5 w-2.5 text-white transition-transform duration-200 ${
                  openMenu ? "rotate-180" : ""
                }`}
                strokeWidth={3}
              />
            </div>
          </button>

          {/* Dropdown (sin cambios) */}
          <div
            role="menu"
            className={`absolute right-0 top-full mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-lg p-1
                        transition-all duration-200 ease-in-out
                        ${openMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-900 truncate">
                {userName}
              </p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 truncate">
                {userRole}
              </p>
            </div>
            <div className="my-1 border-t border-slate-100" />
            {/* <Link
              to="/profile"
              onClick={() => setOpenMenu(false)}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
              role="menuitem"
            >
              <User className="h-4 w-4" /> Perfil
            </Link> */}
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
