// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IMessageBridgeApp} from "../interfaces/IMessageBridgeApp.sol";

contract Counter is IMessageBridgeApp {
    uint256 internal _value;
    address internal _moveCall;

    constructor(address moveCall_) {
        _moveCall = moveCall_;
    }

    function moveCallMessage(
        uint64, // sourceChain
        bytes32, // from
        bytes memory payload
    ) external override onlyMoveCall {
        _value += abi.decode(payload, (uint256));
    }

    function getValue() external view returns (uint256) {
        return _value;
    }

    modifier onlyMoveCall() {
        require(msg.sender == _moveCall, "ONLY_MOVECALL");
        _;
    }
}
