import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("zBay", function () {
  async function deployZBayFixture() {
    const [signer, buyer, seller] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken");
    const token = await MockToken.deploy();

    const MockOptimisticOracle = await ethers.getContractFactory("MockOptimisticOracle");
    const optimisticOracle = await MockOptimisticOracle.deploy();

    const ZBay = await ethers.getContractFactory("ZBay");
    const zbay = await ZBay.deploy(
      ethers.constants.AddressZero,
      optimisticOracle.address,
      token.address,
    );

    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    const trueVerifier = await MockVerifier.deploy(true);
    const falseVerifier = await MockVerifier.deploy(false);

    await Promise.all([
      token.deployed(),
      zbay.deployed(),
      trueVerifier.deployed(),
      falseVerifier.deployed(),
      optimisticOracle.deployed(),
    ]);

    await token.mint(buyer.address, ethers.utils.parseEther("1000"));

    await zbay.updateVerifiers(
      [0, 1, 2],
      [trueVerifier.address, trueVerifier.address, trueVerifier.address],
      [0, 100, 100],
    ).then((tx) => tx.wait());

    return { zbay, token, trueVerifier, falseVerifier, signer, buyer, seller };
  }

  describe("Deployment", function () {
    it("should deploy", async function () {
      const { zbay } = await loadFixture(deployZBayFixture);

      expect(zbay.address).to.match(/0x[0-9a-fA-F]{40}/);
    });
  });

  describe("Verification", function () {
    it("should submit verification", async function () {
      const { zbay, signer } = await loadFixture(deployZBayFixture);
      await zbay.submitVerification(1, ethers.utils.toUtf8Bytes("proof"), []);

      expect(await zbay.getScore(signer.address)).to.be.equal(100);
    });
  });

  describe("Products golden path", function () {
    it("should create, purchase, dispatch and deliver product", async function () {
      const { zbay, token, buyer, seller } = await loadFixture(deployZBayFixture);

      const cid = ethers.utils.toUtf8Bytes("CID");

      // verify seller
      await zbay.connect(seller)
        .submitVerification(1, ethers.utils.toUtf8Bytes("proof"), []);

      // create product
      await zbay.connect(seller).createProduct(
        ethers.utils.parseEther("100"),
        cid,
      );

      // check it's created
      let product = await zbay.getProduct(0);
      expect(product.price).to.be.equal(ethers.utils.parseEther("100"));
      expect(product.cid).to.be.equal(ethers.utils.hexlify(cid));
      expect(product.state).to.be.equal(0);

      // purchase
      await token.connect(buyer)
        .approve(zbay.address, ethers.utils.parseEther("150"));

      await zbay.connect(buyer).purchase(0);

      product = await zbay.getProduct(0);
      expect(product.state).to.be.equal(1);

      // check updated balances
      expect(await token.balanceOf(zbay.address)).to.be.equal(ethers.utils.parseEther("150"));
      expect(await token.balanceOf(buyer.address)).to.be.equal(ethers.utils.parseEther("850"));

      // dispatch
      await zbay.connect(seller).dispatch(0, 123);
      product = await zbay.getProduct(0);
      expect(product.state).to.be.equal(2);

      // confirm delivery
      await zbay.connect(buyer).confirmDelivery(0, ethers.utils.toUtf8Bytes("proof"));
      product = await zbay.getProduct(0);
      expect(product.state).to.be.equal(3);
    });
  });
});
