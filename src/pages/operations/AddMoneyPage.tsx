import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

export function AddMoneyPage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>("ARS");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Transferencia bancaria");
  const [error, setError] = useState<string | null>(null);

  const numericAmount = Number(amount);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;

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
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink">
            Añadir dinero
          </h1>
          <p className="text-xs text-auria-muted">
            Cargá saldo en la moneda que elijas
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
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-auria-muted">Moneda</p>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCY_LIST.map((code) => {
                const selected = currency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
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
              <option value="Transferencia bancaria">
                Transferencia bancaria
              </option>
              <option value="Tarjeta de débito">Tarjeta de débito</option>
              <option value="Saldo de referencia">Saldo de referencia</option>
            </select>
          </div>

          <div className="rounded-2xl bg-auria-cream/70 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-auria-muted">Total a acreditar</span>
              <span className="text-sm font-bold text-auria-forest tabular-nums">
                {formatCurrencyAmount(
                  isValidAmount ? numericAmount : 0,
                  currency,
                )}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold"
          >
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}
