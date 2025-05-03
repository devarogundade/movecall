// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ITokenBridge {
    event TokenTransfer(
        bytes32 indexed uid,
        address token,
        uint256 decimals,
        uint256 amount,
        uint64 toChain,
        bytes32 receiver
    );

    event TokenClaimed(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        address token,
        uint8 decimals,
        uint256 amount,
        address receiver
    );

    function tokenTransfer(
        address token,
        uint256 amount,
        uint64 toChain,
        bytes32 receiver
    ) external returns (bytes32 uid);

    function tokenTransferETH(
        uint64 toChain,
        bytes32 receiver
    ) external payable returns (bytes32 uid);

    function attestTokenClaim(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        address token,
        uint8 decimals,
        uint256 amount,
        address receiver
    ) external;
}
