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
  image: string;
  faucet: number;
};

export type Notification = {
  title: string;
  description: string;
  category: string;
  linkTitle?: string;
  linkUrl?: string;
};
