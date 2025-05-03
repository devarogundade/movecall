import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import {
  bytesToHex,
  createPublicClient,
  defineChain,
  http,
  parseAbiItem,
  toBytes,
  toHex,
} from "viem";
import type { Hex, WatchEventReturnType } from "viem";
import Config from "./config";
import { bcs } from "@iota/iota-sdk/bcs";

interface TokenTransferEVM {
  hash: string;
  uid: Hex;
  token: string;
  decimals: number;
  amount: string;
  toChain: number;
  receiver: Hex;
  chainId: number;
}

interface SignedTokenTransferEVM extends TokenTransferEVM {
  signature: string;
  signer: string;
}

interface TokenTransferIOTA {
  hash: string;
  uid: Hex;
  coin_type: Hex;
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
  readonly sent: { [key: string]: boolean } = {};

  async syncHolesky(
    callback: (events: TokenTransferEVM[]) => void
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
        "event TokenTransfer(bytes32 indexed uid, address token, uint256 decimals, uint256 amount, uint64 toChain, bytes32 receiver)"
      ),
      pollingInterval: Config.HOLESKY_EVENT_INTERVAL_MS,
      onLogs: (events) => {
        const data = events
          .filter((event) => !Boolean(this.sent[event.transactionHash]))
          .map((event) => {
            return {
              hash: event.transactionHash,
              uid: event.args.uid!,
              token: event.args.token!,
              decimals: Number(event.args.decimals!),
              amount: event.args.amount!.toString(),
              toChain: Number(event.args.toChain!),
              receiver: event.args.receiver!,
              chainId: 17_000,
            };
          });

        console.log("Holesky", data);

        if (data.length !== 0) callback(data);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  markAsSent(id: string) {
    this.sent[id] = true;
  }

  async callIOTA(callback: (events: TokenTransferIOTA[]) => void) {
    const iotaClient = new IotaClient({
      url: getFullnodeUrl("testnet"),
    });

    try {
      const events = await iotaClient.queryEvents({
        order: "descending",
        limit: Config.IOTA_QUERY_LIMIT,
        query: {
          MoveEventType: `${Config.moveCall(0)}::token_bridge::TokenTransfer`,
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
            coin_type: `0x${parsedJson.coin_type}` as Hex,
            amount: parsedJson.amount,
            decimals: Number(parsedJson.decimals),
            receiver: new TextDecoder().decode(
              Uint8Array.from(parsedJson.receiver)
            ) as Hex,
            to_chain: Number(parsedJson.to_chain),
            chain_id: 0,
          };
        });

      console.log("Iota", data);

      if (data.length !== 0) callback(data);
    } catch (error) {
      console.log(error);
    }
  }
}

export { TokenBridge, SignedTokenTransferEVM, SignedTokenTransferIOTA };
