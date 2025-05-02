// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "viem";

const TokenModule = buildModule("TokenModule", (m) => {
  const doge = m.contract("Token", ["Dogecoin", "DOGE", 18], {
    id: "Token_DOGE",
  });
  const btc = m.contract("Token", ["Bitcoin", "BTC", 8], {
    id: "Token_BTC",
  });
  const usdc = m.contract("Token", ["USDC", "USDC", 6], {
    id: "Token_BTC",
  });
  const iota = m.contract("Token", ["IOTA", "IOTA", 18], { id: "Token_IOTA" });
  const link = m.contract("Token", ["Chainlink", "LINK", 18], {
    id: "Token_LINK",
  });

  m.call(iota, "mint", [parseUnits("10000000000", 18)], { id: "DOGE" });
  m.call(btc, "mint", [parseUnits("1000", 8)], { id: "BTC" });
  m.call(usdc, "mint", [parseUnits("1000000", 6)], { id: "USDC" });
  m.call(iota, "mint", [parseUnits("10000000", 18)], { id: "IOTA" });
  m.call(link, "mint", [parseUnits("10000000", 18)], { id: "LINK" });

  return { doge, btc, usdc, iota, link };
});

export default TokenModule;
