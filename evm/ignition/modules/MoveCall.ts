import { parseEther, parseUnits } from "viem";
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import TokenModule from "./Token";

const MoveCallModule = buildModule("MoveCallModule", (m) => {
  const moveCall = m.contract("MoveCall", []);
  const { doge, btc, usdc, iota, link } = m.useModule(TokenModule);

  const mathLib = m.library("MathLib");
  const messageBridge = m.contract("MessageBridge", [
    moveCall,
    parseEther("0.001"),
  ]);
  const tokenBridge = m.contract("TokenBridge", [moveCall], {
    libraries: {
      MathLib: mathLib,
    },
  });
  const counter = m.contract("Counter", [moveCall]);
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

  m.call(moveCall, "setBridges", [tokenBridge, messageBridge]);

  return { moveCall, messageBridge, tokenBridge, counter };
});

export default MoveCallModule;
