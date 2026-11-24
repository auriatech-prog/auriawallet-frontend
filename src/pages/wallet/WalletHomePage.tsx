import { useCallback, useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { WalletBalanceItem } from "@/types/wallet";
import { BalanceCard } from "./BalanceCard";
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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7 pb-4">
      <section aria-labelledby="wallet-heading" className="space-y-1">
        {firstName && <p className="text-sm font-medium text-auria-muted">Hola, {firstName}</p>}
        <h1 id="wallet-heading" className="text-2xl font-bold tracking-tight text-auria-forest">
          Tus saldos
        </h1>
        <p className="text-sm text-auria-muted">
          Consultá tus fondos disponibles en cada moneda.
        </p>
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

      <section aria-labelledby="balances-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="balances-heading" className="text-lg font-semibold text-auria-ink">
            Mis monedas
          </h2>
          <button
            type="button"
            className="min-h-10 rounded-lg px-3 text-sm font-semibold text-auria-forest underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
            aria-pressed={areBalancesVisible}
            onClick={() => setAreBalancesVisible((visible) => !visible)}
          >
            {areBalancesVisible ? "Ocultar saldos" : "Mostrar saldos"}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3" role="status" aria-busy="true" aria-label="Cargando saldos">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <div
                key={currency}
                className="h-24 animate-pulse rounded-2xl border border-auria-border bg-auria-card"
              />
            ))}
            <span className="sr-only">Cargando tus saldos…</span>
          </div>
        ) : error ? (
          <Card className="border border-auria-border p-5 shadow-sm">
            <div role="alert" aria-live="polite">
              <h3 className="font-semibold text-auria-ink">No pudimos cargar tus saldos</h3>
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
        ) : (
          <ul className="space-y-3" aria-label="Saldos disponibles">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <li key={currency}>
                <BalanceCard
                  currency={currency}
                  amount={balanceByCurrency.get(currency) ?? null}
                  isVisible={areBalancesVisible}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <WalletQuickActions />
    </div>
  );
}
