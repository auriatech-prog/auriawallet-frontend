export type CurrencyCode = "USD" | "EUR" | "ARS";

export interface WalletBalanceItem {
  currency: CurrencyCode;
  amount: string;
}

export interface WalletBalancesResponse {
  balances: WalletBalanceItem[];
}
