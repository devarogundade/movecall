// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MoveCallModule = buildModule("MoveCallModule", (m) => {
  const moveCall = m.contract("MoveCall", []);

  return { moveCall };
});

export default MoveCallModule;
