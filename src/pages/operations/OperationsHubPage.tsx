import { Link } from "react-router";
import { Card } from "@/components/ui";

interface OperationOption {
  id: "add" | "send" | "convert";
  title: string;
  description: string;
  to: string;
  badge: string;
  accentClass: string;
  icon: string;
}

const OPERATION_OPTIONS: OperationOption[] = [
  {
    id: "add",
    title: "Añadir dinero",
    description: "Ingresá saldo a tu billetera en ARS, USD o EUR.",
    to: "/operations/add",
    badge: "Ingreso",
    accentClass: "bg-auria-lime/40 text-auria-forest",
    icon: "+",
  },
  {
    id: "send",
    title: "Enviar dinero",
    description: "Transferí saldo a otra cuenta o contacto de forma rápida.",
    to: "/operations/send",
    badge: "Envío",
    accentClass: "bg-auria-forest text-auria-lime",
    icon: "↗",
  },
  {
    id: "convert",
    title: "Convertir dinero",
    description: "Cambiá entre monedas al instante con cotización visible.",
    to: "/operations/convert",
    badge: "Conversión",
    accentClass: "bg-auria-cream text-auria-ink",
    icon: "⇄",
  },
];

export function OperationsHubPage() {
  return (
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2">
      <section aria-labelledby="operations-heading" className="space-y-1">
        <h1
          id="operations-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink"
        >
          Operaciones
        </h1>
        <p className="text-xs text-auria-muted">
          Elegí qué movimiento querés realizar en AuriaWallet.
        </p>
      </section>

      <section
        aria-label="Tipos de operación disponibles"
        className="space-y-3"
      >
        {OPERATION_OPTIONS.map((option) => (
          <Link
            key={option.id}
            to={option.to}
            className="block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <Card className="flex items-center justify-between gap-3.5 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-2xs transition hover:border-auria-forest/40 hover:bg-white">
              <div className="flex min-w-0 items-center gap-3.5">
                <span
                  aria-hidden="true"
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${option.accentClass}`}
                >
                  {option.icon}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold text-auria-ink">
                      {option.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-auria-cream px-2.5 py-0.5 text-[11px] font-semibold text-auria-muted">
                      {option.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-auria-muted">
                    {option.description}
                  </p>
                </div>
              </div>

              <span
                aria-hidden="true"
                className="shrink-0 text-lg font-bold text-auria-ink"
              >
                ›
              </span>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
