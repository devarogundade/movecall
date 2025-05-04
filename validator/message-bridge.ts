import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import {
  createPublicClient,
  defineChain,
  http,
  parseAbiItem,
  toHex,
} from "viem";
import type { Hex, WatchEventReturnType } from "viem";
import Config from "./config";
import { bcs } from "@iota/iota-sdk/bcs";

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
  private readonly sent: { [key: string]: boolean } = {};

  markAsSent(id: string) {
    this.sent[id] = true;
  }

  async syncHolesky(
    callback: (events: MessageSentEVM[]) => void
  ): Promise<WatchEventReturnType> {
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

    const fromBlock = await publicClient.getBlockNumber();

    return publicClient.watchEvent({
      address: Config.tokenBrige(17_000),
      fromBlock,
      event: parseAbiItem(
        "event MessageSent(bytes32 uid, uint64 toChain, address to, bytes payload)"
      ),
      pollingInterval: Config.HOLESKY_EVENT_INTERVAL_MS,
      onLogs: (events) => {
        const data = events
          .filter((event) => !Boolean(this.sent[event.transactionHash]))
          .map((event) => {
            return {
              hash: event.transactionHash,
              uid: event.args.uid!,
              toChain: Number(event.args.toChain!),
              to: event.args.to!,
              payload: event.args.payload!,
              chainId: 17_000,
            };
          });

        if (data.length !== 0) callback(data);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async callIOTA(callback: (events: MessageSentIOTA[]) => void) {
    const iotaClient = new IotaClient({
      url: getFullnodeUrl("testnet"),
    });

    try {
      const events = await iotaClient.queryEvents({
        order: "descending",
        limit: Config.IOTA_QUERY_LIMIT,
        query: {
          MoveEventType: `${Config.moveCall(0)}::message_bridge::MessageSent`,
        },
      });

      const data = events.data
        .filter((event) => !Boolean(this.sent[event.id.txDigest]))
        .map((event) => {
          const parsedJson = Object(event.parsedJson);
          return {
            hash: event.id.txDigest,
            uid: toHex(bcs.U64.parse(Uint8Array.from(parsedJson.uid)), {
              size: 32,
            }),
            to_chain: Number(parsedJson.to_chain),
            to: new TextDecoder().decode(Uint8Array.from(parsedJson.to)) as Hex,
            payload: new TextDecoder().decode(
              Uint8Array.from(parsedJson.payload)
            ) as Hex,
            chain_id: 0,
          };
        });

      if (data.length !== 0) callback(data);
    } catch (error) {
      console.log(error);
    }
  }
}

export { MessageBridge, SignedMessageSentEVM, SignedMMessageSentIOTA };
