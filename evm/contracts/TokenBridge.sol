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
    mapping(address => string) internal _coinTypes;
    mapping(bytes32 => bool) internal _claimeds;

    constructor(address moveCall_) Ownable(msg.sender) {
        _moveCall = moveCall_;
    }

    // ========== Mutable Functions ========== //

    function tokenTranfer(
        address token,
        uint256 amount,
        bytes32 receiver
    ) external override {
        uint8 decimals = IERC20Metadata(token).decimals();
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        _tokenTranfer(token, amount, receiver, decimals);
    }

    function tokenTranferETH(bytes32 receiver) external payable override {
        _tokenTranfer(address(0), msg.value, receiver, 18);
    }

    // ========== Admin Functions ========== //

    function setCoinType(
        address token,
        string memory coinType
    ) external onlyOwner {
        _coinTypes[token] = coinType;
    }

    // ========== Package Functions ========== //

    function attestTokenClaim(
        bytes32 offChainSignatureId,
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 sourceBlockNumber,
        address token,
        uint256 amount,
        uint8 decimals,
        address receiver
    ) external override onlyMoveCall {
        uint8 tokenDecimals = token == address(0)
            ? 18
            : IERC20Metadata(token).decimals();

        uint256 amountClaimed = MathLib.scale(amount, decimals, tokenDecimals);

        bytes32 claimRoot = getClaimRoot(
            sourceUid,
            sourceChain,
            sourceBlockNumber,
            amount,
            decimals,
            receiver
        );

        require(!_claimeds[claimRoot], "ALREADY_CLAIMED");

        if (token == address(0)) {
            payable(receiver).transfer(amountClaimed);
        } else {
            IERC20(token).transfer(receiver, amountClaimed);
        }

        emit TokenClaimed(
            offChainSignatureId,
            sourceUid,
            sourceChain,
            sourceBlockNumber,
            token,
            amount,
            decimals,
            receiver
        );

        _claimeds[claimRoot] = true;
    }

    // ========== View Functions ========== //

    function getNonce() external view returns (uint256) {
        return _nonce;
    }

    function getCoinType(address token) external view returns (string memory) {
        return _coinTypes[token];
    }

    function getClaimRoot(
        bytes32 sourceUid,
        uint64 sourceChain,
        uint256 sourceBlockNumber,
        uint256 amount,
        uint8 decimals,
        address receiver
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    sourceUid,
                    sourceChain,
                    sourceBlockNumber,
                    amount,
                    decimals,
                    receiver
                )
            );
    }

    // ========== Private Functions ========== //

    function _tokenTranfer(
        address token,
        uint256 amount,
        bytes32 receiver,
        uint8 decimals
    ) internal {
        emit TokenTransfer(
            _getUID(token, amount, receiver),
            _coinTypes[token],
            decimals,
            amount,
            receiver
        );
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
