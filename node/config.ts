import { IOTA_TYPE_ARG } from "@iota/iota-sdk/utils";
import { zeroAddress, type Hex } from "viem";
import dotenv from "dotenv";

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
COIN_METADATA["0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E"] = ""; // BTC
COIN_METADATA["0x8686F62a11EC9441572436b0d39dEed936845DD3"] = ""; // DOGE
COIN_METADATA["0x108353B68DF4dC58cF37dFa9cE20A77387f29f19"] = ""; // IOTA
COIN_METADATA["0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674"] = ""; // LINK
COIN_METADATA["0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e"] = ""; // USDC
COIN_METADATA[zeroAddress] = ""; // ETH

const COIN_TYPES: { [key: string]: string } = {};
COIN_TYPES[
  "0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E"
] = `${MOVE_CALL[0]}::btc::BTC`;
COIN_TYPES[
  "0x8686F62a11EC9441572436b0d39dEed936845DD3"
] = `${MOVE_CALL[0]}::doge::DOGE`;
COIN_TYPES["0x108353B68DF4dC58cF37dFa9cE20A77387f29f19"] = IOTA_TYPE_ARG;
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
TOKENS[IOTA_TYPE_ARG] = "0x108353B68DF4dC58cF37dFa9cE20A77387f29f19";
TOKENS[`${MOVE_CALL[0]}::link::LINK`] =
  "0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674";
TOKENS[`${MOVE_CALL[0]}::usdc::USDC`] =
  "0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e";
TOKENS[`${MOVE_CALL[0]}::eth::ETH`] = zeroAddress;

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

  messageBridge(chainId: number): Hex {
    return MESSAGE_BRIDGE[chainId];
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
