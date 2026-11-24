import { Link } from "react-router";

const QUICK_ACTIONS = [
  { to: "/operations/buy-sell", label: "Comprar", description: "Sumá USD o EUR" },
  { to: "/operations/buy-sell", label: "Vender", description: "Recibí ARS" },
  { to: "/operations/convert", label: "Convertir", description: "Entre tus monedas" },
] as const;

export function WalletQuickActions() {
  return (
    <section aria-labelledby="actions-heading" className="space-y-3">
      <div>
        <h2 id="actions-heading" className="text-lg font-semibold text-auria-ink">
          Operaciones
        </h2>
        <p className="mt-1 text-sm text-auria-muted">
          Elegí qué querés hacer con tu billetera.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-auria-border bg-auria-card px-4 py-3 text-auria-ink transition hover:border-auria-forest/30 hover:bg-auria-lime-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <span>
              <span className="block text-sm font-semibold">{action.label}</span>
              <span className="mt-0.5 block text-xs text-auria-muted">
                {action.description}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-lg text-auria-forest transition group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        ))}
      </div>

      <Link
        to="/transactions"
        className="inline-flex min-h-10 items-center text-sm font-semibold text-auria-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
      >
        Ver actividad reciente
      </Link>
    </section>
  );
}
