import { IotaClient, getFullnodeUrl } from "@iota/iota-sdk/client";
import { createPublicClient, defineChain, http, parseAbiItem } from "viem";
import type { Hex, WatchEventReturnType } from "viem";
import Config from "./config";
import RangeTime from "./range-time";

interface TokenTransferEVM {
  uid: Hex;
  token: string;
  decimals: number;
  amount: bigint;
  receiver: Hex;
  chain_id: number;
}

interface SignedTokenTransferEVM extends TokenTransferEVM {
  signature: string;
  signer: string;
}

interface TokenTransferIOTA {
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
  private rangeTime = new RangeTime();

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
        "event TokenTransfer(bytes32 indexed uid, address token, uint256 decimals, uint256 amount, bytes32 receiver)"
      ),
      pollingInterval: Config.HOLESKY_EVENT_INTERVAL_MS,
      onLogs: (events) => {
        callback(
          events.map((event) => {
            return {
              uid: event.args.uid!,
              token: event.args.token!,
              decimals: Number(event.args.decimals!),
              amount: event.args.amount!,
              receiver: event.args.receiver!,
              chain_id: 17_000,
            };
          })
        );
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  async callIOTA(callback: (events: TokenTransferIOTA[]) => void) {
    const iotaClient = new IotaClient({
      url: getFullnodeUrl("testnet"),
    });

    const { startTime, endTime } = this.rangeTime.getTimeRange(
      Config.IOTA_EVENT_INTERVAL_MS
    );

    const events = await iotaClient.queryEvents({
      query: {
        MoveModule: {
          package: Config.moveCall(0),
          module: "token_bridge",
        },
        MoveEventType: `${Config.moveCall(0)}::token_bridge::TokenTransfer`,
        TimeRange: {
          startTime,
          endTime,
        },
      },
    });

    callback(
      events.data.map((event) => {
        return {
          ...Object(event.parsedJson),
          chain_id: 0,
        } as TokenTransferIOTA;
      })
    );

    this.rangeTime.resetTime(endTime);
  }
}

export { TokenBridge, SignedTokenTransferEVM, SignedTokenTransferIOTA };
