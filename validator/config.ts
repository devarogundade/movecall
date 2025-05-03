import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  17000: "0x8b47e9e10Dc9864Df7ce0D172CC5cA1Cefe46444",
  0: "0xf4f35fe7f876cb5d0b16dcb8754115ed7dd57b422edf2a85f401cb8e8bacc6d3",
};

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  17000: "0x3Fc4398f342f5458E1783DebB909558c3e9A0444",
  0: "0xb4a83d58a2a477d571ea32e5b0877c4d2044e3f0d230095d8046f5c7151436e4",
};

const MESSAGE_BRIDGE: { [key: number]: Hex } = {
  17000: "0x0F7FCD84cd58b56B6c9E7BA16eBB724dc6d0bcc8",
  0: "0x441d8d066ac7920efa5917f6642972c6a21c493cc361281756909d34ca4907fd",
};

const IOTA_COIN =
  "0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA";

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 15_000,
  IOTA_EVENT_INTERVAL_MS: 15_000,
  IOTA_QUERY_LIMIT: 100,

  iotaCoin(): string {
    return IOTA_COIN;
  },

  secretKey(): string {
    return process.env.SECRET_KEY!;
  },

  moveCall(chainId: number): Hex {
    return MOVE_CALL[chainId];
  },

  tokenBrige(chainId: number): Hex {
    return TOKEN_BRIDGE[chainId];
  },

  messageBridge(chainId: number): Hex {
    return MESSAGE_BRIDGE[chainId];
  },

  nodeUrl(): string {
    return process.env.NODE_URL!;
  },
};

export default Config;
