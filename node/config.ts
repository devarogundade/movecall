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

  privateKey(): Hex {
    return process.env.PRIVATE_KEY!;
  },

  secretKey(): string {
    return process.env.SECRET_KEY!;
  },

  moveCall(chainId: number): Hex {
    return MOVE_CALL[chainId];
  },

  moveCallCap(): string {
    return "";
  },

  moveCallState(): string {
    return "";
  },

  tokenBrige(chainId: number): Hex {
    return TOKEN_BRIDGE[chainId];
  },

  coinMetadata(token: Hex): string {
    return TOKEN_BRIDGE[chainId];
  },

  coinType(token: Hex): string {
    return TOKEN_BRIDGE[chainId];
  },

  token(coinType: string): Hex {
    return TOKEN_BRIDGE[chainId];
  },
};

export { Config };
