import { CURRENCY_CONFIG, formatCurrencyAmount } from "@/config/currencies";
import type { CurrencyCode } from "@/types/wallet";

interface BalanceCardProps {
  currency: CurrencyCode;
  amount: string | null;
  isVisible: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function CurrencyFlag({ currency }: { currency: CurrencyCode }) {
  if (currency === "ARS") {
    return (
      <svg
        className="h-9 w-9 shrink-0 rounded-full border border-auria-border lg:h-8 lg:w-8"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <rect width="36" height="12" y="0" fill="#74ACDF" />
        <rect width="36" height="12" y="12" fill="#FFFFFF" />
        <rect width="36" height="12" y="24" fill="#74ACDF" />
        <circle cx="18" cy="18" r="3.2" fill="#F6B40E" />
      </svg>
    );
  }

  if (currency === "USD") {
    return (
      <svg
        className="h-9 w-9 shrink-0 rounded-full border border-auria-border lg:h-8 lg:w-8"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <rect width="36" height="36" fill="#FFFFFF" />
        <rect width="36" height="4" y="0" fill="#B22234" />
        <rect width="36" height="4" y="8" fill="#B22234" />
        <rect width="36" height="4" y="16" fill="#B22234" />
        <rect width="36" height="4" y="24" fill="#B22234" />
        <rect width="36" height="4" y="32" fill="#B22234" />
        <rect width="18" height="19" x="0" y="0" fill="#3C3B6E" />
      </svg>
    );
  }

  return (
    <svg
      className="h-9 w-9 shrink-0 rounded-full border border-auria-border lg:h-8 lg:w-8"
      viewBox="0 0 36 36"
      aria-hidden="true"
    >
      <rect width="36" height="36" fill="#003399" />
      <circle
        cx="18"
        cy="18"
        r="9"
        fill="none"
        stroke="#FFCC00"
        strokeWidth="2.2"
        strokeDasharray="1.8 2.9"
      />
    </svg>
  );
}

export function BalanceCard({
  currency,
  amount,
  isVisible,
  isSelected = false,
  onSelect,
}: BalanceCardProps) {
  const currencyConfig = CURRENCY_CONFIG[currency];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-auria-card px-4 py-3.5 text-left shadow-xs transition hover:border-auria-forest/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-auria-forest lg:h-full lg:flex-col lg:items-start lg:justify-between lg:gap-2 lg:px-3.5 lg:py-3 ${
        isSelected
          ? "border-auria-forest/45 bg-auria-lime-soft/20 ring-1 ring-auria-forest/20"
          : "border-auria-border"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3.5 lg:w-full lg:gap-2.5">
        <CurrencyFlag currency={currency} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-auria-ink">{currency}</p>
          <p className="truncate text-xs text-auria-muted lg:hidden">
            {currencyConfig.label}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:w-full lg:justify-between lg:pt-0.5">
        <p className="text-sm font-semibold tracking-tight text-auria-ink tabular-nums sm:text-base lg:text-sm lg:font-bold">
          {amount === null
            ? "—"
            : isVisible
              ? formatCurrencyAmount(amount, currency)
              : "••••••"}
        </p>
        <svg
          className="h-4 w-4 text-auria-muted lg:hidden"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}
