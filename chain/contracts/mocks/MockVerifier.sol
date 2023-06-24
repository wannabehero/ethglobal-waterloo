// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../verifiers/IZBayVerifier.sol";

contract MockVerifier is IZBayVerifier {
    bool private _response;

    constructor(bool response_) {
        _response = response_;
    }

    function verify(bytes calldata proof, uint256[] calldata signals) external returns (bool) {
        return _response;
    }
}