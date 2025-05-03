import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { createPublicClient, defineChain, http, parseAbiItem } from "viem";
import type { Hex, WatchEventReturnType } from "viem";
import Config from "./config";
import RangeTime from "./range-time";

interface TokenTransferEVM {
  hash: string;
  uid: Hex;
  token: string;
  decimals: number;
  amount: bigint;
  toChain: bigint;
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
  coin_type: string;
  decimals: number;
  amount: bigint;
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
          .filter((event) => !this.sent[event.transactionHash])
          .map((event) => {
            return {
              hash: event.transactionHash,
              uid: event.args.uid!,
              token: event.args.token!,
              decimals: Number(event.args.decimals!),
              amount: event.args.amount!,
              toChain: event.args.toChain!,
              receiver: event.args.receiver!,
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

  markAsSent(id: string) {
    this.sent[id] = true;
  }

  async callIOTA(callback: (events: TokenTransferIOTA[]) => void) {
    const iotaClient = new IotaClient({
      url: getFullnodeUrl("testnet"),
    });

    const events = await iotaClient.queryEvents({
      order: "descending",
      limit: Config.IOTA_QUERY_LIMIT,
      query: {
        MoveEventType: `${Config.moveCall(0)}::token_bridge::TokenTransfer`,
      },
    });

    const data = events.data
      .filter((event) => !this.sent[event.id.txDigest])
      .map((event) => {
        return {
          hash: event.id.txDigest,
          ...Object(event.parsedJson),
          chain_id: 0,
        };
      });

    if (data.length !== 0) callback(data);
  }
}

export { TokenBridge, SignedTokenTransferEVM, SignedTokenTransferIOTA };
