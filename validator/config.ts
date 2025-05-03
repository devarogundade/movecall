import dotenv from "dotenv";
import type { Hex } from "viem";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  1: "0x",
};

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  17000: "0xAe140a39625119551A1E9e4E82FAF354B48Ec948",
  0: "0xb4a83d58a2a477d571ea32e5b0877c4d2044e3f0d230095d8046f5c7151436e4",
};

const MESSAGE_BRIDGE: { [key: number]: Hex } = {
  17000: "0xDDd09e89D654F284da540B8AbC5C6Fe8ED330d8b",
  0: "0x441d8d066ac7920efa5917f6642972c6a21c493cc361281756909d34ca4907fd",
};

const IOTA_COIN =
  "0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA";

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 60_000,
  IOTA_EVENT_INTERVAL_MS: 60_000,

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
