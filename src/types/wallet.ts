export type CurrencyCode = "USD" | "EUR" | "ARS";

export interface WalletBalanceItem {
  currency: CurrencyCode;
  amount: string;
}

export interface WalletBalancesResponse {
  balances: WalletBalanceItem[];
}

export type TransactionType = "buy" | "sell" | "convert" | string;

export interface TransactionItem {
  id: string;
  type: TransactionType;
  amount: string;
  currency: CurrencyCode;
  createdAt: string;
  status?: string;
  fromCurrency?: CurrencyCode;
  toCurrency?: CurrencyCode;
}

export interface TransactionsResponse {
  transactions?: TransactionItem[];
  items?: TransactionItem[];
  movements?: TransactionItem[];
  data?: TransactionItem[];
}

export interface ExchangeRateResponse {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: string;
  provider?: string;
  fetchedAt: string;
}
