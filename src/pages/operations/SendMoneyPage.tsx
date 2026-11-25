import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

export function SendMoneyPage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>("ARS");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>(
    {},
  );

  const numericAmount = Number(amount);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      nextErrors.recipient =
        "Ingresá el alias, CBU/CVU o email del destinatario.";
    }
    if (!isValidAmount) {
      nextErrors.amount = "Ingresá un monto mayor a 0.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    navigate("/transactions/confirmation", {
      state: {
        operationType: "send",
        title: "Enviar dinero",
        recipient: recipient.trim(),
        amount: numericAmount,
        currency,
        note: note.trim(),
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink">
            Enviar dinero
          </h1>
          <p className="text-xs text-auria-muted">
            Transferí fondos a otro usuario o cuenta
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
            label="Destinatario"
            type="text"
            placeholder="Alias, CBU/CVU o email"
            value={recipient}
            onChange={(event) => {
              setRecipient(event.target.value);
              if (errors.recipient) {
                setErrors((prev) => ({ ...prev, recipient: undefined }));
              }
            }}
            error={errors.recipient}
          />

          <Input
            label="Monto a enviar"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              if (errors.amount) {
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }
            }}
            error={errors.amount}
          />

          <Input
            label="Motivo o referencia (opcional)"
            type="text"
            placeholder="Ej.: Pago compartido"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="rounded-2xl bg-auria-cream/70 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-auria-muted">Monto a enviar</span>
              <span className="text-sm font-bold text-auria-ink tabular-nums">
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
            Revisar envío
          </Button>
        </form>
      </Card>
    </div>
  );
}
