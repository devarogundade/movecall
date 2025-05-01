// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "viem";

const TokenModule = buildModule("TokenModule", (m) => {
  const sui = m.contract("Token", ["IOTA", "IOTA", 9], { id: "Token_IOTA" });
  const lbtc = m.contract("Token", ["Bitcoin", "BTC", 8], {
    id: "Token_BTC",
  });

  m.call(sui, "mint", [parseUnits("1", 9)], { id: "IOTA" });
  m.call(lbtc, "mint", [parseUnits("0.5", 8)], { id: "BTC" });

  return { sui, lbtc };
});

export default TokenModule;
