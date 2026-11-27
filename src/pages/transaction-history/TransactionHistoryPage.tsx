import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { CurrencyCode } from "@/types/wallet";

type CurrencyFilter = "ALL" | CurrencyCode;
type TransactionTypeFilter = "ALL" | "BUY" | "SELL" | "CONVERT";
type DateRangeFilter = "ALL" | "7D" | "30D" | "THIS_MONTH" | "CUSTOM";
type OpenDropdown = "TYPE" | "CURRENCY" | "DATE" | null;

interface NormalizedTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  currency: CurrencyCode;
  direction: "in" | "out";
  txType: Exclude<TransactionTypeFilter, "ALL">;
  timestamp: string;
  parsedDate: Date | null;
}

const CURRENCY_CODES: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

const TYPE_FILTER_OPTIONS: { value: TransactionTypeFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "BUY", label: "Compra" },
  { value: "SELL", label: "Venta" },
  { value: "CONVERT", label: "Conversión" },
];

const DATE_FILTER_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "ALL", label: "Todo el historial" },
  { value: "7D", label: "Últimos 7 días" },
  { value: "30D", label: "Últimos 30 días" },
  { value: "THIS_MONTH", label: "Este mes" },
  { value: "CUSTOM", label: "Rango personalizado" },
];

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
    return "Tu sesión pudo haber expirado. Volvé a iniciar sesión para ver tu historial.";
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function resolveTransactionType(
  rawType: string,
  numericAmount: number,
): Exclude<TransactionTypeFilter, "ALL"> {
  if (rawType.includes("convert") || rawType.includes("exchange")) {
    return "CONVERT";
  }

  if (
    rawType.includes("sell") ||
    rawType.includes("withdraw") ||
    rawType.includes("debit") ||
    rawType.includes("send") ||
    rawType.includes("out") ||
    numericAmount < 0
  ) {
    return "SELL";
  }

  return "BUY";
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
      const txType = resolveTransactionType(rawType, numericAmount);

      const direction: "in" | "out" = txType === "SELL" ? "out" : "in";

      const defaultTitleByType: Record<
        Exclude<TransactionTypeFilter, "ALL">,
        string
      > = {
        BUY: `Compra · ${currency}`,
        SELL: `Venta · ${currency}`,
        CONVERT:
          typeof item.fromCurrency === "string" &&
          typeof item.toCurrency === "string"
            ? `Conversión · ${item.fromCurrency.toUpperCase()} → ${item.toCurrency.toUpperCase()}`
            : `Conversión · ${currency}`,
      };

      const title =
        (typeof item.description === "string" && item.description.trim()) ||
        (typeof item.title === "string" && item.title.trim()) ||
        defaultTitleByType[txType];

      const subtitle =
        (typeof item.status === "string" && item.status.trim()) ||
        (typeof item.counterparty === "string" && item.counterparty.trim()) ||
        currency;

      const timestamp =
        (typeof item.createdAt === "string" && item.createdAt) ||
        (typeof item.date === "string" && item.date) ||
        "";

      const candidateDate = timestamp ? new Date(timestamp) : null;
      const parsedDate =
        candidateDate && !Number.isNaN(candidateDate.getTime())
          ? candidateDate
          : null;

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
        txType,
        timestamp,
        parsedDate,
      };
    });
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${
        isOpen ? "rotate-180" : ""
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TransactionHistoryPage() {
  const [selectedType, setSelectedType] =
    useState<TransactionTypeFilter>("ALL");
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyFilter>("ALL");
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeFilter>("ALL");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);

  const filtersBarRef = useRef<HTMLDivElement>(null);

  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filtersBarRef.current &&
        !filtersBarRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await walletService.getTransactions({
        limit: 50,
        offset: 0,
      });
      setTransactions(normalizeTransactions(data));
    } catch (requestError) {
      setTransactions([]);
      setError(getTransactionsError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    walletService
      .getTransactions({ limit: 50, offset: 0 })
      .then((data) => {
        if (!isActive) return;
        setTransactions(normalizeTransactions(data));
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!isActive) return;
        setTransactions([]);
        setError(getTransactionsError(requestError));
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

  const hasActiveFilters =
    selectedType !== "ALL" ||
    selectedCurrency !== "ALL" ||
    selectedDateRange !== "ALL" ||
    Boolean(customDateFrom) ||
    Boolean(customDateTo);

  function handleClearFilters() {
    setSelectedType("ALL");
    setSelectedCurrency("ALL");
    setSelectedDateRange("ALL");
    setCustomDateFrom("");
    setCustomDateTo("");
    setOpenDropdown(null);
  }

  const activeTypeLabel =
    selectedType === "ALL"
      ? "Tipo de transacción"
      : (TYPE_FILTER_OPTIONS.find((opt) => opt.value === selectedType)?.label ??
        "Tipo de transacción");

  const activeCurrencyLabel =
    selectedCurrency === "ALL" ? "Moneda" : `Moneda: ${selectedCurrency}`;

  const activeDateLabel =
    selectedDateRange === "ALL"
      ? "Fecha"
      : selectedDateRange === "CUSTOM" && (customDateFrom || customDateTo)
        ? `${customDateFrom || "Inicio"} → ${customDateTo || "Hoy"}`
        : (DATE_FILTER_OPTIONS.find((opt) => opt.value === selectedDateRange)
            ?.label ?? "Fecha");

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return transactions.filter((item) => {
      if (selectedType !== "ALL" && item.txType !== selectedType) {
        return false;
      }

      if (selectedCurrency !== "ALL" && item.currency !== selectedCurrency) {
        return false;
      }

      if (selectedDateRange !== "ALL") {
        if (!item.parsedDate) return false;

        if (selectedDateRange === "7D") {
          const sevenDaysAgo = new Date(startOfToday);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (item.parsedDate < sevenDaysAgo) return false;
        } else if (selectedDateRange === "30D") {
          const thirtyDaysAgo = new Date(startOfToday);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (item.parsedDate < thirtyDaysAgo) return false;
        } else if (selectedDateRange === "THIS_MONTH") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (item.parsedDate < startOfMonth) return false;
        } else if (selectedDateRange === "CUSTOM") {
          if (customDateFrom) {
            const fromDate = new Date(`${customDateFrom}T00:00:00`);
            if (item.parsedDate < fromDate) return false;
          }
          if (customDateTo) {
            const toDate = new Date(`${customDateTo}T23:59:59`);
            if (item.parsedDate > toDate) return false;
          }
        }
      }

      return true;
    });
  }, [
    transactions,
    selectedType,
    selectedCurrency,
    selectedDateRange,
    customDateFrom,
    customDateTo,
  ]);

  return (
    <div className="mx-auto w-full max-w-110 space-y-4 lg:max-w-5xl lg:space-y-5">
      {/* Encabezado */}
      <section
        aria-labelledby="transactions-page-heading"
        className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between lg:pt-1"
      >
        <h1
          id="transactions-page-heading"
          className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight"
        >
          Historial de transacciones
        </h1>

        {!isLoading && !error && (
          <p className="text-xs font-medium text-auria-muted">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1 ? "movimiento" : "movimientos"}
          </p>
        )}
      </section>

      {/* Barra superior de filtros desplegables */}
      <div
        ref={filtersBarRef}
        aria-label="Filtros del historial"
        className="flex flex-nowrap items-center gap-1.5 sm:gap-2.5 lg:flex-wrap"
      >
        {/* Filtro 1: Tipo de transacción */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown((prev) => (prev === "TYPE" ? null : "TYPE"))
            }
            aria-expanded={openDropdown === "TYPE"}
            aria-haspopup="listbox"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs ${
              selectedType !== "ALL"
                ? "bg-auria-forest text-white"
                : "border border-auria-border bg-auria-card text-auria-ink hover:bg-auria-cream"
            }`}
          >
            <span>{activeTypeLabel}</span>
            <ChevronDownIcon isOpen={openDropdown === "TYPE"} />
          </button>

          {openDropdown === "TYPE" && (
            <div
              role="listbox"
              aria-label="Opciones de tipo de transacción"
              className="absolute top-full left-0 z-30 mt-2 w-52 rounded-2xl border border-auria-border bg-auria-card p-1.5 shadow-lg"
            >
              {TYPE_FILTER_OPTIONS.map((option) => {
                const isSelected = selectedType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedType(option.value);
                      setOpenDropdown(null);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-auria-lime-soft font-bold text-auria-forest"
                        : "font-medium text-auria-ink hover:bg-auria-page"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filtro 2: Moneda */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown((prev) =>
                prev === "CURRENCY" ? null : "CURRENCY",
              )
            }
            aria-expanded={openDropdown === "CURRENCY"}
            aria-haspopup="listbox"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs ${
              selectedCurrency !== "ALL"
                ? "bg-auria-forest text-white"
                : "border border-auria-border bg-auria-card text-auria-ink hover:bg-auria-cream"
            }`}
          >
            <span>{activeCurrencyLabel}</span>
            <ChevronDownIcon isOpen={openDropdown === "CURRENCY"} />
          </button>

          {openDropdown === "CURRENCY" && (
            <div
              role="listbox"
              aria-label="Opciones de moneda"
              className="absolute top-full left-0 z-30 mt-2 w-44 rounded-2xl border border-auria-border bg-auria-card p-1.5 shadow-lg"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedCurrency === "ALL"}
                onClick={() => {
                  setSelectedCurrency("ALL");
                  setOpenDropdown(null);
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                  selectedCurrency === "ALL"
                    ? "bg-auria-lime-soft font-bold text-auria-forest"
                    : "font-medium text-auria-ink hover:bg-auria-page"
                }`}
              >
                <span>Todas</span>
                {selectedCurrency === "ALL" && (
                  <span aria-hidden="true">✓</span>
                )}
              </button>

              {CURRENCY_CODES.map((currency) => {
                const isSelected = selectedCurrency === currency;
                return (
                  <button
                    key={currency}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedCurrency(currency);
                      setOpenDropdown(null);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs tabular-nums transition ${
                      isSelected
                        ? "bg-auria-lime-soft font-bold text-auria-forest"
                        : "font-medium text-auria-ink hover:bg-auria-page"
                    }`}
                  >
                    <span>{currency}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filtro 3: Fecha */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setOpenDropdown((prev) => (prev === "DATE" ? null : "DATE"))
            }
            aria-expanded={openDropdown === "DATE"}
            aria-haspopup="listbox"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs ${
              selectedDateRange !== "ALL"
                ? "bg-auria-forest text-white"
                : "border border-auria-border bg-auria-card text-auria-ink hover:bg-auria-cream"
            }`}
          >
            <span>{activeDateLabel}</span>
            <ChevronDownIcon isOpen={openDropdown === "DATE"} />
          </button>

          {openDropdown === "DATE" && (
            <div
              role="listbox"
              aria-label="Opciones de fecha"
              className="absolute top-full right-0 z-30 mt-2 w-64 rounded-2xl border border-auria-border bg-auria-card p-1.5 shadow-lg sm:right-auto sm:left-0"
            >
              {DATE_FILTER_OPTIONS.map((option) => {
                const isSelected = selectedDateRange === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedDateRange(option.value);
                      if (option.value !== "CUSTOM") {
                        setOpenDropdown(null);
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-auria-lime-soft font-bold text-auria-forest"
                        : "font-medium text-auria-ink hover:bg-auria-page"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <span aria-hidden="true">✓</span>}
                  </button>
                );
              })}

              {selectedDateRange === "CUSTOM" && (
                <div className="mt-1.5 space-y-2 border-t border-auria-border px-2 pt-2.5 pb-1">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-[11px] font-medium text-auria-muted">
                      <span>Desde</span>
                      <input
                        type="date"
                        value={customDateFrom}
                        onChange={(event) =>
                          setCustomDateFrom(event.target.value)
                        }
                        className="w-full rounded-xl border border-auria-border bg-auria-page px-2 py-1.5 text-xs text-auria-ink focus:border-auria-forest focus:outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-[11px] font-medium text-auria-muted">
                      <span>Hasta</span>
                      <input
                        type="date"
                        value={customDateTo}
                        onChange={(event) =>
                          setCustomDateTo(event.target.value)
                        }
                        className="w-full rounded-xl border border-auria-border bg-auria-page px-2 py-1.5 text-xs text-auria-ink focus:border-auria-forest focus:outline-none"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="w-full cursor-pointer rounded-xl bg-auria-forest py-1.5 text-xs font-semibold text-white transition hover:bg-auria-forest/90"
                  >
                    Aplicar fechas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón rápido para limpiar si hay algún filtro aplicado */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="shrink-0 cursor-pointer px-1.5 py-1.5 text-[11px] font-semibold whitespace-nowrap text-auria-forest transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest sm:px-2 sm:text-xs"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Listado completo de transacciones */}
      <section aria-label="Listado completo de transacciones">
        {isLoading ? (
          <div
            className="space-y-2.5"
            role="status"
            aria-busy="true"
            aria-label="Cargando historial de transacciones"
          >
            {[0, 1, 2, 3, 4].map((skeleton) => (
              <div
                key={skeleton}
                className="h-18 animate-pulse rounded-2xl border border-auria-border bg-auria-card"
              />
            ))}
          </div>
        ) : error ? (
          <Card className="space-y-3 rounded-2xl border border-auria-border bg-auria-card p-5 shadow-xs lg:p-6">
            <div role="alert" aria-live="polite">
              <h2 className="text-sm font-bold text-auria-ink lg:text-base">
                No pudimos cargar el historial
              </h2>
              <p className="mt-1 text-xs text-auria-muted lg:text-sm">
                {error}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 w-full rounded-xl text-xs font-semibold sm:w-auto sm:px-6"
              onClick={() => void loadTransactions()}
            >
              Reintentar
            </Button>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card className="space-y-2 rounded-2xl border border-auria-border bg-auria-card p-6 text-center shadow-xs lg:p-8">
            <p className="text-sm font-bold text-auria-ink lg:text-base">
              Todavía no hay movimientos para mostrar
            </p>
            <p className="mx-auto max-w-md text-xs text-auria-muted lg:text-sm">
              {hasActiveFilters
                ? "No encontramos transacciones que coincidan con los filtros seleccionados."
                : "Cuando realices operaciones en tu billetera, aparecerán acá."}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-9 rounded-xl px-4 text-xs font-semibold"
                  onClick={handleClearFilters}
                >
                  Restablecer filtros
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <ul className="space-y-2.5" aria-label="Listado de transacciones">
            {filteredTransactions.map((tx) => {
              const isIncoming = tx.direction === "in";
              const typeBadgeLabel =
                tx.txType === "BUY"
                  ? "Compra"
                  : tx.txType === "SELL"
                    ? "Venta"
                    : "Conversión";

              return (
                <li key={tx.id}>
                  <Card className="flex items-center justify-between gap-4 rounded-2xl border border-auria-border bg-auria-card px-4 py-3.5 shadow-2xs transition hover:border-auria-forest/30 lg:px-5 lg:py-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span
                        aria-hidden="true"
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          isIncoming
                            ? "bg-auria-lime/35 text-auria-forest"
                            : "bg-auria-cream text-auria-ink"
                        }`}
                      >
                        {tx.txType === "CONVERT" ? "⇄" : isIncoming ? "↓" : "↑"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-auria-ink">
                            {tx.title}
                          </p>
                          <span className="hidden rounded-full bg-auria-page px-2 py-0.5 text-[11px] font-semibold text-auria-muted sm:inline-block">
                            {typeBadgeLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-auria-muted">
                          {tx.subtitle}
                          {tx.timestamp
                            ? ` · ${formatTransactionDate(tx.timestamp)}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p
                        className={`text-sm font-bold tabular-nums lg:text-base ${
                          isIncoming ? "text-auria-forest" : "text-auria-ink"
                        }`}
                      >
                        {tx.txType === "CONVERT" ? "" : isIncoming ? "+" : "-"}
                        {formatCurrencyAmount(tx.amount, tx.currency)}
                      </p>
                      <p className="text-[11px] font-medium text-auria-muted">
                        {tx.currency}
                      </p>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
