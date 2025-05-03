import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";
import { config, iotaClient } from "./config";
import {
  waitForTransactionReceipt,
  getBalance,
  writeContract,
  readContract,
} from "@wagmi/core";
import { erc20Abi, parseEther, zeroAddress, zeroHash, type Hex } from "viem";
import { tokenAbi } from "../abis/token";
import { type CoinStruct } from "@iota/iota-sdk/client";
import { IOTA_COIN } from "./constants";
import type { NightlyConnectIotaAdapter } from "@nightlylabs/wallet-selector-iota";
import { Transaction } from "@iota/iota-sdk/transactions";
import { IOTAContract } from "./contract";

const TokenContract = {
  async mint(token: Hex, amount: bigint): Promise<Hex | null> {
    try {
      const result = await writeContract(config, {
        abi: tokenAbi,
        address: token,
        functionName: "mint",
        args: [amount],
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash: result,
      });

      return receipt.transactionHash;
    } catch (error) {
      return null;
    }
  },

  async getAllowance(token: Hex, wallet: Hex, spender: Hex): Promise<bigint> {
    try {
      if (token == zeroAddress)
        return BigInt(parseEther(Number.MAX_VALUE.toString()));

      return await readContract(config, {
        abi: erc20Abi,
        address: token,
        functionName: "allowance",
        args: [wallet, spender],
      });
    } catch (error) {
      return BigInt(0);
    }
  },

  async approve(token: Hex, spender: Hex, amount: bigint): Promise<Hex | null> {
    try {
      if (token == zeroAddress) return zeroHash;

      const result = await writeContract(config, {
        abi: erc20Abi,
        address: token,
        functionName: "approve",
        args: [spender, amount],
      });

      const receipt = await waitForTransactionReceipt(config, { hash: result });

      return receipt.transactionHash;
    } catch (error) {
      console.log(error);

      return null;
    }
  },

  async getTokenBalance(token: Hex, address: Hex): Promise<bigint> {
    try {
      const { value } = await getBalance(config, {
        token: token == zeroAddress ? undefined : token,
        address,
      });
      return value;
    } catch (error) {
      return BigInt(0);
    }
  },
};

const CoinContract = {
  async getCoinBalance(coinType: string, owner: string): Promise<bigint> {
    try {
      const coins = await iotaClient.getAllCoins({ owner });
      const coinTypeSafe = coinType === IOTA_COIN ? IOTA_TYPE_ARG : coinType;
      const innerCoins = coins.data.filter(
        (coin) => coin.coinType === coinTypeSafe
      );
      return innerCoins.reduce((a, b) => a + BigInt(b.balance), BigInt(0));
    } catch (error) {
      return BigInt(0);
    }
  },

  async getCoins(coinType: string, owner: string): Promise<CoinStruct[]> {
    try {
      const coins = await iotaClient.getCoins({
        coinType: coinType === IOTA_COIN ? IOTA_TYPE_ARG : coinType,
        owner,
      });
      return coins.data;
    } catch (error) {
      return [];
    }
  },

  async mint(
    adapter: NightlyConnectIotaAdapter,
    module: string,
    faucet: string,
    coinType: string,
    amount: bigint
  ): Promise<string | null> {
    const accounts = await adapter.getAccounts();
    if (accounts.length === 0) return null;

    try {
      const transaction = new Transaction();

      transaction.moveCall({
        target: `${IOTAContract.package}::${module}::mint`,
        arguments: [
          transaction.object(faucet),
          transaction.pure.u64(amount),
          transaction.pure.address(accounts[0].address),
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
};

export { TokenContract, CoinContract };
