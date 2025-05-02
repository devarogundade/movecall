import { zeroAddress } from "viem";
import type { Token, Chain } from "./types";

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
    price: 4.62,
    address: {
      17000: "0x",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/doge.png",
    faucet: 10_000,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: {
      17000: 18,
      0: 9,
    },
    price: 3_424.23,
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
    price: 94_329.42,
    address: {
      17000: "0x",
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
    price: 1.01,
    address: {
      17000: "0x",
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
    price: 3.42,
    address: {
      17000: "0x",
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
    price: 4.62,
    address: {
      17000: "0x",
      0: "0x",
    },
    metadata: {
      0: "0x",
    },
    image: "/images/link.png",
    faucet: 0.5,
  },
];
