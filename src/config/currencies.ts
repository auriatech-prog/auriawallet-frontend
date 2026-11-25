import type { CurrencyCode } from "../types/wallet";

export interface CurrencyConfig {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["USD", "EUR", "ARS"];

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    label: "Dólar estadounidense",
    symbol: "US$",
    locale: "es-AR",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    label: "Euro",
    symbol: "€",
    locale: "es-AR",
    decimals: 2,
  },
  ARS: {
    code: "ARS",
    label: "Peso argentino",
    symbol: "$",
    locale: "es-AR",
    decimals: 2,
  },
};

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

export function formatCurrencyAmount(
  amount: string | number,
  currency: CurrencyCode,
): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  const config = CURRENCY_CONFIG[currency];

  if (Number.isNaN(numeric)) {
    return `${config.symbol} 0,00`;
  }

  const formattedNumber = new Intl.NumberFormat(config.locale, {
    style: "decimal",
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(numeric);

  return `${config.symbol} ${formattedNumber}`;
}
