import { zeroAddress } from "viem";
import type { Token, Chain, Strategy } from "./types";

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
      0: 9,
    },
    address: {
      17000: "0x8686F62a11EC9441572436b0d39dEed936845DD3",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/doge.png",
    faucet: 1_000,
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
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/eth.png",
    faucet: 0,
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: {
      17000: 8,
      0: 8,
    },
    address: {
      17000: "0xFf38dBA7Ed4714330fcDbC1722C66F5df73e020E",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/btc.png",
    faucet: 0.1,
  },
  {
    name: "USDC",
    symbol: "USDC",
    decimals: {
      17000: 6,
      0: 6,
    },
    address: {
      17000: "0x8058C85552e8D3E5Ec844Dab3dfAF64a77fD610e",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/usdc.png",
    faucet: 10,
  },
  {
    name: "IOTA",
    symbol: "IOTA",
    decimals: {
      17000: 18,
      0: 9,
    },
    address: {
      17000: "0x108353B68DF4dC58cF37dFa9cE20A77387f29f19",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/iota.png",
    faucet: 0.2,
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    decimals: {
      17000: 18,
      0: 9,
    },
    address: {
      17000: "0xC6AE30aFAcd87EE0f8F1F1a9C1EF710211B91674",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/link.png",
    faucet: 5,
  },
];

export const strategies: Strategy[] = [
  {
    name: "IOTA",
    symbol: "IOTA",
    decimals: 9,
    address: "0x1",
    image: "/images/iota.png",
    about: "",
    link: "",
    faucet: 0,
  },
  {
    name: "ANKR Liquid Staked IOTA",
    symbol: "akIOTA",
    decimals: 9,
    address: "0x2",
    image: "/images/iota.png",
    about: "",
    link: "",
    faucet: 0.2,
  },
];

export const findStrategy = (address: string): Strategy | undefined => {
  return strategies.find((c) => c.address === address);
};
