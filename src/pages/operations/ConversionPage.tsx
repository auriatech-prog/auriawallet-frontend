import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  CURRENCY_CONFIG,
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { walletService } from "@/services/walletService";
import type { CurrencyCode, WalletBalanceItem } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

// Tasas de referencia relativas a USD para simulación en frontend
const USD_REFERENCE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  ARS: 1150,
};

const QUICK_AMOUNTS_BY_CURRENCY: Record<CurrencyCode, number[]> = {
  ARS: [10000, 25000, 50000, 100000],
  USD: [50, 100, 250, 500],
  EUR: [50, 100, 250, 500],
};

function getConversionRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  const fromInUsd = USD_REFERENCE_RATES[from] ?? 1;
  const toInUsd = USD_REFERENCE_RATES[to] ?? 1;
  return toInUsd / fromInUsd;
}

function parsePositiveAmount(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatQuickAmount(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency];
  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${config.symbol} ${formatted}`;
}

export function ConversionPage() {
  const navigate = useNavigate();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("ARS");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState("");
  const [balances, setBalances] = useState<WalletBalanceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    walletService
      .getBalances()
      .then((response) => {
        if (isActive) {
          setBalances(response.balances);
        }
      })
      .catch(() => {
        if (isActive) {
          setBalances(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const numericAmount = parsePositiveAmount(amount);
  const isValidAmount = numericAmount !== null;

  const balanceByCurrency = new Map(
    (balances ?? []).map((item) => [item.currency, Number(item.amount)]),
  );
  const availableFromBalance = balanceByCurrency.get(fromCurrency) ?? null;
  const exceedsBalance =
    isValidAmount &&
    availableFromBalance !== null &&
    Number.isFinite(availableFromBalance) &&
    numericAmount > availableFromBalance;

  const rate = useMemo(
    () => getConversionRate(fromCurrency, toCurrency),
    [fromCurrency, toCurrency],
  );

  const convertedAmount = useMemo(() => {
    if (!isValidAmount) return 0;
    return Number((numericAmount * rate).toFixed(2));
  }, [isValidAmount, numericAmount, rate]);

  const formattedRateValue = rate >= 1 ? rate.toFixed(2) : rate.toFixed(6);
  const formattedConvertedAmount = formatCurrencyAmount(
    convertedAmount,
    toCurrency,
  );
  const formattedSourceAmount = formatCurrencyAmount(
    isValidAmount ? numericAmount : 0,
    fromCurrency,
  );
  const quickAmounts = QUICK_AMOUNTS_BY_CURRENCY[fromCurrency];

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (error) setError(null);
  };

  const handleSelectFromCurrency = (code: CurrencyCode) => {
    if (code === fromCurrency) return;
    if (code === toCurrency) {
      setToCurrency(fromCurrency);
    }
    setFromCurrency(code);
    if (error) setError(null);
  };

  const handleSelectToCurrency = (code: CurrencyCode) => {
    if (code === toCurrency) return;
    if (code === fromCurrency) {
      setFromCurrency(toCurrency);
    }
    setToCurrency(code);
    if (error) setError(null);
  };

  const handleQuickAmountSelect = (presetAmount: number) => {
    setAmount(String(presetAmount));
    if (error) setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fromCurrency === toCurrency) {
      setError("Elegí dos monedas distintas para convertir.");
      return;
    }

    if (!isValidAmount) {
      setError("Ingresá un monto mayor a 0.");
      return;
    }

    if (exceedsBalance) {
      setError(`Supera tu saldo disponible en ${fromCurrency}.`);
      return;
    }

    setError(null);
    navigate("/transactions/confirmation", {
      state: {
        operationType: "convert",
        title: "Convertir dinero",
        amount: numericAmount,
        currency: fromCurrency,
        targetCurrency: toCurrency,
        convertedAmount,
        rate,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2 lg:max-w-5xl lg:space-y-6">
      <header className="flex items-center justify-between gap-3 lg:pt-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight">
          Convertir dinero
        </h1>
        <Link
          to="/operations"
          className="text-xs font-bold text-auria-forest no-underline hover:underline lg:text-sm"
        >
          ← Operaciones
        </Link>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:space-y-0"
      >
        {/* Columna izquierda: Configuración de origen, monto y destino */}
        <Card className="space-y-4 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-2xs lg:col-span-7 lg:space-y-5 lg:p-6">
          {/* Moneda de origen */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-auria-muted">
              Moneda de origen
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCY_LIST.map((code) => {
                const selected = fromCurrency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectFromCurrency(code)}
                    aria-pressed={selected}
                    className={`min-h-10 cursor-pointer rounded-xl border py-2 text-xs font-bold tabular-nums transition lg:min-h-11 lg:text-sm ${
                      selected
                        ? "border-auria-forest bg-auria-forest text-white"
                        : "border-auria-border bg-white text-auria-ink hover:bg-auria-cream"
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monto en moneda de origen */}
          <div className="space-y-2">
            <Input
              label={`Monto en ${fromCurrency}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                if (error) setError(null);
              }}
              error={error ?? undefined}
            />

            <div className="space-y-1.5">
              <div
                aria-label="Montos sugeridos"
                className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5"
              >
                {quickAmounts.map((preset) => {
                  const isPresetSelected =
                    isValidAmount && numericAmount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickAmountSelect(preset)}
                      className={`cursor-pointer rounded-full border px-1.5 py-1 text-center text-[10px] font-semibold whitespace-nowrap tabular-nums transition sm:px-2.5 sm:text-[11px] ${
                        isPresetSelected
                          ? "border-auria-forest bg-auria-lime-soft text-auria-forest"
                          : "border-auria-border bg-auria-page/60 text-auria-muted hover:border-auria-forest/40 hover:text-auria-ink"
                      }`}
                    >
                      {formatQuickAmount(preset, fromCurrency)}
                    </button>
                  );
                })}
              </div>

              {availableFromBalance !== null &&
                Number.isFinite(availableFromBalance) && (
                  <p className="text-[11px] text-auria-muted tabular-nums">
                    Disponible:{" "}
                    <span className="font-semibold text-auria-ink">
                      {formatCurrencyAmount(availableFromBalance, fromCurrency)}
                    </span>
                  </p>
                )}
            </div>
          </div>

          {/* Botón invertir monedas */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-px flex-1 bg-auria-border/70" />
            <button
              type="button"
              onClick={handleSwapCurrencies}
              aria-label="Invertir moneda de origen y destino"
              className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-auria-border bg-white px-3.5 text-xs font-bold text-auria-forest shadow-2xs transition hover:bg-auria-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest"
            >
              <span aria-hidden="true">⇅</span>
              Invertir
            </button>
            <div className="h-px flex-1 bg-auria-border/70" />
          </div>

          {/* Moneda de destino */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-auria-muted">
              Moneda de destino
            </p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCY_LIST.map((code) => {
                const selected = toCurrency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectToCurrency(code)}
                    aria-pressed={selected}
                    className={`min-h-10 cursor-pointer rounded-xl border py-2 text-xs font-bold tabular-nums transition lg:min-h-11 lg:text-sm ${
                      selected
                        ? "border-auria-forest bg-auria-forest text-white"
                        : "border-auria-border bg-white text-auria-ink hover:bg-auria-cream"
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumen móvil (< lg) */}
          <div className="space-y-2 rounded-2xl bg-auria-cream/70 p-3.5 text-xs lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-auria-muted">Cotización de referencia</span>
              <span className="font-semibold text-auria-ink tabular-nums">
                1 {fromCurrency} = {formattedRateValue} {toCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-auria-border/60 pt-2">
              <span className="font-medium text-auria-muted">
                Vas a recibir
              </span>
              <span className="text-base font-bold text-auria-forest tabular-nums">
                {formattedConvertedAmount}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold lg:hidden"
          >
            Confirmar conversión
          </Button>
        </Card>

        {/* Columna derecha en desktop: Resumen de conversión */}
        <Card className="hidden rounded-3xl border border-auria-border bg-auria-card p-6 shadow-2xs lg:col-span-5 lg:block lg:space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-auria-ink">
              Resumen de conversión
            </h2>
            <p className="text-xs text-auria-muted">
              Revisá la tasa estimada y el importe a recibir.
            </p>
          </div>

          <dl className="space-y-3 border-y border-auria-border py-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Par de monedas</dt>
              <dd className="font-bold text-auria-ink tabular-nums">
                {fromCurrency} → {toCurrency}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Cotización de referencia</dt>
              <dd className="font-semibold text-auria-ink tabular-nums">
                1 {fromCurrency} = {formattedRateValue} {toCurrency}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Monto a convertir</dt>
              <dd className="font-semibold text-auria-ink tabular-nums">
                {formattedSourceAmount}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <dt className="font-semibold text-auria-ink">Vas a recibir</dt>
              <dd className="text-lg font-bold text-auria-forest tabular-nums">
                {formattedConvertedAmount}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold"
          >
            Confirmar conversión
          </Button>
        </Card>
      </form>
    </div>
  );
}
