import { config } from "./config";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import type { Hex } from "viem";
import { tokenBridgeAbi } from "../abis/tokenBridge";

const Contract = {
  address: "0xa2236475db73775aD69aE4b4099Ac4B8FF374085" as Hex,

  async tokenTransfer(
    token: Hex,
    amount: bigint,
    receiver: Hex
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: tokenBridgeAbi,
        address: this.address,
        functionName: "tokenTransfer",
        args: [token, amount, receiver],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async tokenTransferETH(amount: bigint, receiver: Hex): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: tokenBridgeAbi,
        address: this.address,
        functionName: "tokenTransferETH",
        args: [receiver],
        value: amount,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },
};

export { Contract };
