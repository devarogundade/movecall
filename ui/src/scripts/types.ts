import type { Hex } from "viem";

export type Chain = {
  id: number;
  name: string;
  symbol: string;
  image: string;
};

export type Token = {
  name: string;
  symbol: string;
  decimals: { [key: number]: number };
  address: { [key: number]: Hex };
  metadata: { [key: number]: Hex };
  faucet: { [key: number]: Hex };
  module: { [key: number]: string };
  image: string;
  faucetAmount: number;
};

export type Strategy = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  image: string;
  about: string;
  link: string;
  faucet: number;
};

export type Notification = {
  title: string;
  description: string;
  category: string;
  linkTitle?: string;
  linkUrl?: string;
};
