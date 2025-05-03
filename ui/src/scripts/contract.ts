import { config, iotaClient } from "./config";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { parseEther, type Hex } from "viem";
import { tokenBridgeAbi } from "../abis/tokenBridge";
import { messageBridgeAbi } from "../abis/messageBridge";
import type { NightlyConnectIotaAdapter } from "@nightlylabs/wallet-selector-iota";
import { Transaction } from "@iota/iota-sdk/transactions";
import { bcs } from "@iota/iota-sdk/bcs";
import { CoinContract } from "./erc20";
import { IOTA_COIN } from "./constants";

const HoleskyContract = {
  tokenBridge: "0x3Fc4398f342f5458E1783DebB909558c3e9A0444" as Hex,
  messageBridge: "0x0F7FCD84cd58b56B6c9E7BA16eBB724dc6d0bcc8" as Hex,

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
  package: "0xf4f35fe7f876cb5d0b16dcb8754115ed7dd57b422edf2a85f401cb8e8bacc6d3",
  tokenBridge:
    "0xb4a83d58a2a477d571ea32e5b0877c4d2044e3f0d230095d8046f5c7151436e4",
  messageBridge:
    "0x441d8d066ac7920efa5917f6642972c6a21c493cc361281756909d34ca4907fd",

  async transferToken(
    adapter: NightlyConnectIotaAdapter,
    amount: bigint,
    coinType: string,
    coinMetadata: string,
    toChain: number,
    receiver: string
  ): Promise<string | null> {
    const accounts = await adapter.getAccounts();
    if (accounts.length === 0) return null;

    try {
      const transaction = new Transaction();

      let coinTransfer;

      if (coinType === IOTA_COIN) {
        const [coinResult] = transaction.splitCoins(transaction.gas, [amount]);
        coinTransfer = coinResult;
      } else {
        const coins = await CoinContract.getCoins(
          coinType,
          accounts[0].address
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

      return digest;
    } catch (error) {
      console.log(error);

      return null;
    }
  },

  async sendMessage(
    adapter: NightlyConnectIotaAdapter,
    toChain: number,
    to: Hex,
    payload: Hex
  ): Promise<string | null> {
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

      return digest;
    } catch (error) {
      return null;
    }
  },
};

const StakeContract = {
  moveCallState:
    "0xf6c2f638b4f0dbc58a0974e66d3035be587771112ecbe36162cf2281e68c63a0",

  async stake(
    adapter: NightlyConnectIotaAdapter,
    amount: bigint,
    coinType: string
  ): Promise<string | null> {
    try {
      const accounts = await adapter.getAccounts();
      if (accounts.length === 0) return null;

      try {
        const transaction = new Transaction();

        let coinStaked;

        if (coinType === IOTA_COIN) {
          const [coinResult] = transaction.splitCoins(transaction.gas, [
            amount,
          ]);
          coinStaked = coinResult;
        } else {
          const coins = await CoinContract.getCoins(
            coinType,
            accounts[0].address
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

          coinStaked = coinResult;
        }

        transaction.moveCall({
          target: `${IOTAContract.package}::movecall::stake`,
          arguments: [
            transaction.object(this.moveCallState),
            transaction.object(coinStaked),
          ],
          typeArguments: [coinType],
        });

        const { digest } = await adapter.signAndExecuteTransaction({
          transaction,
          chain: "iota:testnet",
          account: accounts[0],
        });

        return digest;
      } catch (error) {
        console.log(error);

        return null;
      }
    } catch (error) {
      return null;
    }
  },

  // async unstake() {},

  async getValidatorShares(
    validator: string,
    coinTypes: string[]
  ): Promise<bigint[]> {
    try {
      // const transaction = new Transaction();

      // transaction.moveCall({
      //   target: `${IOTAContract.package}::movecall::get_validator_shares`,
      //   arguments: [
      //     transaction.object(this.moveCallState),
      //     transaction.pure.address(validator),
      //     bcs.vector(bcs.String).serialize(coinTypes),
      //   ],
      // });
      // transaction.setSender(validator);
      // transaction.setGasBudget(50_000_000);
      // const transactionBlock = await transaction.build({
      //   client: iotaClient,
      // });
      // console.log(transactionBlock);

      // const { effects } = await iotaClient.dryRunTransactionBlock({
      //   transactionBlock: transactionBlock,
      // });

      // console.log("getValidatorShares", effects);

      // if (!effects?.[0]?.returnValues) return [];

      // const shares = bcs
      //   .vector(bcs.U64)
      //   .parse(Uint8Array.from(effects?.[0]?.returnValues?.[0][0]!));

      // return shares.map((share) => BigInt(share));
      return [];
    } catch (error) {
      console.log("getValidatorShares", error);
      return [];
    }
  },

  async getValidatorWeight(validator: string): Promise<number> {
    try {
      // const transaction = new Transaction();
      // transaction.moveCall({
      //   target: `${IOTAContract.package}::movecall::get_validator_weight`,
      //   arguments: [
      //     transaction.object(this.moveCallState),
      //     transaction.pure.address(validator),
      //   ],
      // });
      // const { results } = await iotaClient.devInspectTransactionBlock({
      //   transactionBlock: transaction,
      //   sender: validator,
      // });
      // console.log("getValidatorWeight", results);
      // if (!results?.[0]?.returnValues) return 0;
      // const shares = bcs.U64.parse(
      //   Uint8Array.from(results?.[0]?.returnValues?.[0][0]!)
      // );
      // return Number(shares);
      return 0;
    } catch (error) {
      console.log("getValidatorWeight", error);
      return 0;
    }
  },
};

export { HoleskyContract, IOTAContract, StakeContract };
