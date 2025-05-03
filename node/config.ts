import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";
import { zeroAddress, type Hex } from "viem";
import dotenv from "dotenv";

dotenv.config();

const MOVE_CALL: { [key: number]: Hex } = {
  17000: "0xb71e4E5673857569C6e1e2F78f0d602A164aAd40",
  0: "0xf4f35fe7f876cb5d0b16dcb8754115ed7dd57b422edf2a85f401cb8e8bacc6d3",
};

const MOVE_CALL_CAP =
  "0x680d67389bdf13450ef450ee7db1a373d660269caf4f31640ee3511989396159";

const MOVE_CALL_STATE =
  "0xf6c2f638b4f0dbc58a0974e66d3035be587771112ecbe36162cf2281e68c63a0";

const TOKEN_BRIDGE: { [key: number]: Hex } = {
  17000: "0xAe140a39625119551A1E9e4E82FAF354B48Ec948",
  0: "0xb4a83d58a2a477d571ea32e5b0877c4d2044e3f0d230095d8046f5c7151436e4",
};

const TOKEN_BRIDGE_CAP =
  "0x680d67389bdf13450ef450ee7db1a373d660269caf4f31640ee3511989396159";

const MESSAGE_BRIDGE: { [key: number]: Hex } = {
  17000: "0xDDd09e89D654F284da540B8AbC5C6Fe8ED330d8b",
  0: "0x441d8d066ac7920efa5917f6642972c6a21c493cc361281756909d34ca4907fd",
};

const MESSAGE_BRIDGE_CAP =
  "0x680d67389bdf13450ef450ee7db1a373d660269caf4f31640ee3511989396159";

const IOTA_COIN =
  "0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA";

const COIN_METADATA: { [key: string]: string } = {};
COIN_METADATA["0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E"] =
  "0x2e07b326e1719d81e2cf1cfbd6f5edf781191093d20c8df71e9927a1f93da223"; // BTC
COIN_METADATA["0x8686F62a11EC9441572436b0d39dEed936845DD3"] =
  "0xc2c9c6ce9e97896815ed39d0e55ff9f4e175b552daaeec088b9d839c289e39f6"; // DOGE
COIN_METADATA["0x108353B68DF4dC58cF37dFa9cE20A77387f29f19"] =
  "0x6dcda050874e2f160a008afc9e3ca6304a667cc85045e35f25b3c7967282b153"; // IOTA
COIN_METADATA["0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674"] =
  "0xc9871ae4305ec790fff825c7f35c756ae2e1f17368ec567f380d0bef0a1a8671"; // LINK
COIN_METADATA["0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e"] =
  "0x4a80447f2cbc4de46baa9947d92be67f5c250aa406ba282e324b94f0b567835c"; // USDC
COIN_METADATA[zeroAddress] =
  "0xa37befede06639c06d3442b385e5f141a60d17a4c804ada1bfb5a33a3f46528d"; // ETH

const COIN_TYPES: { [key: string]: string } = {};
COIN_TYPES[
  "0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E"
] = `${MOVE_CALL[0]}::btc::BTC`;
COIN_TYPES[
  "0x8686F62a11EC9441572436b0d39dEed936845DD3"
] = `${MOVE_CALL[0]}::doge::DOGE`;
COIN_TYPES["0x108353B68DF4dC58cF37dFa9cE20A77387f29f19"] = IOTA_COIN;
COIN_TYPES[
  "0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674"
] = `${MOVE_CALL[0]}::link::LINK`;
COIN_TYPES[
  "0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e"
] = `${MOVE_CALL[0]}::usdc::USDC`;
COIN_TYPES[zeroAddress] = `${MOVE_CALL[0]}::eth::ETH`;

const TOKENS: { [key: string]: Hex } = {};
TOKENS[`${MOVE_CALL[0]}::btc::BTC`] =
  "0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E";
TOKENS[`${MOVE_CALL[0]}::doge::DOGE`] =
  "0x8686F62a11EC9441572436b0d39dEed936845DD3";
// === IOTA === //
TOKENS[IOTA_COIN] = "0x108353B68DF4dC58cF37dFa9cE20A77387f29f19";
TOKENS[IOTA_TYPE_ARG] = "0x108353B68DF4dC58cF37dFa9cE20A77387f29f19";
// === IOTA === //
TOKENS[`${MOVE_CALL[0]}::link::LINK`] =
  "0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674";
TOKENS[`${MOVE_CALL[0]}::usdc::USDC`] =
  "0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e";
TOKENS[`${MOVE_CALL[0]}::eth::ETH`] = zeroAddress;

const Config = {
  HOLESKY_EVENT_INTERVAL_MS: 60_000,
  IOTA_EVENT_INTERVAL_MS: 60_000,

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
