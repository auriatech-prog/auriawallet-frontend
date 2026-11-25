import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { CurrencyCode, WalletBalanceItem } from "@/types/wallet";
import { BalanceCard } from "./BalanceCard";
import { ExchangeRatesSection } from "./ExchangeRatesSection";
import { TransactionHistorySection } from "./TransactionHistorySection";
import { WalletQuickActions } from "./WalletQuickActions";

function getBalanceError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos cargar tus saldos. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.status === 401) {
    return "Tu sesión pudo haber expirado. Volvé a iniciar sesión para consultar tus saldos.";
  }

  return error.message || "No pudimos cargar tus saldos. Intentá nuevamente.";
}

export function WalletHomePage() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<WalletBalanceItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [areBalancesVisible, setAreBalancesVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("ARS");

  const fetchBalances = useCallback(async () => {
    const response = await walletService.getBalances();
    return response.balances;
  }, []);

  const refreshBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextBalances = await fetchBalances();
      setBalances(nextBalances);
    } catch (requestError) {
      setBalances(null);
      setError(getBalanceError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [fetchBalances]);

  useEffect(() => {
    let isActive = true;

    fetchBalances()
      .then((nextBalances) => {
        if (isActive) setBalances(nextBalances);
      })
      .catch((requestError: unknown) => {
        if (isActive) setError(getBalanceError(requestError));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => {
      setIsOnline(true);
      void refreshBalances();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      isActive = false;
    };
  }, [fetchBalances, refreshBalances]);

  const balanceByCurrency = new Map(
    (balances ?? []).map((balance) => [balance.currency, balance.amount]),
  );
  const firstName = user?.name.trim().split(/\s+/)[0] || "";
  const featuredAmount = balanceByCurrency.get(selectedCurrency) ?? null;

  return (
    <div className="mx-auto w-full max-w-110 space-y-3.5">
      {/* Saludo principal */}
      <section aria-labelledby="wallet-heading">
        <h1
          id="wallet-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink"
        >
          {firstName ? `Hola, ${firstName}!` : "Tu billetera"}
        </h1>
      </section>

      {!isOnline && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
          aria-live="polite"
        >
          Sin conexión a internet. Reconectate para actualizar tus saldos.
        </div>
      )}

      {/* Hero Card: Saldo disponible por moneda seleccionada */}
      <section
        aria-label="Resumen de saldo"
        className="relative overflow-hidden rounded-3xl bg-auria-forest p-5 text-white shadow-md"
      >
        {/* Ondas decorativas lima en esquina inferior derecha */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-12 h-32 w-44 rounded-full bg-auria-lime/25 blur-xs"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -bottom-14 h-28 w-36 rounded-full bg-auria-lime/80"
        />

        <div className="relative z-10 flex items-center justify-between">
          <span className="text-sm font-medium text-white/90">
            Saldo disponible · {selectedCurrency}
          </span>
          <button
            type="button"
            onClick={() => setAreBalancesVisible((visible) => !visible)}
            aria-pressed={areBalancesVisible}
            aria-label={
              areBalancesVisible ? "Ocultar saldos" : "Mostrar saldos"
            }
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-lime"
          >
            {areBalancesVisible ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a21.8 21.8 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a21.8 21.8 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="m1 1 22 22" />
              </svg>
            )}
          </button>
        </div>

        <div className="relative z-10 mt-2.5 flex items-baseline">
          {isLoading ? (
            <div className="h-9 w-44 animate-pulse rounded-lg bg-white/15" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-white tabular-nums sm:text-4xl">
              {featuredAmount === null
                ? "—"
                : areBalancesVisible
                  ? formatCurrencyAmount(featuredAmount, selectedCurrency)
                  : "••••••"}
            </p>
          )}
        </div>
      </section>

      {/* Botones de acción rápida: Añadir / Enviar / Convertir */}
      <WalletQuickActions />

      {/* Lista Mis saldos */}
      <section aria-labelledby="balances-heading" className="space-y-2.5">
        <h2 id="balances-heading" className="text-lg font-bold text-auria-ink">
          Mis saldos
        </h2>

        {isLoading ? (
          <div
            className="space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Cargando saldos"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <div
                key={currency}
                className="h-18 animate-pulse rounded-2xl border border-auria-border bg-auria-card"
              />
            ))}
            <span className="sr-only">Cargando tus saldos…</span>
          </div>
        ) : error ? (
          <Card className="border border-auria-border p-5 shadow-sm">
            <div role="alert" aria-live="polite">
              <h3 className="font-semibold text-auria-ink">
                No pudimos cargar tus saldos
              </h3>
              <p className="mt-1 text-sm text-auria-muted">{error}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 min-h-11 w-full rounded-xl text-sm font-semibold"
              isLoading={isLoading}
              disabled={!isOnline}
              onClick={() => void refreshBalances()}
            >
              Reintentar
            </Button>
          </Card>
        ) : balances?.length === 0 ? (
          <div role="status" aria-live="polite">
            <Card className="border border-auria-border p-5 shadow-sm">
              <h3 className="font-semibold text-auria-ink">
                Todavía no hay saldos para mostrar
              </h3>
              <p className="mt-1 text-sm text-auria-muted">
                Actualizá la billetera para consultar los saldos disponibles.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4 min-h-11 w-full rounded-xl text-sm font-semibold"
                disabled={!isOnline}
                onClick={() => void refreshBalances()}
              >
                Actualizar saldos
              </Button>
            </Card>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Saldos disponibles">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <li key={currency}>
                <BalanceCard
                  currency={currency}
                  amount={balanceByCurrency.get(currency) ?? null}
                  isVisible={areBalancesVisible}
                  isSelected={selectedCurrency === currency}
                  onSelect={() => setSelectedCurrency(currency)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Historial de transacciones */}
      <TransactionHistorySection />

      {/* Cotizaciones */}
      <ExchangeRatesSection />
    </div>
  );
}
