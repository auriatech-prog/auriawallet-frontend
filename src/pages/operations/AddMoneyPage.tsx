import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

const DEPOSIT_METHODS = [
  {
    value: "Transferencia bancaria",
    label: "Transferencia bancaria",
    hint: "Ingresá fondos desde tu cuenta bancaria o CBU/CVU habilitado.",
  },
  {
    value: "Depósito",
    label: "Depósito",
    hint: "Registrá el ingreso correspondiente a un depósito en la moneda elegida.",
  },
] as const;

const QUICK_AMOUNTS_BY_CURRENCY: Record<CurrencyCode, number[]> = {
  ARS: [10000, 25000, 50000, 100000],
  USD: [50, 100, 250, 500],
  EUR: [50, 100, 250, 500],
};

export function AddMoneyPage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>("ARS");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>(DEPOSIT_METHODS[0].value);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const selectedMethodMeta =
    DEPOSIT_METHODS.find((item) => item.value === method) ?? DEPOSIT_METHODS[0];
  const quickAmounts = QUICK_AMOUNTS_BY_CURRENCY[currency];
  const formattedTotal = formatCurrencyAmount(
    isValidAmount ? numericAmount : 0,
    currency,
  );

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    setCurrency(nextCurrency);
    if (error) setError(null);
  };

  const handleQuickAmountSelect = (presetAmount: number) => {
    setAmount(String(presetAmount));
    if (error) setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidAmount) {
      setError("Ingresá un monto mayor a 0.");
      return;
    }

    setError(null);
    navigate("/transactions/confirmation", {
      state: {
        operationType: "add",
        title: "Añadir dinero",
        amount: numericAmount,
        currency,
        method,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2 lg:max-w-5xl lg:space-y-6">
      <header className="flex items-center justify-between gap-3 lg:pt-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight">
          Añadir dinero
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
        {/* Columna izquierda: Datos del ingreso */}
        <Card className="space-y-4 rounded-3xl border border-auria-border bg-auria-card p-4 shadow-2xs lg:col-span-7 lg:space-y-5 lg:p-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-auria-muted">Moneda</p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCY_LIST.map((code) => {
                const selected = currency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCurrencyChange(code)}
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

          <div className="space-y-2">
            <Input
              label="Monto a añadir"
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

            <div
              aria-label="Montos sugeridos"
              className="flex flex-wrap items-center gap-1.5"
            >
              {quickAmounts.map((preset) => {
                const isPresetSelected =
                  isValidAmount && numericAmount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickAmountSelect(preset)}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums transition ${
                      isPresetSelected
                        ? "border-auria-forest bg-auria-lime-soft text-auria-forest"
                        : "border-auria-border bg-auria-page/60 text-auria-muted hover:border-auria-forest/40 hover:text-auria-ink"
                    }`}
                  >
                    +{formatCurrencyAmount(preset, currency)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="add-money-method"
              className="block text-xs font-semibold text-auria-muted"
            >
              Medio de ingreso
            </label>
            <select
              id="add-money-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-auria-border bg-white px-3 text-sm font-medium text-auria-ink focus-visible:outline-2 focus-visible:outline-auria-forest"
            >
              {DEPOSIT_METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-auria-muted">
              {selectedMethodMeta.hint}
            </p>
          </div>

          <div className="rounded-2xl bg-auria-cream/70 p-3 text-xs lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-auria-muted">Total a acreditar</span>
              <span className="text-sm font-bold text-auria-forest tabular-nums">
                {formattedTotal}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold lg:hidden"
          >
            Continuar
          </Button>
        </Card>

        {/* Columna derecha en desktop: Resumen y confirmación */}
        <Card className="hidden rounded-3xl border border-auria-border bg-auria-card p-6 shadow-2xs lg:col-span-5 lg:block lg:space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-auria-ink">
              Resumen del ingreso
            </h2>
            <p className="text-xs text-auria-muted">
              Revisá los datos antes de ir a la confirmación.
            </p>
          </div>

          <dl className="space-y-3 border-y border-auria-border py-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Moneda</dt>
              <dd className="font-bold text-auria-ink tabular-nums">
                {currency}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Medio de ingreso</dt>
              <dd className="text-right font-semibold text-auria-ink">
                {selectedMethodMeta.label}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <dt className="font-semibold text-auria-ink">
                Total a acreditar
              </dt>
              <dd className="text-lg font-bold text-auria-forest tabular-nums">
                {formattedTotal}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold"
          >
            Continuar
          </Button>
        </Card>
      </form>
    </div>
  );
}
