// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IZBayVerifier {
    function verify(bytes calldata proof, uint256[] calldata signals) external returns (bool);
}
