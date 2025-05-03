import { config } from "./config";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { parseEther, type Hex } from "viem";
import { tokenBridgeAbi } from "../abis/tokenBridge";
import { messageBridgeAbi } from "../abis/messageBridge";
import type { NightlyConnectIotaAdapter } from "@nightlylabs/wallet-selector-iota";
import { Transaction } from "@iota/iota-sdk/transactions";
import { bcs } from "@iota/iota-sdk/bcs";
import { CoinContract } from "./erc20";
import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";

const HoleskyContract = {
  tokenBridge: "0xAe140a39625119551A1E9e4E82FAF354B48Ec948" as Hex,
  messageBridge: "0xDDd09e89D654F284da540B8AbC5C6Fe8ED330d8b" as Hex,

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
        functionName: "tokenTranfer",
        args: [token, amount, toChain, receiver],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      console.log(error);

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
        functionName: "tokenTranferETH",
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
        value: parseEther("0.001"),
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
  package: "0x" as Hex,
  tokenBridge: "0x" as Hex,
  messageBridge: "0x" as Hex,

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

      let coinTransfer;

      if (coinType === IOTA_TYPE_ARG) {
        const [coinResult] = transaction.splitCoins(transaction.gas, [10_000]);
        coinTransfer = coinResult;
      } else {
        const coins = await CoinContract.getCoins(
          accounts[0].address,
          coinType
        );
        const coinsObject = coins.map((coin) => coin.coinObjectId);

        if (coinsObject.length === 0) return null;
        const destinationInCoin = coinsObject[0];

        if (coinsObject.length > 1) {
          const [, ...otherInCoins] = coinsObject;
          transaction.mergeCoins(destinationInCoin, otherInCoins);
        }
        const [coinResult] = transaction.splitCoins(destinationInCoin, [
          transaction.pure.u64(amount),
        ]);

        coinTransfer = coinResult;
      }

      transaction.moveCall({
        target: `${this.package}::token_bridge::token_tranfer`,
        arguments: [
          transaction.object(this.tokenBridge),
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

  async sendMessage(
    adapter: NightlyConnectIotaAdapter,
    toChain: number,
    to: Hex,
    payload: Hex
  ): Promise<Hex | null> {
    const accounts = await adapter.getAccounts();
    if (accounts.length === 0) return null;
    try {
      const transaction = new Transaction();

      const [coinFee] = transaction.splitCoins(transaction.gas, [1_000_000]);

      transaction.moveCall({
        target: `${this.package}::message_bridge::send_message`,
        arguments: [
          transaction.object(this.messageBridge),
          transaction.object(coinFee),
          transaction.pure.u64(toChain),
          bcs.vector(bcs.U8).serialize(new TextEncoder().encode(to)),
          bcs.vector(bcs.U8).serialize(new TextEncoder().encode(payload)),
        ],
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
