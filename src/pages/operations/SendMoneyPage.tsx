import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Card, Input } from "@/components/ui";
import {
  SUPPORTED_CURRENCIES,
  formatCurrencyAmount,
} from "@/config/currencies";
import { walletService } from "@/services/walletService";
import type { CurrencyCode, WalletBalanceItem } from "@/types/wallet";

const CURRENCY_LIST: CurrencyCode[] = [...SUPPORTED_CURRENCIES];

const QUICK_AMOUNTS_BY_CURRENCY: Record<CurrencyCode, number[]> = {
  ARS: [5000, 15000, 30000, 50000],
  USD: [25, 50, 100, 250],
  EUR: [25, 50, 100, 250],
};

function parsePositiveAmount(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function SendMoneyPage() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<CurrencyCode>("ARS");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [balances, setBalances] = useState<WalletBalanceItem[] | null>(null);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>(
    {},
  );

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
  const availableInCurrency = balanceByCurrency.get(currency) ?? null;
  const exceedsBalance =
    isValidAmount &&
    availableInCurrency !== null &&
    Number.isFinite(availableInCurrency) &&
    numericAmount > availableInCurrency;

  const formattedAmount = formatCurrencyAmount(
    isValidAmount ? numericAmount : 0,
    currency,
  );
  const quickAmounts = QUICK_AMOUNTS_BY_CURRENCY[currency];

  const handleCurrencyChange = (nextCurrency: CurrencyCode) => {
    setCurrency(nextCurrency);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleQuickAmountSelect = (presetAmount: number) => {
    setAmount(String(presetAmount));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      nextErrors.recipient =
        "Ingresá el alias, CBU/CVU o email del destinatario.";
    }
    if (!isValidAmount) {
      nextErrors.amount = "Ingresá un monto mayor a 0.";
    } else if (exceedsBalance) {
      nextErrors.amount = `Supera tu saldo disponible en ${currency}.`;
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
    <div className="mx-auto w-full max-w-110 space-y-4 pb-2 lg:max-w-5xl lg:space-y-6">
      <header className="flex items-center justify-between gap-3 lg:pt-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-auria-ink lg:text-[26px] lg:leading-tight">
          Enviar dinero
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
        {/* Columna izquierda: Datos del envío */}
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

          <div className="space-y-2">
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

            <div className="flex flex-wrap items-center justify-between gap-2">
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
                      {formatCurrencyAmount(preset, currency)}
                    </button>
                  );
                })}
              </div>

              {availableInCurrency !== null &&
                Number.isFinite(availableInCurrency) && (
                  <p className="text-[11px] text-auria-muted tabular-nums">
                    Disponible:{" "}
                    <span className="font-semibold text-auria-ink">
                      {formatCurrencyAmount(availableInCurrency, currency)}
                    </span>
                  </p>
                )}
            </div>
          </div>

          <Input
            label="Motivo o referencia (opcional)"
            type="text"
            placeholder="Ej.: Pago compartido"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="rounded-2xl bg-auria-cream/70 p-3 text-xs lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-auria-muted">Monto a enviar</span>
              <span className="text-sm font-bold text-auria-ink tabular-nums">
                {formattedAmount}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold lg:hidden"
          >
            Revisar envío
          </Button>
        </Card>

        {/* Columna derecha en desktop: Resumen del envío */}
        <Card className="hidden rounded-3xl border border-auria-border bg-auria-card p-6 shadow-2xs lg:col-span-5 lg:block lg:space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-auria-ink">
              Resumen del envío
            </h2>
            <p className="text-xs text-auria-muted">
              Verificá el destinatario y el importe antes de continuar.
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
              <dt className="text-auria-muted">Destinatario</dt>
              <dd className="max-w-52 truncate text-right font-semibold text-auria-ink">
                {recipient.trim() || "Sin definir"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-auria-muted">Motivo</dt>
              <dd className="max-w-52 truncate text-right text-auria-ink">
                {note.trim() || "Sin motivo"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <dt className="font-semibold text-auria-ink">Monto a enviar</dt>
              <dd className="text-lg font-bold text-auria-forest tabular-nums">
                {formattedAmount}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            className="min-h-12 w-full rounded-xl text-sm font-semibold"
          >
            Revisar envío
          </Button>
        </Card>
      </form>
    </div>
  );
}
