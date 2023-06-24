// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IZBayVerifier {
    function verify(bytes calldata proof) external returns (bool);
}
