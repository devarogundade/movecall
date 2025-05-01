// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { zeroAddress } from "viem";
import TokenModule from "./Token";

const MoveCall =
  "0x7b941196e87bbf0f0ee85717c68f49ad88ef598b81943ff4bde11dfea5e1b9a4";

const TokenBridgeModule = buildModule("TokenBridgeModule", (m) => {
  const tokenBridge = m.contract("TokenBridge");
  const { sui, lbtc } = m.useModule(TokenModule);

  m.call(tokenBridge, "setCoinType", [zeroAddress, `${MoveCall}::eth::ETH`], {
    id: "ETH",
  });
  m.call(tokenBridge, "setCoinType", [sui, `${MoveCall}::sui::IOTA`], {
    id: "IOTA",
  });
  m.call(tokenBridge, "setCoinType", [lbtc, `${MoveCall}::lbtc::BTC`], {
    id: "BTC",
  });

  m.call(tokenBridge, "setCoinType", [zeroAddress, `${MoveCall}::eth::ETH`], {
    id: "ETH2",
  });
  m.call(tokenBridge, "setCoinType", [sui, `${MoveCall}::sui::IOTA`], {
    id: "IOTA2",
  });
  m.call(tokenBridge, "setCoinType", [lbtc, `${MoveCall}::lbtc::BTC`], {
    id: "BTC2",
  });

  return { tokenBridge };
});

export default TokenBridgeModule;
