import { Card, CurrencyBadge } from "@/components/ui";
import { CURRENCY_CONFIG, formatCurrencyAmount } from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

interface BalanceCardProps {
  currency: CurrencyCode;
  amount: string | null;
  isVisible: boolean;
}

const currencySurfaceClasses: Record<CurrencyCode, string> = {
  ARS: "border-auria-border bg-auria-page",
  USD: "border-auria-lime/50 bg-auria-lime-soft/55",
  EUR: "border-auria-forest/10 bg-auria-forest/5",
};

const currencyBadgeClasses: Record<CurrencyCode, string> = {
  ARS: "bg-auria-cream text-auria-ink",
  USD: "bg-auria-lime-soft text-auria-forest",
  EUR: "bg-auria-page text-auria-forest",
};

export function BalanceCard({ currency, amount, isVisible }: BalanceCardProps) {
  const currencyConfig = CURRENCY_CONFIG[currency];

  return (
    <Card
      className={`border p-4 shadow-sm transition-colors sm:p-5 ${currencySurfaceClasses[currency]}`}
    >
      <div className="flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CurrencyBadge
            currency={currency}
            className={`shrink-0 px-3 py-1.5 text-sm ${currencyBadgeClasses[currency]}`}
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-auria-ink">
              {currencyConfig.label}
            </h3>
            <p className="mt-0.5 text-xs text-auria-muted">Saldo disponible</p>
          </div>
        </div>
        <p className="w-full wrap-break-word text-right text-sm font-bold tracking-tight text-auria-forest min-[480px]:w-auto min-[480px]:text-base sm:text-lg">
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
