import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

type SidebarIconName = "home" | "activity" | "operations" | "account";

const DESKTOP_SIDEBAR_ITEMS: {
  to: string;
  label: string;
  icon: SidebarIconName;
}[] = [
  { to: "/profile", label: "Mi Cuenta", icon: "account" },
  { to: "/wallet", label: "Inicio", icon: "home" },
  { to: "/transactions", label: "Actividad", icon: "activity" },
  { to: "/operations", label: "Operaciones", icon: "operations" },
];

const MOBILE_BOTTOM_ITEMS: {
  to: string;
  label: string;
  icon: SidebarIconName;
}[] = [
  { to: "/wallet", label: "Inicio", icon: "home" },
  { to: "/transactions", label: "Actividad", icon: "activity" },
  { to: "/operations", label: "Operaciones", icon: "operations" },
  { to: "/profile", label: "Mi Cuenta", icon: "account" },
];

function isNavItemActive(
  itemTo: string,
  currentPathname: string,
  navLinkIsActive: boolean,
): boolean {
  if (navLinkIsActive) return true;
  if (itemTo === "/operations") {
    return currentPathname.startsWith("/operations");
  }
  return false;
}

function NavIcon({
  icon,
  className = "h-4 w-4 shrink-0",
}: {
  icon: SidebarIconName;
  className?: string;
}) {
  if (icon === "home") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <path
          d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "activity") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <path
          d="M4 6h16M4 12h16M4 18h10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (icon === "operations") {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <path
          d="M7 8h10m0 0-3-3m3 3-3 3M17 16H7m0 0 3-3m-3 3 3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name?: string): string {
  if (!name) return "AW";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function NotificationBell({
  hasUnreadNotifications,
  className = "",
}: {
  hasUnreadNotifications: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Notificaciones"
      className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-auria-ink transition hover:bg-auria-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest ${className}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 0 1-6 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasUnreadNotifications && (
        <span
          aria-hidden="true"
          className="absolute top-2 right-2 h-2 w-2 rounded-full bg-auria-forest"
        />
      )}
    </button>
  );
}

function AssistantButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Asistente AuriaWallet"
      title="Asistente AuriaWallet"
      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-auria-lime text-auria-forest shadow-md transition hover:scale-105 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest ${className}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    </button>
  );
}

export function DesktopTopBar() {
  const { user } = useAuth();
  const [hasUnreadNotifications] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user?.name);
  const firstName =
    user?.name?.trim().split(/\s+/)[0]?.toUpperCase() || "PERFIL";
  const fullName = user?.name?.trim().toUpperCase() || "USUARIO AURIA";
  const email = user?.email || "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <div className="hidden shrink-0 items-center justify-end gap-2.5 px-6 pt-3 pb-1 lg:flex">
      <div
        ref={profileMenuRef}
        className="relative flex items-center rounded-full border border-auria-border bg-auria-card p-1 shadow-xs"
      >
        <NotificationBell hasUnreadNotifications={hasUnreadNotifications} />

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-auria-border" />

        <button
          type="button"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          aria-expanded={isProfileMenuOpen}
          aria-haspopup="menu"
          className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-auria-ink transition hover:bg-auria-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-auria-border bg-auria-page text-xs font-bold text-auria-forest">
            {initials}
          </span>
          <span className="text-xs font-bold tracking-wide">{firstName}</span>
          <svg
            className={`h-3.5 w-3.5 text-auria-muted transition-transform ${
              isProfileMenuOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="m6 9 6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isProfileMenuOpen && (
          <div
            role="menu"
            className="absolute top-full right-0 z-30 mt-2 w-72 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-xl"
          >
            <div className="flex items-center gap-3 pb-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-auria-border bg-auria-page text-sm font-bold text-auria-forest">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-auria-ink">
                  {fullName}
                </p>
                {email && (
                  <p className="truncate text-xs text-auria-muted">{email}</p>
                )}
              </div>
            </div>

            <div className="my-1 border-t border-auria-border" />

            <div className="space-y-1 pt-1">
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-auria-ink no-underline transition hover:bg-auria-page"
              >
                <svg
                  className="h-4 w-4 text-auria-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                </svg>
                <span>Configurar perfil</span>
              </Link>

              <Link
                to="/profile#faq"
                role="menuitem"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-auria-ink no-underline transition hover:bg-auria-page"
              >
                <svg
                  className="h-4 w-4 text-auria-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                <span>Preguntas frecuentes</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <AssistantButton className="h-10 w-10" />
    </div>
  );
}

export function Navbar() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hasUnreadNotifications] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Header mobile (< lg) */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-auria-cream px-5 pt-4 pb-2 lg:hidden">
        <Link
          to="/wallet"
          className="inline-flex items-center gap-3 text-auria-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          aria-label="AuriaWallet Inicio"
        >
          <span className="inline-flex items-center gap-2" aria-hidden="true">
            <i className="block h-8 w-3 -skew-x-18 rounded-xs bg-auria-lime" />
            <i className="block h-8 w-3 -skew-x-18 rounded-xs bg-auria-lime" />
          </span>
          <span className="font-display text-[28px] leading-none tracking-tight">
            <strong className="font-bold">Auria</strong>
            <span className="font-normal">Wallet</span>
          </span>
        </Link>

        <NotificationBell
          hasUnreadNotifications={hasUnreadNotifications}
          className="h-10 w-10 translate-y-0.5"
        />
      </header>

      {/* Botón flotante de asistente en móvil (< lg) */}
      <AssistantButton className="fixed right-5 bottom-20 z-20 lg:hidden" />

      {/* Barra de navegación inferior en móvil (< lg) */}
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-auria-border bg-auria-card px-2 py-1.5 shadow-sm lg:hidden"
      >
        {MOBILE_BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              const active = isNavItemActive(item.to, pathname, isActive);
              return `flex flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] no-underline transition ${
                active
                  ? "font-bold text-auria-forest"
                  : "font-medium text-auria-muted hover:text-auria-ink"
              }`;
            }}
          >
            {({ isActive }) => {
              const active = isNavItemActive(item.to, pathname, isActive);
              return (
                <>
                  <span
                    className={`flex h-7 w-11 items-center justify-center rounded-full transition ${
                      active ? "bg-auria-lime-soft text-auria-forest" : ""
                    }`}
                  >
                    <NavIcon icon={item.icon} className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="leading-none">{item.label}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar izquierdo desktop (lg:) */}
      <aside
        aria-label="Barra lateral de navegación"
        className="hidden shrink-0 flex-col justify-between border-r border-auria-border bg-auria-card px-4 py-5 lg:flex lg:w-60"
      >
        <div className="space-y-6">
          <Link
            to="/wallet"
            className="inline-flex items-center gap-3 px-2 text-auria-ink no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
            aria-label="AuriaWallet Inicio"
          >
            <span className="inline-flex items-center gap-2" aria-hidden="true">
              <i className="block h-7 w-2.5 -skew-x-18 rounded-xs bg-auria-lime" />
              <i className="block h-7 w-2.5 -skew-x-18 rounded-xs bg-auria-lime" />
            </span>
            <span className="font-display text-[24px] leading-none tracking-tight">
              <strong className="font-bold">Auria</strong>
              <span className="font-normal">Wallet</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="space-y-1.5">
            {DESKTOP_SIDEBAR_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const active = isNavItemActive(item.to, pathname, isActive);
                  return `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition ${
                    active
                      ? "bg-auria-lime-soft font-bold text-auria-forest"
                      : "font-medium text-auria-muted hover:bg-auria-page hover:text-auria-ink"
                  }`;
                }}
              >
                <NavIcon icon={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-auria-border pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-auria-muted transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
