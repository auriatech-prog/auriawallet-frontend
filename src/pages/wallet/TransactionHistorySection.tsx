import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Button, Card } from "@/components/ui";
import { formatCurrencyAmount, isSupportedCurrency } from "@/config/currencies";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { TransactionItem } from "@/types/wallet";

function getHistoryError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos cargar tus movimientos. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.status === 401) {
    return "Tu sesión pudo haber expirado. Volvé a iniciar sesión para ver tu historial.";
  }

  return (
    error.message || "No pudimos cargar tus movimientos. Intentá nuevamente."
  );
}

function getTransactionTitle(item: TransactionItem): string {
  const normalizedType = item.type.toLowerCase();

  if (normalizedType === "buy") {
    return `Compra · ${item.currency}`;
  }

  if (normalizedType === "sell") {
    return `Venta · ${item.currency}`;
  }

  if (normalizedType === "convert") {
    if (item.fromCurrency && item.toCurrency) {
      return `Conversión · ${item.fromCurrency} → ${item.toCurrency}`;
    }
    return `Conversión · ${item.currency}`;
  }

  return item.type || `Movimiento · ${item.currency}`;
}

function formatTransactionDate(dateString: string): string {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(parsedDate);
}

export function TransactionHistorySection() {
  const [transactions, setTransactions] = useState<TransactionItem[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await walletService.getTransactions({
        limit: 5,
        offset: 0,
      });
      setTransactions(items);
    } catch (requestError) {
      setTransactions(null);
      setError(getHistoryError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    walletService
      .getTransactions({ limit: 5, offset: 0 })
      .then((items) => {
        if (!isActive) return;
        setTransactions(items);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!isActive) return;
        setTransactions(null);
        setError(getHistoryError(requestError));
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section aria-labelledby="history-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="history-heading" className="text-lg font-bold text-auria-ink">
          Historial de transacciones
        </h2>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-auria-forest transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
        >
          Ver todo
        </Link>
      </div>

      {isLoading ? (
        <div
          className="space-y-2.5"
          role="status"
          aria-busy="true"
          aria-label="Cargando historial de transacciones"
        >
          {[0, 1, 2].map((skeletonIndex) => (
            <div
              key={skeletonIndex}
              className="h-16 animate-pulse rounded-2xl border border-auria-border bg-auria-card"
            />
          ))}
        </div>
      ) : error ? (
        <Card className="border border-auria-border bg-auria-card p-4 shadow-xs">
          <div role="alert" aria-live="polite">
            <h3 className="text-sm font-semibold text-auria-ink">
              No pudimos cargar el historial
            </h3>
            <p className="mt-1 text-xs text-auria-muted">{error}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-3 min-h-10 w-full rounded-xl text-xs font-semibold"
            onClick={() => void refreshTransactions()}
          >
            Reintentar
          </Button>
        </Card>
      ) : !transactions || transactions.length === 0 ? (
        <Card className="border border-auria-border bg-auria-card p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-auria-ink">
            Todavía no hay movimientos registrados
          </h3>
          <p className="mt-1 text-xs text-auria-muted">
            Cuando compres, vendas o conviertas divisas, vas a ver tus últimos
            movimientos acá.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2.5" aria-label="Últimas transacciones">
          {transactions.slice(0, 5).map((item) => {
            const currency = isSupportedCurrency(item.currency)
              ? item.currency
              : "ARS";

            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-auria-border bg-auria-card px-4 py-3 shadow-xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-auria-ink">
                    {getTransactionTitle(item)}
                  </p>
                  <p className="text-xs text-auria-muted">
                    {formatTransactionDate(item.createdAt)}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold tracking-tight text-auria-ink tabular-nums">
                  {formatCurrencyAmount(item.amount, currency)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
