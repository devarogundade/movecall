// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ITokenBridge} from "./interfaces/ITokenBridge.sol";
import {IMessageBridge} from "./interfaces/IMessageBridge.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MoveCall is Ownable {
    ITokenBridge internal _tokenBridge;
    IMessageBridge internal _messageBridge;

    constructor() Ownable(msg.sender) {}

    function receiveMessage(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 sourceBlockNumber,
        bytes memory payload,
        bytes32 from,
        address to
    ) external onlyOwner {
        _messageBridge.receiveMessage(
            offChainSignatureId,
            sourceUid,
            sourceChain,
            sourceBlockNumber,
            from,
            to,
            payload
        );
    }

    function attestTokenClaim(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 sourceBlockNumber,
        address token,
        uint256 amount,
        uint8 decimals,
        address receiver
    ) external onlyOwner {
        _tokenBridge.attestTokenClaim(
            offChainSignatureId,
            sourceUid,
            sourceChain,
            sourceBlockNumber,
            token,
            amount,
            decimals,
            receiver
        );
    }
}
