import { Card, CurrencyBadge } from "@/components/ui";
import { CURRENCY_CONFIG, formatCurrencyAmount } from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

interface BalanceCardProps {
  currency: CurrencyCode;
  amount: string | null;
  isVisible: boolean;
}

export function BalanceCard({ currency, amount, isVisible }: BalanceCardProps) {
  const currencyConfig = CURRENCY_CONFIG[currency];

  return (
    <Card className="border border-auria-border p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CurrencyBadge
            currency={currency}
            className="shrink-0 px-3 py-1.5 text-sm"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-auria-ink">
              {currencyConfig.label}
            </h3>
            <p className="mt-0.5 text-xs text-auria-muted">Saldo disponible</p>
          </div>
        </div>
        <p className="shrink-0 text-right text-base font-bold tracking-tight text-auria-forest sm:text-lg">
          {amount === null
            ? "—"
            : isVisible
              ? formatCurrencyAmount(amount, currency)
              : "••••••"}
        </p>
      </div>
      {amount === null && (
        <p className="mt-3 text-xs text-auria-muted">
          Este saldo no vino en la respuesta del servidor.
        </p>
      )}
    </Card>
  );
}
