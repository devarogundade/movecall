import { defineStore } from "pinia";
import type { Hex } from "viem";

export const useWalletStore = defineStore("wallet", {
  state: () => ({
    holeskyAddress: null as Hex | null,
    iotaAddress: null as string | null,
    balances: {} as Record<Hex, number>,
    approvals: {} as Record<Hex, number>,
  }),
  actions: {
    setHoleskyAddress(holeskyAddress: Hex | null) {
      this.holeskyAddress = holeskyAddress;
    },
    setIotaAddress(iotaAddress: string | null) {
      this.iotaAddress = iotaAddress;
    },
    setBalance(token: Hex, balance: number) {
      this.balances[token] = balance;
    },
    setApproval(token: Hex, approval: number) {
      this.approvals[token] = approval;
    },
  },
});
