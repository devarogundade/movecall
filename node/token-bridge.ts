import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  zeroHash,
  type Hex,
} from "viem";
import { Config } from "./config";
import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { Transaction } from "@iota/iota-sdk/transactions";
import { Ed25519Keypair } from "@iota/iota-sdk/keypairs/ed25519";
import { bcs } from "@iota/iota-sdk/bcs";
import { moveCallAbi } from "./abis/movecall";
import { mnemonicToAccount } from "viem/accounts";
interface TokenTransferEVM {
  uid: Hex;
  token: Hex;
  decimals: number;
  amount: string;
  receiver: Hex;
  toChain: number;
  chainId: number;
}

interface SignedTokenTransferEVM extends TokenTransferEVM {
  signature: string;
  signer: string;
}

interface TokenTransferIOTA {
  uid: Hex;
  coin_type: string;
  decimals: number;
  amount: string;
  to_chain: number;
  receiver: Hex;
  chain_id: number;
}

interface SignedTokenTransferIOTA extends TokenTransferIOTA {
  signature: string;
  signer: string;
}

class TokenBridge {
  minSigners: number;
  holeskyPool: { [key: string]: SignedTokenTransferEVM[] };
  iotaPool: { [key: string]: SignedTokenTransferIOTA[] };

  constructor() {
    this.minSigners = 2;
    this.holeskyPool = {};
    this.iotaPool = {};
  }

  addHoleskyEvents(events: SignedTokenTransferEVM[]) {
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      if (this.holeskyPool[event.uid]) {
        this.holeskyPool[event.uid].push(event);
      } else {
        this.holeskyPool[event.uid] = [event];
      }
    }
  }

  addIotaEvents(events: SignedTokenTransferIOTA[]) {
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      if (this.iotaPool[event.uid]) {
        this.iotaPool[event.uid].push(event);
      } else {
        this.iotaPool[event.uid] = [event];
      }
    }
  }

  async processHoleskyEvents() {
    const iotaClient = new IotaClient({
      url: getFullnodeUrl("testnet"),
    });

    const signer = Ed25519Keypair.deriveKeypair(Config.secretKey());

    const uids = Object.keys(this.holeskyPool);

    for (let index = 0; index < uids.length; index++) {
      const events = this.holeskyPool[uids[index]];

      if (!events || events.length < this.minSigners) continue;

      console.log(events);
      try {
        const transaction = new Transaction();
        transaction.moveCall({
          target: `${Config.moveCall(0)}::movecall::attest_token_claim`,
          arguments: [
            transaction.object(Config.moveCallCap()),
            transaction.object(Config.moveCallState()),
            transaction.object(Config.tokenBrige(0)),
            transaction.object(Config.coinMetadata(events[0].token)),
            bcs.vector(bcs.Address).serialize(events.map((e) => e.signer)),
            bcs
              .vector(bcs.vector(bcs.U8))
              .serialize(
                events.map((e) =>
                  Uint8Array.from(e.signature.split(",").map((a) => Number(a)))
                )
              ),
            bcs
              .vector(bcs.U8)
              .serialize(new TextEncoder().encode(events[0].uid)),
            transaction.pure.u64(events[0].chainId),
            transaction.pure.u64(events[0].amount),
            transaction.pure.u8(events[0].decimals),
            transaction.pure.address(events[0].receiver),
          ],
          typeArguments: [Config.coinType(events[0].token)],
        });
        transaction.setGasBudget(50_000_000);

        const { digest } = await iotaClient.signAndExecuteTransaction({
          transaction,
          signer,
        });

        const { checkpoint } = await iotaClient.waitForTransaction({
          digest,
        });

        console.log("Transaction digest, checkpoint: ", digest, checkpoint);

        // if (checkpoint) {
        // }
      } catch (error) {
        console.log(error);
      }

      delete this.holeskyPool[uids[index]];
    }
  }

  async processIotaEvents() {
    const publicClient = createPublicClient({
      chain: defineChain({
        id: 17_000,
        name: "Holesky",
        nativeCurrency: {
          name: "Holesky Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://rpc.ankr.com/eth_holesky"],
          },
        },
      }),
      transport: http(),
    });

    const walletClient = createWalletClient({
      chain: defineChain({
        id: 17_000,
        name: "Holesky",
        nativeCurrency: {
          name: "Holesky Ether",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://rpc.ankr.com/eth_holesky"],
          },
        },
      }),
      transport: http(),
      account: mnemonicToAccount(Config.privateKey()),
    });

    const uids = Object.keys(this.iotaPool);

    for (let index = 0; index < uids.length; index++) {
      const events = this.iotaPool[uids[index]];

      if (!events || events.length < this.minSigners) continue;

      const offChainSignatureId = zeroHash;
      try {
        const hash = await walletClient.writeContract({
          address: Config.moveCall(17_000),
          abi: moveCallAbi,
          functionName: "attestTokenClaim",
          args: [
            offChainSignatureId,
            events[0].uid,
            events[0].chain_id,
            Config.token(events[0].coin_type),
            events[0].amount,
            events[0].decimals,
            events[0].receiver,
          ],
        });

        const { status } = await publicClient.waitForTransactionReceipt({
          hash,
        });

        console.log("Transaction hash: ", hash);

        // if (status === "success") {
        // }
      } catch (error) {
        console.log(error);
      }

      delete this.iotaPool[uids[index]];
    }
  }
}

export { TokenBridge, SignedTokenTransferEVM, SignedTokenTransferIOTA };
