import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  1: "0x",
};

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  1: "0x",
};

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 60_000,
  IOTA_EVENT_INTERVAL_MS: 60_000,

  secretKey(): string {
    return process.env.SECRET_KEY!;
  },

  moveCall(chainId: number): Hex {
    return MOVE_CALL[chainId];
  },

  tokenBrige(chainId: number): Hex {
    return TOKEN_BRIDGE[chainId];
  },

  nodeUrl(): string {
    return process.env.NODE_URL!;
  },
};

export default Config;
