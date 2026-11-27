import { NavLink } from "react-router";

const NAV_ITEMS = [
  { to: "/wallet", label: "Inicio", icon: "⌂" },
  { to: "/transactions", label: "Actividad", icon: "☰" },
  { to: "/operations/buy-sell", label: "Operaciones", icon: "⇄" },
  { to: "/profile", label: "Perfil", icon: "◔" },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-4 border-t border-auria-border bg-auria-card px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-xs transition ${
              isActive
                ? "font-bold text-auria-forest"
                : "font-medium text-auria-muted hover:text-auria-ink"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                aria-hidden="true"
                className={`text-base leading-none transition ${
                  isActive
                    ? "rounded-full bg-auria-lime-soft px-3 py-0.5"
                    : "px-3 py-0.5"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
