// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@sismo-core/sismo-connect-solidity/contracts/libs/SismoLib.sol";

import "./IZBayVerifier.sol";

contract ZBaySismoVerifier is IZBayVerifier, SismoConnect {
    using SismoConnectHelper for SismoConnectVerifiedResult;

    error InvalidProof();

    mapping (address => mapping (uint256 => bool)) private _verifiedVaults;

    constructor(bytes16 appId_)
        SismoConnect(buildConfig(appId_))
    {}

    function verify(bytes calldata proof, uint256[] calldata signals) external returns (bool) {
        SismoConnectVerifiedResult memory result = verify({
            auth: buildAuth({authType: AuthType.VAULT}),
            responseBytes: proof,
            claim: buildClaim({
                // gitcoin passport
                groupId: 0x1cde61966decb8600dfd0749bd371f12,
                claimType: ClaimType.GTE,
                value: 15
            }),
            signature: buildSignature({ message: abi.encode(address(uint160(signals[0]))) })
        });

        if (result.claims.length == 0) {
            revert InvalidProof();
        }

        // FIXME: commented for test purposes
        // uint256 vaultId = result.getUserId(AuthType.VAULT);
        // require(!_verifiedVaults[msg.sender][vaultId], "Already verified");
        // _verifiedVaults[msg.sender][vaultId] = true;

        return true;
    }
}
