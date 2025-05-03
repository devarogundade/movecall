import { Transaction } from "@iota/iota-sdk/transactions";
import { client, Coins, signer, getCoins } from "./shared";
import { Config } from "config";
import { bcs } from "@iota/iota-sdk/bcs";
import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";

async function deposit(coinType: string, amount: number) {
  const transaction = new Transaction();

  let coinDeposited;

  if (coinType === IOTA_TYPE_ARG) {
    const [coinResult] = transaction.splitCoins(transaction.gas, [10_000]);
    coinDeposited = coinResult;
  } else {
    const coins = await getCoins(
      coinType,
      signer.getPublicKey().toIotaAddress()
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

    coinDeposited = coinResult;
  }

  transaction.moveCall({
    target: `${Config.moveCall(0)}::token_bridge::deposit`,
    arguments: [
      transaction.object(Config.tokenBridgeCap()),
      transaction.object(Config.tokenBrige(0)),
      transaction.object(coinDeposited),
    ],
    typeArguments: [coinType],
  });
  transaction.setGasBudget(50_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function setQuorum(coinTypes: string[], multipliers: number[]) {
  const transaction = new Transaction();
  transaction.moveCall({
    target: `${Config.moveCall(0)}::movecall::set_quorum`,
    arguments: [
      transaction.object(Config.moveCallCap()),
      transaction.object(Config.moveCallState()),
      bcs
        .vector(bcs.String)
        .serialize(coinTypes.map((coinType) => coinType.replace("0x", ""))),
      bcs.vector(bcs.U64).serialize(multipliers),
    ],
  });
  transaction.setGasBudget(5_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function setMinWeight(minWeight: number) {
  const transaction = new Transaction();
  transaction.moveCall({
    target: `${Config.moveCall(0)}::movecall::set_min_weight`,
    arguments: [
      transaction.object(Config.moveCallCap()),
      transaction.object(Config.moveCallState()),
      transaction.pure.u64(minWeight),
    ],
  });
  transaction.setGasBudget(5_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function initStakeVault(coinType: string) {
  const transaction = new Transaction();
  transaction.moveCall({
    target: `${Config.moveCall(0)}::movecall::init_stake_vault`,
    arguments: [
      transaction.object(Config.moveCallCap()),
      transaction.object(Config.moveCallState()),
    ],
    typeArguments: [coinType],
  });
  transaction.setGasBudget(50_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function initSupply(
  module: string,
  coinType: string,
  treasuryCap: string,
  faucet: string
) {
  const transaction = new Transaction();
  transaction.moveCall({
    target: `${Config.moveCall(0)}::${module}::init_supply`,
    arguments: [transaction.object(treasuryCap), transaction.object(faucet)],
    typeArguments: [coinType],
  });
  transaction.setGasBudget(5_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function mint(
  module: string,
  coinType: string,
  faucet: string,
  amount: number
) {
  const transaction = new Transaction();
  transaction.moveCall({
    target: `${Config.moveCall(0)}::${module}::mint`,
    arguments: [
      transaction.object(faucet),
      transaction.pure.u64(amount),
      transaction.pure.address(signer.getPublicKey().toIotaAddress()),
    ],
    typeArguments: [coinType],
  });
  transaction.setGasBudget(50_000_000);
  const { digest } = await client.signAndExecuteTransaction({
    transaction,
    signer,
  });
  console.log("Transaction digest:", digest);
}

async function main() {
  // for (const coin of Coins) {
  //   await initSupply(coin.module, coin.coinType, coin.treasuryCap, coin.faucet);
  // }
  // await initStakeVault(Config.iotaCoin());
  // await initStakeVault(`${Config.moveCall(0)}::akiota::AKIOTA`);
  // await setMinWeight(1_000);
  // await setQuorum(
  //   [Config.iotaCoin(), `${Config.moveCall(0)}::akiota::AKIOTA`],
  //   [7_000, 3_000]
  // );
  // for (const coin of Coins) {
  //   await mint(coin.module, coin.coinType, coin.faucet, 10_000_000_000_000);
  // }
  // for (const coin of Coins) {
  //   await deposit(coin.coinType, 10_000_000_000_000);
  // }
  // await deposit(IOTA_TYPE_ARG, 1_000_000);
}

main();
