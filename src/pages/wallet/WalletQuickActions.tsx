import { Link } from "react-router";

const QUICK_ACTIONS = [
  {
    to: "/operations/buy-sell?mode=buy",
    label: "Añadir",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/operations/buy-sell?mode=sell",
    label: "Enviar",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: "/operations/convert",
    label: "Convertir",
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M7 7h11l-3-3M17 17H6l3 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export function WalletQuickActions() {
  return (
    <section aria-label="Acciones rápidas">
      <div className="grid grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-auria-forest px-3 py-4 text-white shadow-sm transition hover:bg-auria-forest-hover active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <span aria-hidden="true" className="text-white">
              {action.icon}
            </span>
            <span className="text-sm font-medium tracking-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
