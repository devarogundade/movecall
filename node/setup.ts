import { Transaction } from "@iota/iota-sdk/transactions";
import { client, Coins, signer } from "./shared";
import { Config } from "config";
import { bcs } from "@iota/iota-sdk/bcs";

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
  transaction.setGasBudget(5_000_000);
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

async function main() {
  for (const coin of Coins) {
    await initSupply(coin.module, coin.coinType, coin.treasuryCap, coin.faucet);
  }

  await initStakeVault(Config.iotaCoin());
  await initStakeVault(`${Config.moveCall(0)}::akiota::AKIOTA`);

  await setMinWeight(1_000);

  await setQuorum(
    [Config.iotaCoin(), `${Config.moveCall(0)}::akiota::AKIOTA`],
    [7_000, 3_000]
  );
}

main();
