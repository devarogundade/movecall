// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMessageBridgeApp {
    function moveCallMessage(
        uint64 sourceChain,
        bytes32 from,
        bytes memory payload
    ) external;
}
