// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IMessageBridge {
    event MessageSent(bytes32 uid, uint64 toChain, address to, bytes payload);

    event MessageReceived(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        bytes32 from,
        address to
    );

    function sendMessage(
        uint64 toChain,
        address to,
        bytes memory payload
    ) external payable returns (bytes32 uid);

    function receiveMessage(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        bytes32 from,
        address to,
        bytes memory payload
    ) external;
}
