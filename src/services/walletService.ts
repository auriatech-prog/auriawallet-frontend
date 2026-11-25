import { apiClient } from "./apiClient";
import type {
  CurrencyCode,
  ExchangeRateResponse,
  TransactionItem,
  TransactionsResponse,
  WalletBalancesResponse,
} from "../types/wallet";

export interface GetTransactionsParams {
  limit?: number;
  offset?: number;
}

export interface GetExchangeRateParams {
  from: CurrencyCode;
  to: CurrencyCode;
}

function extractTransactions(
  payload: TransactionsResponse | TransactionItem[],
): TransactionItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return (
    payload.transactions ??
    payload.items ??
    payload.movements ??
    payload.data ??
    []
  );
}

export const walletService = {
  getBalances(): Promise<WalletBalancesResponse> {
    return apiClient.get<WalletBalancesResponse>("/api/wallet/balances");
  },

  async getTransactions(
    params: GetTransactionsParams = {},
  ): Promise<TransactionItem[]> {
    const limit = params.limit ?? 5;
    const offset = params.offset ?? 0;
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const response = await apiClient.get<
      TransactionsResponse | TransactionItem[]
    >(`/api/transactions?${searchParams.toString()}`);

    return extractTransactions(response);
  },

  getExchangeRate({
    from,
    to,
  }: GetExchangeRateParams): Promise<ExchangeRateResponse> {
    const searchParams = new URLSearchParams({
      from,
      to,
    });

    return apiClient.get<ExchangeRateResponse>(
      `/api/exchange-rates?${searchParams.toString()}`,
    );
  },
};
