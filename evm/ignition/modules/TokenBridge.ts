// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MoveCallModule from "./MoveCall";
import TokenModule from "./Token";
import { parseUnits } from "viem";

const TokenBridgeModule = buildModule("TokenBridgeModule", (m) => {
  const { moveCall } = m.useModule(MoveCallModule);
  const { doge, btc, usdc, iota, link } = m.useModule(TokenModule);

  const mathLib = m.library("MathLib");

  const tokenBridge = m.contract("TokenBridge", [moveCall], {
    libraries: {
      MathLib: mathLib,
    },
  });

  m.call(doge, "transfer", [tokenBridge, parseUnits("10000000000", 18)], {
    id: "DOGE",
  });
  m.call(btc, "transfer", [tokenBridge, parseUnits("1000", 8)], { id: "BTC" });
  m.call(usdc, "transfer", [tokenBridge, parseUnits("1000000", 6)], {
    id: "USDC",
  });
  m.call(iota, "transfer", [tokenBridge, parseUnits("10000000", 18)], {
    id: "IOTA",
  });
  m.call(link, "transfer", [tokenBridge, parseUnits("10000000", 18)], {
    id: "LINK",
  });

  return { tokenBridge };
});

export default TokenBridgeModule;
