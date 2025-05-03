// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MoveCallModule from "./MoveCall";

const CounterModule = buildModule("CounterModule", (m) => {
  const { moveCall } = m.useModule(MoveCallModule);

  const counter = m.contract("Counter", [moveCall]);

  return { counter };
});

export default CounterModule;
