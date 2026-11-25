import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { CurrencyCode } from "@/types/wallet";

type CurrencyFilter = "ALL" | CurrencyCode;

interface NormalizedTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: CurrencyCode;
  direction: "in" | "out";
  timestamp: string;
}

const CURRENCY_CODES: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === "string" &&
    (CURRENCY_CODES as string[]).includes(value.toUpperCase())
  );
}

function getTransactionsError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No pudimos cargar el historial de transacciones. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.status === 401) {
    return "Tu sesión pudo haber expirado. Volvé a iniciar sesión para ver tu actividad.";
  }

  if (error.status === 404) {
    return "El historial de transacciones todavía no está disponible en el servidor.";
  }

  return (
    error.message ||
    "No pudimos cargar el historial de transacciones. Intentá nuevamente."
  );
}

function formatTransactionDate(rawDate: string): string {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function normalizeTransactions(rawResponse: unknown): NormalizedTransaction[] {
  const candidateList = Array.isArray(rawResponse)
    ? rawResponse
    : rawResponse &&
        typeof rawResponse === "object" &&
        Array.isArray((rawResponse as { transactions?: unknown }).transactions)
      ? (rawResponse as { transactions: unknown[] }).transactions
      : rawResponse &&
          typeof rawResponse === "object" &&
          Array.isArray((rawResponse as { items?: unknown }).items)
        ? (rawResponse as { items: unknown[] }).items
        : [];

  return candidateList
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === "object"),
    )
    .map((item, index) => {
      const rawCurrency =
        typeof item.currency === "string"
          ? item.currency.toUpperCase()
          : typeof item.toCurrency === "string"
            ? item.toCurrency.toUpperCase()
            : "ARS";
      const currency: CurrencyCode = isCurrencyCode(rawCurrency)
        ? rawCurrency
        : "ARS";

      const rawAmount = Number(item.amount ?? item.value ?? 0);
      const numericAmount = Number.isFinite(rawAmount) ? rawAmount : 0;

      const rawType = String(item.type ?? item.direction ?? "").toLowerCase();
      const isIncoming =
        rawType.includes("deposit") ||
        rawType.includes("credit") ||
        rawType.includes("in") ||
        rawType.includes("receive") ||
        numericAmount > 0;

      const direction: "in" | "out" =
        rawType.includes("withdraw") ||
        rawType.includes("debit") ||
        rawType.includes("send") ||
        rawType.includes("out") ||
        numericAmount < 0
          ? "out"
          : isIncoming
            ? "in"
            : "out";

      const title =
        (typeof item.description === "string" && item.description.trim()) ||
        (typeof item.title === "string" && item.title.trim()) ||
        (direction === "in"
          ? "Ingreso en billetera"
          : "Movimiento en billetera");

      const subtitle =
        (typeof item.status === "string" && item.status.trim()) ||
        (typeof item.counterparty === "string" && item.counterparty.trim()) ||
        currency;

      const timestamp =
        (typeof item.createdAt === "string" && item.createdAt) ||
        (typeof item.date === "string" && item.date) ||
        "";

      const id =
        (typeof item.id === "string" && item.id) ||
        (typeof item.id === "number" && String(item.id)) ||
        `tx-${index}`;

      return {
        id,
        title,
        subtitle,
        amount: Math.abs(numericAmount),
        currency,
        direction,
        timestamp,
      };
    });
}

export function TransactionHistoryPage() {
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyFilter>("ALL");
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const walletApi = walletService as unknown as {
        getTransactions?: (params?: {
          currency?: CurrencyCode;
        }) => Promise<unknown>;
      };

      if (typeof walletApi.getTransactions !== "function") {
        setTransactions([]);
        setError(
          "El servicio de transacciones todavía no está configurado en el cliente.",
        );
        return;
      }

      const data = await walletApi.getTransactions(
        selectedCurrency === "ALL" ? undefined : { currency: selectedCurrency },
      );
      setTransactions(normalizeTransactions(data));
    } catch (requestError) {
      setTransactions([]);
      setError(getTransactionsError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      try {
        const walletApi = walletService as unknown as {
          getTransactions?: (params?: {
            currency?: CurrencyCode;
          }) => Promise<unknown>;
        };

        if (typeof walletApi.getTransactions !== "function") {
          if (!isActive) return;
          setTransactions([]);
          setError(
            "El servicio de transacciones todavía no está configurado en el cliente.",
          );
          setIsLoading(false);
          return;
        }

        const data = await walletApi.getTransactions(
          selectedCurrency === "ALL"
            ? undefined
            : { currency: selectedCurrency },
        );
        if (!isActive) return;
        setTransactions(normalizeTransactions(data));
        setError(null);
      } catch (requestError) {
        if (!isActive) return;
        setTransactions([]);
        setError(getTransactionsError(requestError));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      isActive = false;
    };
  }, [selectedCurrency]);

  const filteredTransactions = useMemo(() => {
    if (selectedCurrency === "ALL") return transactions;
    return transactions.filter((item) => item.currency === selectedCurrency);
  }, [transactions, selectedCurrency]);

  return (
    <div className="mx-auto w-full max-w-110 space-y-4">
      <section aria-labelledby="transactions-page-heading">
        <h1
          id="transactions-page-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink"
        >
          Actividad
        </h1>
        <p className="mt-0.5 text-xs text-auria-muted">
          Historial de movimientos de tu billetera
        </p>
      </section>

      {/* Filtro por moneda */}
      <div
        role="group"
        aria-label="Filtrar transacciones por moneda"
        className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
      >
        <button
          type="button"
          onClick={() => setSelectedCurrency("ALL")}
          aria-pressed={selectedCurrency === "ALL"}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest ${
            selectedCurrency === "ALL"
              ? "bg-auria-forest text-white"
              : "border border-auria-border bg-auria-card text-auria-ink hover:bg-auria-cream"
          }`}
        >
          Todas
        </button>

        {CURRENCY_CODES.map((currency) => {
          const isActive = selectedCurrency === currency;
          return (
            <button
              key={currency}
              type="button"
              onClick={() => setSelectedCurrency(currency)}
              aria-pressed={isActive}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest ${
                isActive
                  ? "bg-auria-forest text-white"
                  : "border border-auria-border bg-auria-card text-auria-ink hover:bg-auria-cream"
              }`}
            >
              {currency}
            </button>
          );
        })}
      </div>

      {/* Estados y listado */}
      {isLoading ? (
        <div
          className="space-y-2.5"
          role="status"
          aria-busy="true"
          aria-label="Cargando historial de transacciones"
        >
          {[0, 1, 2].map((skeleton) => (
            <div
              key={skeleton}
              className="h-18 animate-pulse rounded-2xl border border-auria-border bg-auria-card"
            />
          ))}
        </div>
      ) : error ? (
        <Card className="space-y-3 rounded-2xl border border-auria-border bg-auria-card p-4 shadow-2xs">
          <div role="alert" aria-live="polite">
            <h2 className="text-sm font-bold text-auria-ink">
              No pudimos cargar el historial
            </h2>
            <p className="mt-1 text-xs text-auria-muted">{error}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 w-full rounded-xl text-xs font-semibold"
            onClick={() => void loadTransactions()}
          >
            Reintentar
          </Button>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        <Card className="rounded-2xl border border-auria-border bg-auria-card p-5 text-center shadow-2xs">
          <p className="text-sm font-bold text-auria-ink">
            Todavía no hay movimientos para mostrar
          </p>
          <p className="mt-1 text-xs text-auria-muted">
            {selectedCurrency === "ALL"
              ? "Cuando realices operaciones en tu billetera, aparecerán acá."
              : `No encontramos transacciones en ${selectedCurrency}.`}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2" aria-label="Listado de transacciones">
          {filteredTransactions.map((tx) => {
            const isIncoming = tx.direction === "in";
            return (
              <li key={tx.id}>
                <Card className="flex items-center justify-between gap-3 rounded-2xl border border-auria-border bg-auria-card px-4 py-3 shadow-2xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isIncoming
                          ? "bg-auria-lime/35 text-auria-forest"
                          : "bg-auria-cream text-auria-ink"
                      }`}
                    >
                      {isIncoming ? "↓" : "↑"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-auria-ink">
                        {tx.title}
                      </p>
                      <p className="truncate text-xs text-auria-muted">
                        {tx.subtitle}
                        {tx.timestamp
                          ? ` · ${formatTransactionDate(tx.timestamp)}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold tabular-nums ${
                      isIncoming ? "text-auria-forest" : "text-auria-ink"
                    }`}
                  >
                    {isIncoming ? "+" : "-"}
                    {formatCurrencyAmount(tx.amount, tx.currency)}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
