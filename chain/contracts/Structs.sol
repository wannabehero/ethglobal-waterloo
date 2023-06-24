// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

enum ZBayProductState {
    Created,
    Paid,
    Dispatched,
    Delivered,
    Disputed,
    Resolved,
    Cancelled
}

/// @dev Struct to store the details of a product
struct ZBayProduct {
    uint256 id;
    bytes32 cid;
    uint256 price; // in _token
    address seller;
    address buyer;
    ZBayProductState state;
    bytes attestation;
    bytes32 assertionId;
}