// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IZBayVerifier.sol";
import { PlonkVerifier } from "./zk/ReputationVerifier.sol";

contract ZBayZKVerifier is IZBayVerifier {
    PlonkVerifier private _verifier;

    constructor() {
        _verifier = new PlonkVerifier();
    }

    function verify(bytes calldata proof, uint256[] calldata signals) external returns (bool) {
        return _verifier.verifyProof(proof, signals);
    }
}
