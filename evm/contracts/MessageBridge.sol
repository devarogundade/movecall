// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IMessageBridge} from "./interfaces/IMessageBridge.sol";
import {IMessageBridgeApp} from "./interfaces/IMessageBridgeApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MessageBridge is Ownable, IMessageBridge {
    uint256 internal _fee = 1_000;

    uint256 internal _nonce;
    address internal _moveCall;
    mapping(bytes32 => bool) internal _receiveds;

    constructor(address moveCall_, uint256 fee_) Ownable(msg.sender) {
        _fee = fee_;
        _moveCall = moveCall_;
    }

    // ========== Mutable Functions ========== //

    function sendMessage(
        uint64 toChain,
        address to,
        bytes memory payload
    ) external payable override returns (bytes32 uid) {
        require(_fee >= msg.value, "INSUFFICIENT FEE");

        uid = _getUID(_msgSender());

        emit MessageSent(uid, toChain, block.number, to, payload);

        _nonce = _nonce + 1;
    }

    function receiveMessage(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 sourceBlockNumber,
        bytes32 from,
        address to,
        bytes memory payload
    ) external override {
        IMessageBridgeApp(to).moveCallMessage(sourceChain, from, payload);

        require(!_receiveds[sourceUid], "ALREADY_RECEIVED");

        emit MessageReceived(
            offChainSignatureId,
            sourceUid,
            sourceChain,
            sourceBlockNumber,
            from,
            to
        );

        _receiveds[sourceUid] = true;
    }

    // ========== Private Functions ========== //

    function _getUID(address sender) internal view returns (bytes32) {
        return keccak256(abi.encode(_nonce, sender));
    }
    // ========== Modifiers ========== //

    modifier onlyMoveCall() {
        require(_msgSender() == _moveCall);
        _;
    }
}
