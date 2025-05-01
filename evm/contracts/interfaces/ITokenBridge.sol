// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITokenBridge {
    event TokenTransfer(
        bytes32 indexed uid,
        string coinType,
        uint256 decimals,
        uint256 amount,
        bytes32 receiver
    );

    event TokenClaimed(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        address token,
        uint256 amount,
        uint8 decimals,
        address receiver
    );

    function tokenTranfer(
        address token,
        uint256 amount,
        bytes32 receiver
    ) external;

    function tokenTranferETH(bytes32 receiver) external payable;

    function attestTokenClaim(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        address token,
        uint256 amount,
        uint8 decimals,
        address receiver
    ) external;
}
