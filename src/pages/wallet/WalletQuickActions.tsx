import { Link } from "react-router";

interface QuickActionItem {
  label: string;
  to: string;
  icon: "add" | "send" | "convert";
}

interface WalletQuickActionsProps {
  embeddedInHero?: boolean;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { label: "Añadir", to: "/operations/add", icon: "add" },
  { label: "Enviar", to: "/operations/send", icon: "send" },
  { label: "Convertir", to: "/operations/convert", icon: "convert" },
];

function ActionIcon({ icon }: { icon: QuickActionItem["icon"] }) {
  if (icon === "add") {
    return (
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "send") {
    return (
      <svg
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

export function WalletQuickActions({
  embeddedInHero = false,
}: WalletQuickActionsProps) {
  return (
    <nav aria-label="Acciones rápidas">
      <ul
        className={`grid grid-cols-3 gap-2.5 ${
          embeddedInHero
            ? "lg:flex lg:max-w-[calc(100%-10.5rem)] lg:items-center lg:justify-start lg:gap-2.5"
            : "lg:gap-3"
        }`}
      >
        {QUICK_ACTIONS.map((action) => (
          <li
            key={action.label}
            className={`min-w-0 ${embeddedInHero ? "lg:flex-1" : ""}`}
          >
            <Link
              to={action.to}
              className={`flex min-h-19 w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-center no-underline transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                embeddedInHero
                  ? "bg-auria-forest text-white shadow-xs hover:bg-auria-forest/90 focus-visible:outline-auria-lime lg:min-h-9 lg:w-full lg:flex-row lg:gap-1.5 lg:rounded-full lg:border lg:border-auria-lime/35 lg:bg-white/10 lg:px-4 lg:py-1.5 lg:text-white lg:shadow-none lg:hover:border-auria-lime lg:hover:bg-auria-lime lg:hover:text-auria-forest"
                  : "bg-auria-forest text-white shadow-sm hover:bg-auria-forest/90 focus-visible:outline-auria-forest lg:min-h-11 lg:flex-row lg:gap-2 lg:py-2.5"
              }`}
            >
              <ActionIcon icon={action.icon} />
              <span className="text-xs font-semibold tracking-tight lg:text-xs">
                {action.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
