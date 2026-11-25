import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

// Tasas de referencia relativas a USD para simulación en frontend
const USD_REFERENCE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  ARS: 1150,
};

function getConversionRate(from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return 1;
  const fromInUsd = USD_REFERENCE_RATES[from] ?? 1;
  const toInUsd = USD_REFERENCE_RATES[to] ?? 1;
  return toInUsd / fromInUsd;
}

export function ConversionPage() {
  const navigate = useNavigate();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>("ARS");
  const [toCurrency, setToCurrency] = useState<CurrencyCode>("USD");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const rate = useMemo(
    () => getConversionRate(fromCurrency, toCurrency),
    [fromCurrency, toCurrency],
  );

  const convertedAmount = useMemo(() => {
    if (!isValidAmount) return 0;
    return Number((numericAmount * rate).toFixed(2));
  }, [isValidAmount, numericAmount, rate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (error) setError(null);
  };

  const handleSelectFromCurrency = (code: CurrencyCode) => {
    setFromCurrency(code);
    if (code === toCurrency) {
      const fallback = CURRENCY_LIST.find((item) => item !== code);
      if (fallback) setToCurrency(fallback);
    }
    if (error) setError(null);
  };

  const handleSelectToCurrency = (code: CurrencyCode) => {
    setToCurrency(code);
    if (code === fromCurrency) {
      const fallback = CURRENCY_LIST.find((item) => item !== code);
      if (fallback) setFromCurrency(fallback);
    }
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
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink">
            Convertir dinero
          </h1>
          <p className="text-xs text-auria-muted">
            Cambiá entre monedas con cotización estimada al instante
          </p>
        </div>
        <Link
          to="/operations"
          className="text-xs font-bold text-auria-forest hover:underline"
        >
          Cambiar operación
        </Link>
      </header>

      <Card className="space-y-4 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-2xs">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                    className={`cursor-pointer rounded-xl border py-2 text-xs font-bold tabular-nums transition ${
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
                    className={`cursor-pointer rounded-xl border py-2 text-xs font-bold tabular-nums transition ${
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

          {/* Resumen de cotización y resultado */}
          <div className="space-y-2 rounded-2xl bg-auria-cream/70 p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-auria-muted">Cotización de referencia</span>
              <span className="font-semibold text-auria-ink tabular-nums">
                1 {fromCurrency} ={" "}
                {rate >= 1 ? rate.toFixed(2) : rate.toFixed(6)} {toCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-auria-border/60 pt-2">
              <span className="font-medium text-auria-muted">
                Vas a recibir
              </span>
              <span className="text-base font-bold text-auria-forest tabular-nums">
                {formatCurrencyAmount(convertedAmount, toCurrency)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold"
          >
            Confirmar conversión
          </Button>
        </form>
      </Card>
    </div>
  );
}
