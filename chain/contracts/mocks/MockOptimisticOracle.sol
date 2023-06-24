// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../vendor/OptimisticOracleV3Interface.sol";

contract MockOptimisticOracle is OptimisticOracleV3Interface {
    function defaultIdentifier() external view returns (bytes32) {
        return bytes32(0);
    }

    function getAssertion(bytes32 assertionId) external view returns (Assertion memory) {

    }

    function assertTruthWithDefaults(bytes memory claim, address asserter) external returns (bytes32) {
        return bytes32(0);
    }

    function assertTruth(
        bytes memory claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        IERC20 currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external returns (bytes32) {
        return bytes32(0);
    }

    function syncUmaParams(bytes32 identifier, address currency) external {}

    function settleAssertion(bytes32 assertionId) external {}

    function settleAndGetAssertionResult(bytes32 assertionId) external returns (bool) {
        return false;
    }

    function getAssertionResult(bytes32 assertionId) external view returns (bool) {
        return false;
    }

    function getMinimumBond(address currency) external view returns (uint256) {
        return 0;
    }

    function disputeAssertion(bytes32 assertionId, address disputer) external {}
}