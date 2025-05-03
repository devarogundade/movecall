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
    this.minSigners = 1;
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

      console.log(this.iotaPool);
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

      if (events.length < this.minSigners) continue;
      const event = this.holeskyPool[uids[index]][0];

      const transaction = new Transaction();
      transaction.moveCall({
        target: `${Config.moveCall(0)}::movecall::attest_token_claim`,
        arguments: [
          transaction.object(Config.moveCallCap()),
          transaction.object(Config.moveCallState()),
          transaction.object(Config.tokenBrige(0)),
          transaction.object(Config.coinMetadata(event.token)),
          transaction.pure(
            bcs.vector(bcs.Address).serialize(events.map((e) => e.signer))
          ),
          transaction.pure(
            bcs
              .vector(bcs.vector(bcs.U8))
              .serialize(
                events.map((e) => new TextEncoder().encode(e.signature))
              )
          ),
          transaction.pure(
            bcs.vector(bcs.U8).serialize(new TextEncoder().encode(event.uid))
          ),
          transaction.pure.u64(event.chainId),
          transaction.pure.u64(event.amount),
          transaction.pure.u8(event.decimals),
          transaction.pure.address(event.receiver),
        ],
        typeArguments: [Config.coinType(event.token)],
      });
      transaction.setGasBudget(50_000_000);

      const { digest } = await iotaClient.signAndExecuteTransaction({
        transaction,
        signer,
      });

      const { checkpoint } = await iotaClient.waitForTransaction({ digest });

      if (checkpoint) {
        delete this.holeskyPool[uids[index]];
      }
    }
  }

  async processIotaEvents() {
    const publicClient = createPublicClient({
      chain: defineChain({
        id: 17_000,
        name: "Holesky",
        nativeCurrency: { name: "Holesky Ether", symbol: "ETH", decimals: 18 },
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
        nativeCurrency: { name: "Holesky Ether", symbol: "ETH", decimals: 18 },
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

      if (events.length < this.minSigners) continue;
      const event = this.iotaPool[uids[index]][0];

      const offChainSignatureId = zeroHash;

      console.log("Processing ", event, Config.token(event.coin_type));

      try {
        const hash = await walletClient.writeContract({
          address: Config.moveCall(17_000),
          abi: moveCallAbi,
          functionName: "attestTokenClaim",
          args: [
            offChainSignatureId,
            event.uid,
            event.chain_id,
            Config.token(event.coin_type),
            event.amount,
            event.decimals,
            event.receiver,
          ],
        });

        const { status } = await publicClient.waitForTransactionReceipt({
          hash,
        });

        if (status === "success") {
          delete this.iotaPool[uids[index]];
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export { TokenBridge, SignedTokenTransferEVM, SignedTokenTransferIOTA };
