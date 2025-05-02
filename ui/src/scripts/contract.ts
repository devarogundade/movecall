import { config } from "./config";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import type { Hex } from "viem";
import { tokenBridgeAbi } from "../abis/tokenBridge";
import { messageBridgeAbi } from "../abis/messageBridge";
import type { NightlyConnectIotaAdapter } from "@nightlylabs/wallet-selector-iota";
import { Transaction } from "@iota/iota-sdk/transactions";
import { bcs } from "@iota/iota-sdk/bcs";
import { CoinContract } from "./erc20";

const HoleskyContract = {
  tokenBridge: "0x" as Hex,
  messageBridge: "0x" as Hex,

  async tokenTransfer(
    token: Hex,
    amount: bigint,
    toChain: number,
    receiver: Hex
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: tokenBridgeAbi,
        address: this.tokenBridge,
        functionName: "tokenTransfer",
        args: [token, amount, toChain, receiver],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async tokenTransferETH(
    amount: bigint,
    toChain: number,
    receiver: Hex
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: tokenBridgeAbi,
        address: this.tokenBridge,
        functionName: "tokenTransferETH",
        args: [toChain, receiver],
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

  async sendMessage(
    toChain: number,
    to: Hex,
    payload: Hex
  ): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: messageBridgeAbi,
        address: this.messageBridge,
        functionName: "sendMessage",
        args: [toChain, to, payload],
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

const IOTAContract = {
  address: "0x" as Hex,
  state: "0x" as Hex,

  async transferToken(
    adapter: NightlyConnectIotaAdapter,
    amount: bigint,
    coinType: string,
    coinMetadata: string,
    toChain: number,
    receiver: string
  ): Promise<Hex | null> {
    const accounts = await adapter.getAccounts();
    if (accounts.length === 0) return null;
    try {
      const transaction = new Transaction();

      const coins = await CoinContract.getCoins(accounts[0].address, coinType);
      const coinsObject = coins.map((coin) => coin.coinObjectId);

      if (coinsObject.length === 0) return null;
      const destinationInCoin = coinsObject[0];

      if (coinsObject.length > 1) {
        const [, ...otherInCoins] = coinsObject;
        transaction.mergeCoins(destinationInCoin, otherInCoins);
      }
      const [coinTransfer] = transaction.splitCoins(destinationInCoin, [
        transaction.pure.u64(amount),
      ]);

      transaction.moveCall({
        target: `${this.address}::token_bridge::token_tranfer`,
        arguments: [
          transaction.object(this.state),
          transaction.object(coinTransfer),
          transaction.object(coinMetadata),
          transaction.pure.u64(toChain),
          bcs.vector(bcs.U8).serialize(new TextEncoder().encode(receiver)),
        ],
        typeArguments: [coinType],
      });

      const { digest } = await adapter.signAndExecuteTransaction({
        transaction,
        chain: "iota:testnet",
        account: accounts[0],
      });

      return digest as Hex;
    } catch (error) {
      return null;
    }
  },
};

export { HoleskyContract, IOTAContract };
