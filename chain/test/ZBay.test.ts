import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("zBay", function () {
  async function deployZBayFixture() {
    const ZBay = await ethers.getContractFactory("ZBay");
    const zbay = await ZBay.deploy();
    await zbay.deployed();
    return { zbay };
  }

  describe("Deployment", function () {
    it("should deploy", async function () {
      const { zbay } = await loadFixture(deployZBayFixture);

      expect(zbay.address).to.match(/0x[0-9a-fA-F]{40}/);
    });
  });
});
