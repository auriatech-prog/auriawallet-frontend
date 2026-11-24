import { apiClient } from "./apiClient";
import type { WalletBalancesResponse } from "../types/wallet";

export const walletService = {
  getBalances(): Promise<WalletBalancesResponse> {
    return apiClient.get<WalletBalancesResponse>("/api/wallet/balances");
  },
};
