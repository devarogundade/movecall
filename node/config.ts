import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";
import { zeroAddress, type Hex } from "viem";
import dotenv from "dotenv";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  17000: "0x8b47e9e10Dc9864Df7ce0D172CC5cA1Cefe46444",
  0: "0xf4f35fe7f876cb5d0b16dcb8754115ed7dd57b422edf2a85f401cb8e8bacc6d3",
};

const MOVE_CALL_CAP =
  "0xac05a803ee93f49fe4e2533331ff3f787d71be21705bb57b285f7fb76a2f6f1a";

const MOVE_CALL_STATE =
  "0xf6c2f638b4f0dbc58a0974e66d3035be587771112ecbe36162cf2281e68c63a0";

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  17000: "0x3Fc4398f342f5458E1783DebB909558c3e9A0444",
  0: "0xb4a83d58a2a477d571ea32e5b0877c4d2044e3f0d230095d8046f5c7151436e4",
};

const TOKEN_BRIDGE_CAP =
  "0x0f337aa39fa654a985dafdbcb503dec25b56a0d9ec4efa98c3045204dfade98b";

const MESSAGE_BRIDGE: { [key: number]: Hex } = {
  17000: "0x0F7FCD84cd58b56B6c9E7BA16eBB724dc6d0bcc8",
  0: "0x441d8d066ac7920efa5917f6642972c6a21c493cc361281756909d34ca4907fd",
};

const MESSAGE_BRIDGE_CAP =
  "0x71301a21a1cbc9b7b35ef61180c5e71457e26ec2243b0c4fcea49246d3a24fe5";

const IOTA_COIN =
  "0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA";

const COIN_METADATA: { [key: string]: string } = {};
COIN_METADATA["0xD197EF1728139dd586f92A46Cc5d4A9030e6b886"] =
  "0x2e07b326e1719d81e2cf1cfbd6f5edf781191093d20c8df71e9927a1f93da223"; // BTC
COIN_METADATA["0xBB31e775E26DdD8572250DB88527cB4350764816"] =
  "0xc2c9c6ce9e97896815ed39d0e55ff9f4e175b552daaeec088b9d839c289e39f6"; // DOGE
COIN_METADATA["0xC85F04890aA94d3f25688494508ed1C20EE5C11F"] =
  "0x6dcda050874e2f160a008afc9e3ca6304a667cc85045e35f25b3c7967282b153"; // IOTA
COIN_METADATA["0x5A8aCE90f414Beeb40fd9e008A4689b2ce4b8EE9"] =
  "0xc9871ae4305ec790fff825c7f35c756ae2e1f17368ec567f380d0bef0a1a8671"; // LINK
COIN_METADATA["0xBEa3F061019aE5cd0318F24811DEEF6C6706703b"] =
  "0x4a80447f2cbc4de46baa9947d92be67f5c250aa406ba282e324b94f0b567835c"; // USDC
COIN_METADATA[zeroAddress] =
  "0xa37befede06639c06d3442b385e5f141a60d17a4c804ada1bfb5a33a3f46528d"; // ETH

const COIN_TYPES: { [key: string]: string } = {};
COIN_TYPES[
  "0xD197EF1728139dd586f92A46Cc5d4A9030e6b886"
] = `${MOVE_CALL[0]}::btc::BTC`;
COIN_TYPES[
  "0xBB31e775E26DdD8572250DB88527cB4350764816"
] = `${MOVE_CALL[0]}::doge::DOGE`;
COIN_TYPES["0xC85F04890aA94d3f25688494508ed1C20EE5C11F"] = IOTA_COIN;
COIN_TYPES[
  "0x5A8aCE90f414Beeb40fd9e008A4689b2ce4b8EE9"
] = `${MOVE_CALL[0]}::link::LINK`;
COIN_TYPES[
  "0xBEa3F061019aE5cd0318F24811DEEF6C6706703b"
] = `${MOVE_CALL[0]}::usdc::USDC`;
COIN_TYPES[zeroAddress] = `${MOVE_CALL[0]}::eth::ETH`;

const TOKENS: { [key: string]: Hex } = {};
TOKENS[`${MOVE_CALL[0]}::btc::BTC`] =
  "0xD197EF1728139dd586f92A46Cc5d4A9030e6b886";
TOKENS[`${MOVE_CALL[0]}::doge::DOGE`] =
  "0xBB31e775E26DdD8572250DB88527cB4350764816";
// === IOTA === //
TOKENS[IOTA_COIN] = "0xC85F04890aA94d3f25688494508ed1C20EE5C11F";
TOKENS[IOTA_TYPE_ARG] = "0xC85F04890aA94d3f25688494508ed1C20EE5C11F";
// === IOTA === //
TOKENS[`${MOVE_CALL[0]}::link::LINK`] =
  "0x5A8aCE90f414Beeb40fd9e008A4689b2ce4b8EE9";
TOKENS[`${MOVE_CALL[0]}::usdc::USDC`] =
  "0xBEa3F061019aE5cd0318F24811DEEF6C6706703b";
TOKENS[`${MOVE_CALL[0]}::eth::ETH`] = zeroAddress;

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 30_000,
  IOTA_EVENT_INTERVAL_MS: 30_000,

  iotaCoin(): string {
    return IOTA_COIN;
  },

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
    return MOVE_CALL_CAP;
  },

  moveCallState(): string {
    return MOVE_CALL_STATE;
  },

  tokenBrige(chainId: number): Hex {
    return TOKEN_BRIDGE[chainId];
  },

  tokenBridgeCap(): string {
    return TOKEN_BRIDGE_CAP;
  },

  messageBridge(chainId: number): Hex {
    return MESSAGE_BRIDGE[chainId];
  },

  messageBridgeCap(): string {
    return MESSAGE_BRIDGE_CAP;
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
