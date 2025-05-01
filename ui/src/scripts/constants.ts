import { zeroAddress } from "viem";
import type { Token } from "./types";

export const tokens: Token[] = [
  {
    name: "Dogecoin",
    symbol: "DOGE",
    decimals: 18,
    price: 4.62,
    address: "0x9DeB5E5E901F84fda356869A58DcB4885FDB7080",
    image: "/images/doge.png",
    faucet: 10_000,
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    price: 3_424.23,
    address: zeroAddress,
    image: "/images/eth.png",
    faucet: 0,
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    price: 94_329.42,
    address: "0x9DeB5E5E901F84fda356869A58DcB4885FDB7080",
    image: "/images/btc.png",
    faucet: 0.1,
  },
  {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
    price: 1.01,
    address: "0x9DeB5E5E901F84fda356869A58DcB4885FDB7080",
    image: "/images/usdc.png",
    faucet: 10,
  },
  {
    name: "IOTA",
    symbol: "IOTA",
    decimals: 9,
    price: 3.42,
    address: "0x0Ee1010Ea21D15F807e7952927bAd57B367797c0",
    image: "/images/iota.png",
    faucet: 0.2,
  },

  {
    name: "Chainlink",
    symbol: "LINK",
    decimals: 18,
    price: 4.62,
    address: "0x9DeB5E5E901F84fda356869A58DcB4885FDB7080",
    image: "/images/link.png",
    faucet: 0.5,
  },
];
