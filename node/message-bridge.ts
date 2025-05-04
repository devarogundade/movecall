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

interface MessageSentEVM {
  hash: Hex;
  uid: Hex;
  toChain: number;
  to: Hex;
  payload: Hex;
  chainId: number;
}

interface SignedMessageSentEVM extends MessageSentEVM {
  signature: string;
  signer: string;
}

interface MessageSentIOTA {
  hash: string;
  uid: Hex;
  to_chain: number;
  to: Hex;
  payload: Hex;
  chain_id: number;
}

interface SignedMMessageSentIOTA extends MessageSentIOTA {
  signature: string;
  signer: string;
}
class MessageBridge {
  minSigners: number;
  holeskyPool: { [key: string]: SignedMessageSentEVM[] };
  iotaPool: { [key: string]: SignedMMessageSentIOTA[] };

  constructor() {
    this.minSigners = 2;
    this.holeskyPool = {};
    this.iotaPool = {};
  }

  addHoleskyEvents(events: SignedMessageSentEVM[]) {
    for (let index = 0; index < events.length; index++) {
      const event = events[index];
      if (this.holeskyPool[event.uid]) {
        this.holeskyPool[event.uid].push(event);
      } else {
        this.holeskyPool[event.uid] = [event];
      }
    }
  }

  addIotaEvents(events: SignedMMessageSentIOTA[]) {
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
    // try {
    //   const iotaClient = new IotaClient({
    //     url: getFullnodeUrl("testnet"),
    //   });
    //   const signer = Ed25519Keypair.deriveKeypair(Config.secretKey());
    //   const uids = Object.keys(this.holeskyPool);
    //   for (let index = 0; index < uids.length; index++) {
    //     const events = this.holeskyPool[uids[index]];
    //     if (!events || events.length < this.minSigners) continue;
    //     const transaction = new Transaction();
    //     transaction.moveCall({
    //       target: `${Config.moveCall(0)}::movecall::attest_token_claim`,
    //     });
    //     transaction.setGasBudget(50_000_000 * events.length);
    //     const { digest } = await iotaClient.signAndExecuteTransaction({
    //       transaction,
    //       signer,
    //     });
    //     const { checkpoint } = await iotaClient.waitForTransaction({ digest });
    //     console.log("Transaction digest, checkpoint: ", digest, checkpoint);
    //     if (checkpoint) {
    //       delete this.holeskyPool[uids[index]];
    //     }
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }

  async processIotaEvents() {
    try {
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

        const hash = await walletClient.writeContract({
          address: Config.moveCall(17_000),
          abi: moveCallAbi,
          functionName: "receiveMessage",
          args: [
            offChainSignatureId,
            events[0].uid,
            events[0].chain_id,
            zeroHash, // from: TO DO
            events[0].to,
            events[0].payload,
          ],
        });

        const { status } = await publicClient.waitForTransactionReceipt({
          hash,
        });

        console.log("Transaction hash: ", hash);

        // if (status === "success") {
        delete this.iotaPool[uids[index]];
        // }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

export { MessageBridge, SignedMessageSentEVM, SignedMMessageSentIOTA };
