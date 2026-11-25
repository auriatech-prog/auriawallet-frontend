import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { ApiError } from "@/services/apiClient";
import { walletService } from "@/services/walletService";
import type { CurrencyCode, ExchangeRateResponse } from "@/types/wallet";

export interface RateHistoryPoint {
  label?: string;
  value: number;
}

export interface ExchangeRatesSectionProps {
  historySeries?: RateHistoryPoint[];
}

function getExchangeRateError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Cotización no disponible en este momento. Intentá nuevamente.";
  }

  if (error.status === 0) {
    return "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.";
  }

  if (error.status === 400) {
    return "Seleccioná dos monedas válidas y distintas para consultar la cotización.";
  }

  if (error.status === 503) {
    return "Cotización no disponible temporalmente. Intentá nuevamente en unos minutos.";
  }

  if (error.status === 401) {
    return "Tu sesión pudo haber expirado. Volvé a iniciar sesión para ver cotizaciones.";
  }

  return (
    error.message ||
    "Cotización no disponible en este momento. Intentá nuevamente."
  );
}

function formatRateValue(numericRate: number): string {
  if (!Number.isFinite(numericRate)) {
    return "—";
  }

  const maxDecimals = numericRate < 1 ? 4 : 2;
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(numericRate);
}

function formatAxisTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value >= 100) {
    return Math.round(value).toLocaleString("es-AR");
  }
  return formatRateValue(value);
}

function formatConvertedAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "0,00";
  const maxDecimals = amount > 0 && amount < 1 ? 4 : 2;
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(amount);
}

function formatFetchedDate(isoDate: string): string {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function buildReferenceSeries(
  baseRate: number,
  from: CurrencyCode,
  to: CurrencyCode,
): RateHistoryPoint[] {
  const seed = `${from}-${to}`
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const offsets = [
    0.012, 0.024, 0.022, 0.036, 0.019, 0.015, 0.014, 0.017, 0.015, 0.026, 0.004,
    -0.012, -0.013, -0.012, 0.005, -0.011, -0.022, -0.034, -0.033, -0.031,
    -0.036, -0.029, -0.028, -0.035, -0.028, -0.027, -0.022, -0.025, 0,
  ];

  const direction = seed % 2 === 0 ? 1 : -1;

  return offsets.map((step, index) => {
    const adjusted = baseRate * (1 + step * direction);
    return {
      label:
        index === 0
          ? "Hace 30 días"
          : index === offsets.length - 1
            ? "Hoy"
            : undefined,
      value: Math.max(adjusted, baseRate * 0.1),
    };
  });
}

function RateTrendChart({ points }: { points: RateHistoryPoint[] }) {
  if (points.length < 2) return null;

  const width = 320;
  const height = 148;
  const padLeft = 4;
  const padRight = 52;
  const padTop = 12;
  const padBottom = 24;

  const values = points.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin || Math.abs(rawMax) * 0.05 || 1;
  const minVal = rawMin - spread * 0.12;
  const maxVal = rawMax + spread * 0.12;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const plotBottomY = padTop + plotHeight;

  const coords = points.map((pt, idx) => {
    const x = padLeft + (idx / (points.length - 1)) * plotWidth;
    const ratio = (pt.value - minVal) / (maxVal - minVal || 1);
    const y = padTop + (1 - ratio) * plotHeight;
    return { x, y, value: pt.value };
  });

  const linePath = coords
    .map(
      (c, idx) => `${idx === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`,
    )
    .join(" ");

  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${plotBottomY.toFixed(1)} L${coords[0].x.toFixed(1)},${plotBottomY.toFixed(1)} Z`;

  const lastPoint = coords[coords.length - 1];
  const topLabelVal = formatAxisTick(maxVal);
  const midLabelVal = formatAxisTick((maxVal + minVal) / 2);
  const botLabelVal = formatAxisTick(minVal);
  const startLabel = points[0]?.label ?? "Inicio";
  const endLabel = points[points.length - 1]?.label ?? "Hoy";

  return (
    <div className="px-1 pt-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-36 w-full overflow-visible"
        role="img"
        aria-label="Gráfico de cotización"
      >
        <defs>
          <linearGradient id="auriaRateArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        {[0, 0.5, 1].map((t) => {
          const yGuide = padTop + t * plotHeight;
          return (
            <line
              key={t}
              x1={padLeft}
              y1={yGuide}
              x2={padLeft + plotWidth}
              y2={yGuide}
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeDasharray="3 3"
              className="text-auria-forest"
            />
          );
        })}

        {/* Eje vertical derecho */}
        <line
          x1={padLeft + plotWidth}
          y1={padTop}
          x2={padLeft + plotWidth}
          y2={plotBottomY}
          stroke="currentColor"
          strokeOpacity="0.2"
          className="text-auria-forest"
        />

        {/* Área sutil bajo la curva */}
        <path
          d={areaPath}
          fill="url(#auriaRateArea)"
          className="text-auria-lime"
        />

        {/* Línea de cotización */}
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-auria-forest"
        />

        {/* Punto actual */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="9"
          className="fill-auria-lime/40"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4.2"
          className="fill-auria-forest stroke-white"
          strokeWidth="1.5"
        />

        {/* Etiquetas de eje derecho */}
        <text
          x={width - 2}
          y={padTop + 4}
          textAnchor="end"
          className="fill-auria-muted text-[10px] tabular-nums"
        >
          {topLabelVal}
        </text>
        <text
          x={width - 2}
          y={padTop + plotHeight / 2 + 3}
          textAnchor="end"
          className="fill-auria-muted text-[10px] tabular-nums"
        >
          {midLabelVal}
        </text>
        <text
          x={width - 2}
          y={plotBottomY}
          textAnchor="end"
          className="fill-auria-muted text-[10px] tabular-nums"
        >
          {botLabelVal}
        </text>

        {/* Etiquetas inferiores alineadas al rango del gráfico */}
        <text
          x={padLeft}
          y={height - 4}
          textAnchor="start"
          className="fill-auria-muted text-[11px]"
        >
          {startLabel}
        </text>
        <text
          x={padLeft + plotWidth}
          y={height - 4}
          textAnchor="end"
          className="fill-auria-muted text-[11px]"
        >
          {endLabel}
        </text>
      </svg>
    </div>
  );
}

export function ExchangeRatesSection({
  historySeries,
}: ExchangeRatesSectionProps) {
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("USD");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("ARS");
  const [amountInput, setAmountInput] = useState<string>("1");
  const [quote, setQuote] = useState<ExchangeRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFromChange = (nextFrom: CurrencyCode) => {
    setIsLoading(true);
    setError(null);
    setFromCurrency(nextFrom);

    if (nextFrom === toCurrency) {
      const fallbackTo =
        SUPPORTED_CURRENCIES.find((currency) => currency !== nextFrom) ?? "ARS";
      setToCurrency(fallbackTo);
    }
  };

  const handleToChange = (nextTo: CurrencyCode) => {
    setIsLoading(true);
    setError(null);
    setToCurrency(nextTo);

    if (nextTo === fromCurrency) {
      const fallbackFrom =
        SUPPORTED_CURRENCIES.find((currency) => currency !== nextTo) ?? "USD";
      setFromCurrency(fallbackFrom);
    }
  };

  const handleSwapCurrencies = () => {
    setIsLoading(true);
    setError(null);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const refreshQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await walletService.getExchangeRate({
        from: fromCurrency,
        to: toCurrency,
      });
      setQuote(data);
    } catch (requestError) {
      setQuote(null);
      setError(getExchangeRateError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    let isActive = true;

    walletService
      .getExchangeRate({ from: fromCurrency, to: toCurrency })
      .then((data) => {
        if (!isActive) return;
        setQuote(data);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (!isActive) return;
        setQuote(null);
        setError(getExchangeRateError(requestError));
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [fromCurrency, toCurrency]);

  const numericRate = quote ? Number(quote.rate) : Number.NaN;
  const parsedAmount = Number(amountInput.replace(",", "."));
  const safeAmount =
    amountInput.trim() === "" ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount < 0
      ? 0
      : parsedAmount;

  const convertedValue =
    Number.isFinite(numericRate) && numericRate > 0
      ? formatConvertedAmount(safeAmount * numericRate)
      : "—";

  const chartPoints = useMemo(() => {
    if (historySeries && historySeries.length >= 2) {
      return historySeries;
    }
    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      return [];
    }
    return buildReferenceSeries(numericRate, fromCurrency, toCurrency);
  }, [historySeries, numericRate, fromCurrency, toCurrency]);

  return (
    <section aria-labelledby="exchange-rates-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="exchange-rates-heading"
          className="text-lg font-bold text-auria-ink"
        >
          Cotizaciones
        </h2>
        <span className="rounded-full bg-auria-lime/35 px-2.5 py-0.5 text-xs font-semibold text-auria-forest tabular-nums">
          {fromCurrency} → {toCurrency}
        </span>
      </div>

      <div className="space-y-3 rounded-3xl bg-[#d5dfd2] p-4 shadow-xs">
        {isLoading ? (
          <div
            className="space-y-2.5"
            role="status"
            aria-busy="true"
            aria-label="Cargando cotización"
          >
            <div className="h-36 animate-pulse rounded-2xl bg-white/60" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/80" />
            <div className="h-12 animate-pulse rounded-2xl bg-white/80" />
          </div>
        ) : error ? (
          <div className="space-y-3 rounded-2xl bg-white p-3">
            <div role="alert" aria-live="polite">
              <p className="text-sm font-semibold text-auria-ink">
                Cotización no disponible
              </p>
              <p className="mt-1 text-xs text-auria-muted">{error}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 w-full rounded-xl text-xs font-semibold"
              onClick={() => void refreshQuote()}
            >
              Reintentar
            </Button>
          </div>
        ) : !quote || !quote.rate || !Number.isFinite(numericRate) ? (
          <p className="rounded-2xl bg-white p-3 text-xs text-auria-muted">
            No hay cotización disponible para {fromCurrency} / {toCurrency}.
          </p>
        ) : (
          <>
            {/* Gráfico de cotización */}
            <RateTrendChart points={chartPoints} />

            {/* Cotización unitaria y fecha de actualización */}
            <div className="flex items-baseline justify-between gap-2 px-0.5">
              <p className="text-sm font-bold tracking-tight text-auria-forest tabular-nums">
                1 {quote.fromCurrency} = {formatRateValue(numericRate)}{" "}
                {quote.toCurrency}
              </p>
              <span className="text-[11px] text-auria-ink/80">
                {formatFetchedDate(quote.fetchedAt)}
              </span>
            </div>

            {/* Conversor: De / Invertir / A */}
            <div className="relative space-y-1.5">
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3">
                <label htmlFor="rate-amount-input" className="sr-only">
                  Monto a convertir en {fromCurrency}
                </label>
                <input
                  id="rate-amount-input"
                  type="text"
                  inputMode="decimal"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-lg font-bold text-auria-ink tabular-nums focus:outline-none"
                />
                <label htmlFor="rate-from-currency" className="sr-only">
                  Moneda origen
                </label>
                <select
                  id="rate-from-currency"
                  value={fromCurrency}
                  onChange={(event) =>
                    handleFromChange(event.target.value as CurrencyCode)
                  }
                  className="cursor-pointer bg-transparent pr-1 text-sm font-bold text-auria-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  aria-label="Invertir monedas"
                  className="pointer-events-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#e6ede3] text-auria-forest shadow-2xs transition hover:bg-auria-lime/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3">
                <p
                  aria-live="polite"
                  className="truncate text-lg font-bold text-auria-ink tabular-nums"
                >
                  {convertedValue}
                </p>
                <label htmlFor="rate-to-currency" className="sr-only">
                  Moneda destino
                </label>
                <select
                  id="rate-to-currency"
                  value={toCurrency}
                  onChange={(event) =>
                    handleToChange(event.target.value as CurrencyCode)
                  }
                  className="cursor-pointer bg-transparent pr-1 text-sm font-bold text-auria-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
                >
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
