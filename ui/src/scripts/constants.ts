import { zeroAddress, type Hex } from "viem";
import type { Token, Chain, Strategy } from "./types";
import { IOTAContract } from "./contract";

export const IOTA_COIN =
  "0x0000000000000000000000000000000000000000000000000000000000000002::iota::IOTA";

export const chains: Chain[] = [
  {
    id: 17000,
    name: "Holesky",
    symbol: "Holesky",
    image: "/images/eth.png",
  },
  {
    id: 0,
    name: "IOTA",
    symbol: "IOTA",
    image: "/images/iota.png",
  },
];

export const chain = (id: number): Chain | undefined => {
  return chains.find((c) => c.id === id);
};

export const tokens: Token[] = [
  {
    name: "Dogecoin",
    symbol: "DOGE",
    decimals: {
      17000: 18,
      0: 6,
    },
    address: {
      17000: "0xBB31e775E26DdD8572250DB88527cB4350764816",
      0: `${IOTAContract.package}::doge::DOGE` as Hex,
    },
    metadata: {
      0: "0xc2c9c6ce9e97896815ed39d0e55ff9f4e175b552daaeec088b9d839c289e39f6",
    },
    faucet: {
      0: "0x218535db301e8217b5475a065f60300b0c0dda8170e4c94a639444427aa4e340",
    },
    module: {
      0: "doge",
    },
    image: "/images/doge.png",
    faucetAmount: 1_000,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: {
      17000: 18,
      0: 9,
    },
    address: {
      17000: zeroAddress,
      0: `${IOTAContract.package}::eth::ETH` as Hex,
    },
    metadata: {
      0: "0xa37befede06639c06d3442b385e5f141a60d17a4c804ada1bfb5a33a3f46528d",
    },
    faucet: {
      0: "0x4473808e57a74fa202fb781fe0d850ccbc974931c252c8b88ee1df95d5f05b4f",
    },
    module: {
      0: "eth",
    },
    image: "/images/eth.png",
    faucetAmount: 0.01,
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: {
      17000: 8,
      0: 8,
    },
    address: {
      17000: "0xD197EF1728139dd586f92A46Cc5d4A9030e6b886",
      0: `${IOTAContract.package}::btc::BTC` as Hex,
    },
    metadata: {
      0: "0x2e07b326e1719d81e2cf1cfbd6f5edf781191093d20c8df71e9927a1f93da223",
    },
    faucet: {
      0: "0x22991bb114d1b8e55ec4ebf9fecbee9852547ae4074e9ff2d608c98edb94da14",
    },
    module: {
      0: "btc",
    },
    image: "/images/btc.png",
    faucetAmount: 0.1,
  },
  {
    name: "USDC",
    symbol: "USDC",
    decimals: {
      17000: 6,
      0: 6,
    },
    address: {
      17000: "0xBEa3F061019aE5cd0318F24811DEEF6C6706703b",
      0: `${IOTAContract.package}::usdc::USDC` as Hex,
    },
    metadata: {
      0: "0x4a80447f2cbc4de46baa9947d92be67f5c250aa406ba282e324b94f0b567835c",
    },
    faucet: {
      0: "0xf5f68b27a72bd41db7b66db2b841348736dc5dbb35f62f468a3920c9ea15d056",
    },
    module: {
      0: "usdc",
    },
    image: "/images/usdc.png",
    faucetAmount: 10,
  },
  {
    name: "IOTA",
    symbol: "IOTA",
    decimals: {
      17000: 18,
      0: 9,
    },
    address: {
      17000: "0xC85F04890aA94d3f25688494508ed1C20EE5C11F",
      0: IOTA_COIN,
    },
    metadata: {
      0: "0x6dcda050874e2f160a008afc9e3ca6304a667cc85045e35f25b3c7967282b153",
    },
    faucet: {},
    module: {},
    image: "/images/iota.png",
    faucetAmount: 0.01,
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    decimals: {
      17000: 18,
      0: 9,
    },
    address: {
      17000: "0x5A8aCE90f414Beeb40fd9e008A4689b2ce4b8EE9",
      0: `${IOTAContract.package}::link::LINK` as Hex,
    },
    metadata: {
      0: "0xc9871ae4305ec790fff825c7f35c756ae2e1f17368ec567f380d0bef0a1a8671",
    },
    faucet: {
      0: "0xd8a6c419af49332bac05f4e54eb8788034699bf45741855f48ebf541ea7edcba",
    },
    module: {
      0: "link",
    },
    image: "/images/link.png",
    faucetAmount: 5,
  },
];

export const strategies: Strategy[] = [
  {
    name: "IOTA",
    symbol: "IOTA",
    decimals: 9,
    address: IOTA_COIN,
    module: "",
    image: "/images/iota.png",
    about:
      "IOTA is a decentralized blockchain infrastructure to build and secure our digital world.",
    link: "https://iota.org",
    faucetAmount: 0,
    faucet: "",
  },
  {
    name: "ANKR Liquid Staked IOTA",
    symbol: "akIOTA",
    decimals: 9,
    address: `${IOTAContract.package}::akiota::AKIOTA` as Hex,
    module: "akiota",
    image: "/images/ankr.png",
    about:
      "Ankr's Decentralized Physical Infrastructure Network (DePIN) of nodes ensures Ankr's clients always have the shortest roundtrip path for RPC requests, providing fast Web3 experiences no matter where users are.",
    link: "https://www.ankr.com",
    faucetAmount: 10_000,
    faucet:
      "0x4c0622200c6861780656daf3f6cab8c6c6284f1a401d1e6f3a90c4c43e6f02da",
  },
];

export const findStrategy = (address: string): Strategy | undefined => {
  return strategies.find((c) => c.address === address);
};
