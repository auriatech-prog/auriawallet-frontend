import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Button, Card } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { CurrencyCode, WalletBalanceItem } from "@/types/wallet";
import { ExchangeRatesSection } from "../wallet/ExchangeRatesSection";

interface OperationOption {
  id: "add" | "send" | "convert";
  title: string;
  description: string;
  ctaLabel: string;
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
    ctaLabel: "Ingresar saldo",
    to: "/operations/add",
    badge: "Ingreso",
    accentClass: "bg-auria-lime/40 text-auria-forest",
    icon: "+",
  },
  {
    id: "send",
    title: "Enviar dinero",
    description: "Transferí saldo a otra cuenta o contacto de forma rápida.",
    ctaLabel: "Realizar envío",
    to: "/operations/send",
    badge: "Envío",
    accentClass: "bg-auria-forest text-auria-lime",
    icon: "↗",
  },
  {
    id: "convert",
    title: "Convertir dinero",
    description: "Cambiá entre monedas al instante con cotización visible.",
    ctaLabel: "Simular conversión",
    to: "/operations/convert",
    badge: "Conversión",
    accentClass: "bg-auria-cream text-auria-ink",
    icon: "⇄",
  },
];

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  ARS: "Peso argentino",
  USD: "Dólar",
  EUR: "Euro",
};

function getBalancesError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos cargar tus saldos disponibles.";
  }

  if (error.status === 0) {
    return "Sin conexión con el servidor. Revisá tu internet.";
  }

  if (error.status === 401) {
    return "Tu sesión expiró. Volvé a iniciar sesión.";
  }

  return error.message || "No pudimos cargar tus saldos disponibles.";
}

export function OperationsHubPage() {
  const [balances, setBalances] = useState<WalletBalanceItem[] | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [balancesError, setBalancesError] = useState<string | null>(null);
  const [areBalancesVisible, setAreBalancesVisible] = useState(true);

  const loadBalances = useCallback(async () => {
    setIsLoadingBalances(true);
    setBalancesError(null);

    try {
      const response = await walletService.getBalances();
      setBalances(response.balances);
    } catch (requestError) {
      setBalances(null);
      setBalancesError(getBalancesError(requestError));
    } finally {
      setIsLoadingBalances(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    walletService
      .getBalances()
      .then((response) => {
        if (!isActive) return;
        setBalances(response.balances);
        setBalancesError(null);
      })
      .catch((requestError: unknown) => {
        if (!isActive) return;
        setBalances(null);
        setBalancesError(getBalancesError(requestError));
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingBalances(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const balanceByCurrency = new Map(
    (balances ?? []).map((item) => [item.currency, item.amount]),
  );

  return (
    <div className="mx-auto w-full max-w-110 space-y-5 pb-2 lg:max-w-5xl lg:space-y-6">
      {/* Encabezado */}
      <section aria-labelledby="operations-heading" className="lg:pt-1">
        <h1
          id="operations-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight"
        >
          Operaciones
        </h1>
      </section>

      {/* Fila superior: 3 tarjetas de operación */}
      <section
        aria-label="Tipos de operación disponibles"
        className="space-y-2.5 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-5 lg:space-y-0"
      >
        {OPERATION_OPTIONS.map((option) => (
          <Link
            key={option.id}
            to={option.to}
            className="group block rounded-3xl no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
          >
            <Card className="flex h-full items-center justify-between gap-3 rounded-3xl border border-auria-border bg-auria-card p-3.5 shadow-2xs transition duration-150 hover:-translate-y-0.5 hover:border-auria-forest/40 hover:bg-white hover:shadow-md lg:flex-col lg:items-start lg:justify-between lg:p-5">
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-full lg:flex-col lg:items-start lg:gap-4">
                <div className="flex shrink-0 items-center justify-between gap-2 lg:w-full">
                  <span
                    aria-hidden="true"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold lg:h-12 lg:w-12 ${option.accentClass}`}
                  >
                    {option.icon}
                  </span>

                  <span className="hidden shrink-0 rounded-full bg-auria-cream px-2.5 py-0.5 text-[11px] font-semibold text-auria-muted lg:inline-block">
                    {option.badge}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[15px] leading-snug font-bold text-auria-ink lg:text-lg">
                      {option.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-auria-cream px-2 py-0.5 text-[10px] font-semibold text-auria-muted lg:hidden">
                      {option.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-auria-muted lg:text-sm">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 lg:mt-5 lg:w-full lg:justify-between lg:border-t lg:border-auria-border lg:pt-3.5">
                <span className="hidden text-xs font-bold text-auria-forest transition group-hover:underline lg:inline">
                  {option.ctaLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg font-bold text-auria-ink transition-transform group-hover:translate-x-0.5 lg:text-auria-forest"
                >
                  ›
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {/* Fila inferior: Disponibilidad para operar + Cotizaciones */}
      <div className="space-y-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-5 lg:space-y-0">
        {/* Columna izquierda: Tu disponibilidad para operar */}
        <section
          aria-labelledby="operations-balances-heading"
          className="lg:col-span-7"
        >
          <Card className="space-y-3 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-2xs lg:p-4">
            <div className="flex items-center justify-between gap-2">
              <h2
                id="operations-balances-heading"
                className="text-base font-bold text-auria-ink lg:text-lg"
              >
                Tu disponibilidad para operar
              </h2>

              <button
                type="button"
                onClick={() => setAreBalancesVisible((prev) => !prev)}
                aria-pressed={areBalancesVisible}
                aria-label={
                  areBalancesVisible ? "Ocultar saldos" : "Mostrar saldos"
                }
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-auria-muted transition hover:bg-auria-page hover:text-auria-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
              >
                {areBalancesVisible ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a21.8 21.8 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a21.8 21.8 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <path d="m1 1 22 22" />
                  </svg>
                )}
              </button>
            </div>

            {isLoadingBalances ? (
              <div
                className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:space-y-0"
                role="status"
                aria-busy="true"
                aria-label="Cargando saldos disponibles"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <div
                    key={currency}
                    className="h-13 animate-pulse rounded-2xl border border-auria-border bg-auria-page/60 sm:h-18"
                  />
                ))}
              </div>
            ) : balancesError ? (
              <div
                role="alert"
                aria-live="polite"
                className="space-y-2 rounded-2xl border border-auria-border bg-auria-page/50 p-3"
              >
                <p className="text-xs text-auria-muted">{balancesError}</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-8 rounded-xl px-3.5 text-xs font-semibold"
                  onClick={() => void loadBalances()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <ul
                aria-label="Saldos disponibles por moneda"
                className="space-y-2 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:space-y-0"
              >
                {SUPPORTED_CURRENCIES.map((currency) => {
                  const amount = balanceByCurrency.get(currency) ?? null;

                  return (
                    <li
                      key={currency}
                      className="flex items-center justify-between gap-2.5 rounded-2xl border border-auria-border bg-auria-page/55 px-3.5 py-2.5 sm:flex-col sm:items-start sm:justify-between sm:p-3"
                    >
                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-2">
                        <span
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-auria-cream text-[10px] font-extrabold text-auria-forest"
                        >
                          {currency}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-auria-ink">
                            {currency}
                          </p>
                          <p className="truncate text-[11px] text-auria-muted">
                            {CURRENCY_LABELS[currency]}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-auria-ink tabular-nums sm:mt-2.5">
                        {amount === null
                          ? "—"
                          : areBalancesVisible
                            ? formatCurrencyAmount(amount, currency)
                            : "••••••"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-auria-border pt-2.5">
              <Link
                to="/transactions"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-auria-forest no-underline transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
              >
                <span>Ir al historial de transacciones</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Card>
        </section>

        {/* Columna derecha: Cotizaciones */}
        <div className="lg:col-span-5">
          <ExchangeRatesSection />
        </div>
      </div>
    </div>
  );
}
