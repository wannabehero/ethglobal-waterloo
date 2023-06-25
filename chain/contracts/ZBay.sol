// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC2771Context, Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AncillaryData } from "@uma/core/contracts/common/implementation/AncillaryData.sol";
import { OptimisticOracleV3Interface } from "./vendor/OptimisticOracleV3Interface.sol";
import { OptimisticOracleV3CallbackRecipientInterface } from "./vendor/OptimisticOracleV3CallbackRecipientInterface.sol";

import "./verifiers/IZBayVerifier.sol";
import "./Structs.sol";

contract ZBay is ERC2771Context, Ownable, OptimisticOracleV3CallbackRecipientInterface {
    error InvalidProof();
    error InvalidState();
    error NotImplemented();

    event ProductCreated(uint256 indexed id, address indexed seller, uint256 indexed price, bytes cid);
    event ProductPurchased(uint256 indexed id, address indexed buyer);
    event ProductDispatched(uint256 indexed id);
    event ProductDelivered(uint256 indexed id);
    event ProductDisputed(uint256 indexed id);
    event ProductResolved(uint256 indexed id, bool indexed successfully);
    event ProductCancelled(uint256 indexed id);

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

    /// @dev Mapping of verifier scores
    mapping(address => uint32) private _verifierScores;

    /// @dev Mapping of verifiers
    mapping(uint256 => address) private _verifiers;

    uint256 constant DEFAULT_SECURITY_MULTIPLIER = 150; // /100
    uint256 constant DEFAULT_TREASURY_PERCENT = 50; // 50 = 0.5% = 0.005 (/10000)
    uint256 constant MAX_INT = 115792089237316195423570985008687907853269984665640564039457584007913129639935;

    constructor(address trustedForwarer_, OptimisticOracleV3Interface disputeOracle_, IERC20 token_)
        Ownable()
        ERC2771Context(trustedForwarer_)
    {
        _disputeOracle = disputeOracle_;
        _token = token_;
    }

    /// @dev get product details
    function getProduct(uint256 id) external view returns (ZBayProduct memory) {
        return _products[id];
    }

    function getScore(address account) external view returns (uint32) {
        return _verificationScore[account];
    }

    /// @dev verify
    function submitVerification(uint256 verifierId, bytes calldata proof, uint256[] calldata signals) external {
        address verifierAddress = _verifiers[verifierId];
        require(verifierAddress != address(0), "Verifier not found");

        IZBayVerifier verifier = IZBayVerifier(verifierAddress);
        uint32 score = _verifierScores[verifierAddress];

        if (verifier.verify(proof, signals)) {
            _verificationScore[_msgSender()] += score;
        }
    }

    /// @dev create a new product
    function createProduct(uint256 price, bytes calldata cid) external {
        require(_verificationScore[_msgSender()] >= 100, "Seller not verified");

        _products[_counter] = ZBayProduct({
            id: _counter,
            cid: cid,
            price: price,
            seller: _msgSender(),
            buyer: address(0),
            state: ZBayProductState.Created,
            attestation: 0,
            assertionId: bytes32(0),
            coef: 0
        });

        emit ProductCreated(_counter, _msgSender(), price, cid);

        _counter += 1;
    }

    /// @dev purchase a product
    function purchase(uint256 id, bytes calldata securityCoefProof) external {
        ZBayProduct storage product = _products[id];

        uint256 securityMultiplier = DEFAULT_SECURITY_MULTIPLIER;
        if (securityCoefProof.length > 0) {
            // TODO: more elaborate verification
            securityMultiplier = abi.decode(securityCoefProof, (uint256));
        }

        uint256 amountToLock = product.price * securityMultiplier / 100;

        require(product.seller != _msgSender(), "Cannot buy your own product");
        require(product.state == ZBayProductState.Created, "Invalid state");
        require(_token.balanceOf(_msgSender()) >= amountToLock, "Insufficient balance");

        _token.transferFrom(_msgSender(), address(this), amountToLock);

        product.state = ZBayProductState.Paid;
        product.buyer = _msgSender();
        product.coef = securityMultiplier;

        emit ProductPurchased(id, _msgSender());
    }

    function cancel(uint256 id) external {
        ZBayProduct storage product = _products[id];

        require(product.seller == _msgSender(), "Only seller can cancel");
        require(product.state == ZBayProductState.Created || product.state == ZBayProductState.Paid, "Invalid state");

        product.state = ZBayProductState.Cancelled;

        if (product.state == ZBayProductState.Paid) {
            uint256 amountToUnlock = product.price * product.coef / 100;
            _token.transfer(product.buyer, amountToUnlock);
        }

        emit ProductCancelled(id);
    }

    /// @dev dispatch a product
    function dispatch(uint256 id, uint256 attestation) external {
        ZBayProduct storage product = _products[id];

        require(product.seller == _msgSender(), "Only seller can dispatch");
        require(product.state == ZBayProductState.Paid, "Invalid state");

        product.state = ZBayProductState.Dispatched;
        product.attestation = attestation;

        // some networks don't have uma oracles
        if (address(_disputeOracle) != address(0)) {
            bytes memory assertedClaim = abi.encodePacked(
                "Product was dispatched 0x",
                AncillaryData.toUtf8BytesUint(product.id),
                " with metadata at ",
                product.cid,
                " seller 0x",
                AncillaryData.toUtf8BytesAddress(product.seller),
                " buyer ",
                AncillaryData.toUtf8BytesAddress(product.buyer),
                " for price 0x",
                AncillaryData.toUtf8BytesUint(product.price)
            );
            IERC20 bondCurrency = _disputeOracle.defaultCurrency();
            uint256 bondAmount = _disputeOracle.getMinimumBond(address(bondCurrency));
            if (bondAmount > 0) {
                bondCurrency.approve(address(_disputeOracle), bondAmount);
            }
            product.assertionId = _disputeOracle.assertTruth(
                assertedClaim,
                _msgSender(),
                address(this), // callback recipient
                address(0), // escalation manager
                30 days,
                bondCurrency,
                bondAmount,
                _disputeOracle.defaultIdentifier(),
                bytes32(0)
            );
            _assertionToProductId[product.assertionId] = product.id;
        }

        emit ProductDispatched(id);
    }

    /// @dev confirm delivery of a product
    function confirmDelivery(uint256 id, bytes calldata proof) external {
        ZBayProduct storage product = _products[id];

        require(product.buyer == _msgSender(), "Only buyer can confirm delivery");
        require(product.state == ZBayProductState.Dispatched, "Invalid state");

        // 0 is reserved for the attestation verifier
        uint256[] memory signals = new uint256[](2);
        signals[0] = product.attestation;
        signals[1] = uint160(_msgSender());
        bool verified = IZBayVerifier(_verifiers[0]).verify(proof, signals);
        require(verified, "Invalid proof");

        _confirmDelivery(product);

        // if (address(_disputeOracle) != address(0)) {
        //     _disputeOracle.settleAssertion(product.assertionId);
        // }
    }

    /// @dev Dispute delivery
    function disputeDelivery(uint256 id) external {
        ZBayProduct storage product = _products[id];

        require(product.buyer == _msgSender(), "Only buyer can dispute delivery");
        require(product.state == ZBayProductState.Dispatched, "Invalid state");

        product.state = ZBayProductState.Disputed;

        if (address(_disputeOracle) != address(0)) {
            _disputeOracle.disputeAssertion(product.assertionId, _msgSender());
        }

        emit ProductDisputed(id);
    }

    /// @dev UMA assertions callback
    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external {
        require(msg.sender == address(_disputeOracle));

        uint256 productId = _assertionToProductId[assertionId];
        ZBayProduct storage product = _products[productId];
        require(product.state == ZBayProductState.Dispatched || product.state == ZBayProductState.Disputed, "Invalid state");

        if (assertedTruthfully) {
            _confirmDelivery(product);
            emit ProductResolved(productId, true);
        } else {
            product.state = ZBayProductState.Cancelled;
            uint256 amountToUnLock = product.price * product.coef / 100;
            _token.transfer(product.buyer, amountToUnLock);
            emit ProductResolved(productId, false);
        }
    }

    /// @dev UMA dispute callback
    function assertionDisputedCallback(bytes32 assertionId) external {
        require(msg.sender == address(_disputeOracle));
        uint256 productId = _assertionToProductId[assertionId];
        ZBayProduct storage product = _products[productId];

        require(product.state == ZBayProductState.Dispatched, "Invalid state");
        product.state = ZBayProductState.Disputed;
        emit ProductDisputed(productId);
    }

    function _confirmDelivery(ZBayProduct storage product) internal {
        product.state = ZBayProductState.Delivered;

        uint256 amountToRelease = product.price * product.coef / 100 - product.price;
        uint256 amountToTreasury = product.price * DEFAULT_TREASURY_PERCENT / 10000; // will be left at the contract
        uint256 amountToSeller = product.price - amountToTreasury;

        _token.transfer(product.seller, amountToSeller);
        _token.transfer(product.buyer, amountToRelease);

        emit ProductDelivered(product.id);
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

    function updateVerifiers(uint256[] calldata ids, address[] calldata verifiers, uint32[] calldata scores)
        external
        onlyOwner
    {
        require(ids.length == verifiers.length, "Invalid input");
        require(ids.length == scores.length, "Invalid input");

        for (uint256 i = 0; i < ids.length; i++) {
            _verifiers[ids[i]] = verifiers[i];
            _verifierScores[verifiers[i]] = scores[i];
        }
    }
}
