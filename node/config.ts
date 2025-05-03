import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  17000: "0xb71e4E5673857569C6e1e2F78f0d602A164aAd40",
  0: "0x",
};

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  17000: "0xAe140a39625119551A1E9e4E82FAF354B48Ec948",
  0: "0x",
};

const MESSAGE_BRIDGE: { [key: number]: Hex } = {
  17000: "0xDDd09e89D654F284da540B8AbC5C6Fe8ED330d8b",
  0: "0x",
};

const COIN_METADATA: { [key: string]: string } = {};

const COIN_TYPES: { [key: string]: string } = {};

const TOKENS: { [key: string]: Hex } = {};

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 60_000,
  IOTA_EVENT_INTERVAL_MS: 60_000,

  privateKey(): Hex {
    return process.env.PRIVATE_KEY! as Hex;
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
    return COIN_METADATA[token];
  },

  coinType(token: Hex): string {
    return COIN_TYPES[token];
  },

  token(coinType: string): Hex {
    return TOKENS[coinType];
  },
};

export { Config };
