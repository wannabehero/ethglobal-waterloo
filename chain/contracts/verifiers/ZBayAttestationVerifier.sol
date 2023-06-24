// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IZBayVerifier.sol";

contract ZBayAttestationVerifier is IZBayVerifier {
    function verify(bytes calldata proof) external returns (bool) {
        return false;
    }
}
