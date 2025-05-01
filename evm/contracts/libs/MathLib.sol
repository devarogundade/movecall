// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library MathLib {
    function scale(
        uint256 value,
        uint8 decimals,
        uint8 decimalsTarget
    ) public pure returns (uint256) {
        if (decimals == decimalsTarget) {
            return value;
        } else if (decimals > decimalsTarget) {
            return value / pow10(decimals - decimalsTarget);
        } else {
            return value * pow10(decimalsTarget - decimals);
        }
    }

    function pow10(uint8 exp) internal pure returns (uint256) {
        return 10 ** uint256(exp);
    }
}
