// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context, Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OptimisticOracleV3Interface } from "./vendor/OptimisticOracleV3Interface.sol";
import "@sismo-core/sismo-connect-solidity/contracts/libs/SismoLib.sol";

import "./Structs.sol";

contract ZBay is ERC2771Context, Ownable, SismoConnect {
    using SismoConnectHelper for SismoConnectVerifiedResult;

    error InvalidProof();
    error InvalidState();
    error NotImplemented();

    event ProductCreated(uint256 indexed id, address indexed seller, uint256 indexed price, bytes32 cid);

    /// @dev Will be used to resolve disputes on the delivery
    OptimisticOracleV3Interface private _disputeOracle;

    /// @dev ERC20 token used for payments
    IERC20 private _token;

    /// @dev Mapping of product id to product details
    mapping(uint256 => ZBayProduct) private _products;

    /// @dev Mapping of assertion to productId
    mapping(bytes32 => uint256) private _assertionToProductId;

    /// @dev Product counter
    uint256 private _counter;

    /// @dev Mapping of address to verification score
    mapping(address => uint32) private _verificationScore;

    /// @dev Mapping of verified vaults
    mapping(uint256 => bool) private _verifiedVaults;

    uint256 constant DEFAULT_SECURITY_MULTIPLIER = 150; // /100
    uint256 constant DEFAULT_TREASURY_PERCENT = 50; // 50 = 0.5% = 0.005 (/10000)
    uint256 constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

    constructor(address trustedForwarer_, OptimisticOracleV3Interface disputeOracle_, IERC20 token_)
        Ownable()
        SismoConnect(0x10f9c1b389261a5bbc0ccd0c094d1e78)
        ERC2771Context(trustedForwarer_)
    {
        _disputeOracle = disputeOracle_;
        _token = token_;

        _token.approve(address(_disputeOracle), MAX_INT);
    }

    /// @dev get product details
    function getProduct(uint256 id) external view returns (ZBayProduct memory) {
        return _products[id];
    }

    /// @dev sismo verification
    function submitVaultVerification(bytes calldata proof) external {
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

        require(!_verifiedVaults[vaultId], "Already verified");
        _verifiedVaults[vaultId] = true;

        _verificationScore[_msgSender()] += 100;
    }

    /// @dev custom verification
    function submitCustomVerifiction(bytes calldata proof) external {
        revert NotImplemented();
    }

    /// @dev create a new product
    function createProduct(uint256 price, bytes32 cid) external {
        require(_verificationScore[_msgSender()] >= 100, "Seller not verified");

        _products[_counter] = ZBayProduct({
            id: _counter,
            cid: cid,
            price: price,
            seller: _msgSender(),
            buyer: address(0),
            state: ZBayProductState.Created,
            attestation: "",
            assestionId: bytes32(0)
        });

        emit ProductCreated(_counter, _msgSender(), price, cid);

        _counter += 1;
    }

    /// @dev purchase a product
    function purchase(uint256 id) external {
        ZBayProduct storage product = _products[id];

        uint256 amountToLock = product.price * DEFAULT_SECURITY_MULTIPLIER / 100;

        require(product.seller != _msgSender(), "Cannot buy your own product");
        require(product.state == ZBayProductState.Created, "Invalid state");
        require(_token.balanceOf(_msgSender()) >= amountToLock, "Insufficient balance");

        _token.transferFrom(_msgSender(), address(this), amountToLock);

        product.state = ZBayProductState.Paid;
        product.buyer = _msgSender();
    }

    /// @dev dispatch a product
    function dispatch(uint256 id, bytes calldata attestation) external {
        ZBayProduct storage product = _products[id];

        require(product.seller == _msgSender(), "Only seller can dispatch");
        require(product.state == ZBayProductState.Paid, "Invalid state");

        product.state = ZBayProductState.Dispatched;
        product.attestation = attestation;

        bytes memory assertedClaim = abi.encodePacked(
            "Product was dispatched ",
            product.id,
            " with metadata at ",
            product.cid,
            " seller ",
            product.seller,
            " buyer ",
            product.buyer,
            " at price ",
            product.price
        );
        product.assestionId = _disputeOracle.assertTruth(
            assertedClaim,
            _msgSender(),
            address(this), // callback recipient
            address(0), // escalation manager
            30 days,
            _token,
            product.price / 2, // bond is 50% of the price
            "ASSERT_TRUTH",
            bytes32(0)
        );
        _assertionToProductId[product.assestionId] = product.id;
    }

    /// @dev confirm delivery of a product
    function confirmDelivery(uint256 id, bytes calldata proof) external {
        ZBayProduct storage product = _products[id];

        require(product.buyer == _msgSender(), "Only buyer can confirm delivery");
        require(product.state == ZBayProductState.Dispatched, "Invalid state");

        product.state = ZBayProductState.Delivered;
        // TODO: validate the proof

        uint256 amountToRelease = product.price * DEFAULT_SECURITY_MULTIPLIER / 100 - product.price;
        uint256 amountToTreasury = product.price * DEFAULT_TREASURY_PERCENT / 10000; // will be left at the contract
        uint256 amountToSeller = product.price - amountToTreasury;

        _token.transfer(product.seller, amountToSeller);
        _token.transfer(_msgSender(), amountToRelease);
    }

    /// @dev Dispute delivery
    function disputeDelivery(uint256 id) external {
        ZBayProduct storage product = _products[id];

        require(product.buyer == _msgSender(), "Only buyer can dispute delivery");
        require(product.state == ZBayProductState.Dispatched, "Invalid state");

        product.state = ZBayProductState.Disputed;
        _disputeOracle.disputeAssertion(product.assestionId, _msgSender());
    }

    /// @dev UMA assertions callback
    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) public {
        require(msg.sender == address(_disputeOracle));

        uint256 productId = _assertionToProductId[assertionId];
        ZBayProduct storage product = _products[productId];
        require(product.state == ZBayProductState.Dispatched, "Invalid state");

        if (assertedTruthfully) {
            // TODO: assume correct sell
        } else {
            // TODO: refund
            product.state = ZBayProductState.Cancelled;
            uint256 amountToUnLock = product.price * DEFAULT_SECURITY_MULTIPLIER / 100;
            _token.transfer(product.buyer, amountToUnLock);
        }
    }

    /// @dev required override
    function _msgData()
        internal view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }

    /// @dev required override
    function _msgSender()
        internal view
        override(Context, ERC2771Context)
        returns (address)
    {
        return ERC2771Context._msgSender();
    }
}
