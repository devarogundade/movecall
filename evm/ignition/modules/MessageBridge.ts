// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MoveCallModule from "./MoveCall";
import { parseEther } from "viem";

const MessageBridgeModule = buildModule("MessageBridgeModule", (m) => {
  const { moveCall } = m.useModule(MoveCallModule);

  const messageBridge = m.contract("MessageBridge", [
    moveCall,
    parseEther("0.001"),
  ]);

  return { messageBridge };
});

export default MessageBridgeModule;
