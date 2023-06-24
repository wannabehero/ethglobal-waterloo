// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@sismo-core/sismo-connect-solidity/contracts/libs/SismoLib.sol";

import "./IZBayVerifier.sol";

contract ZBaySismoVerifier is IZBayVerifier, SismoConnect {
    using SismoConnectHelper for SismoConnectVerifiedResult;

    error InvalidProof();

    mapping (address => mapping (uint256 => bool)) private _verifiedVaults;

    constructor(bytes16 appId_)
        SismoConnect(appId_)
    {}

    function verify(bytes calldata proof, uint256[] calldata) external returns (bool) {
        SismoConnectVerifiedResult memory result = verify({
            auth: buildAuth({authType: AuthType.VAULT}),
            responseBytes: proof,

            // TODO: better claim
            claim: buildClaim({groupId: 0x1cde61966decb8600dfd0749bd371f12})
        });

        if (result.claims.length == 0) {
            revert InvalidProof();
        }

        uint256 vaultId = result.getUserId(AuthType.VAULT);

        require(!_verifiedVaults[msg.sender][vaultId], "Already verified");
        _verifiedVaults[msg.sender][vaultId] = true;

        return true;
    }
}
