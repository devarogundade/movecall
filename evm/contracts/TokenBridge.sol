// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {MathLib} from "./libs/MathLib.sol";
import {ITokenBridge} from "./interfaces/ITokenBridge.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenBridge is Ownable, ITokenBridge {
    uint256 internal _nonce;
    address internal _moveCall;
    mapping(bytes32 => bool) internal _claimeds;

    constructor(address moveCall_) Ownable(msg.sender) {
        _moveCall = moveCall_;
    }

    // ========== Mutable Functions ========== //

    function tokenTranfer(
        address token,
        uint256 amount,
        uint64 toChain,
        bytes32 receiver
    ) external override returns (bytes32 uid) {
        uint8 decimals = IERC20Metadata(token).decimals();
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        return _tokenTranfer(token, amount, toChain, receiver, decimals);
    }

    function tokenTranferETH(
        uint64 toChain,
        bytes32 receiver
    ) external payable override returns (bytes32 uid) {
        return _tokenTranfer(address(0), msg.value, toChain, receiver, 18);
    }

    // ========== Package Functions ========== //

    function attestTokenClaim(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        address token,
        uint8 decimals,
        uint256 amount,
        address receiver
    ) external override onlyMoveCall {
        uint8 tokenDecimals = token == address(0)
            ? 18
            : IERC20Metadata(token).decimals();

        bytes32 claimRoot = getClaimRoot(
            sourceUid,
            sourceChain,
            amount,
            decimals,
            receiver
        );

        require(!_claimeds[claimRoot], "ALREADY_CLAIMED");

        uint256 amountClaimed = MathLib.scale(amount, decimals, tokenDecimals);

        if (token == address(0)) {
            payable(receiver).transfer(amountClaimed);
        } else {
            IERC20(token).transfer(receiver, amountClaimed);
        }

        emit TokenClaimed(
            offChainSignatureId,
            sourceUid,
            sourceChain,
            token,
            decimals,
            amount,
            receiver
        );

        _claimeds[claimRoot] = true;
    }

    // ========== View Functions ========== //

    function getNonce() external view returns (uint256) {
        return _nonce;
    }

    function getClaimRoot(
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 amount,
        uint8 decimals,
        address receiver
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(sourceUid, sourceChain, amount, decimals, receiver)
            );
    }

    // ========== Private Functions ========== //

    function _tokenTranfer(
        address token,
        uint256 amount,
        uint64 toChain,
        bytes32 receiver,
        uint8 decimals
    ) internal returns (bytes32 uid) {
        uid = _getUID(token, amount, receiver);

        emit TokenTransfer(uid, token, decimals, amount, toChain, receiver);

        _nonce = _nonce + 1;
    }

    function _getUID(
        address token,
        uint256 amount,
        bytes32 receiver
    ) internal view returns (bytes32) {
        return keccak256(abi.encode(_nonce, token, amount, receiver));
    }

    // ========== Modifiers ========== //

    modifier onlyMoveCall() {
        require(_msgSender() == _moveCall);
        _;
    }
}
