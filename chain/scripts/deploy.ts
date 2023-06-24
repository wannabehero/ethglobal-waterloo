import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  // const MockToken = await ethers.getContractFactory("MockToken");
  // const token = await MockToken.deploy();
  // await token.deployed();
  const token = await ethers.getContractAt("MockToken", "0x9FBf4E70Aecfa43dd1B00dE828FDf68E903a6F25");
  console.log("Token deployed to:", token.address);

  const ZBay = await ethers.getContractFactory("ZBay");
  const zbay = await ZBay.deploy(
    ethers.constants.AddressZero, // trusted forwarer
    "0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D", // optimistic oracle for polygon mainnet
    token.address,
  );
  await zbay.deployed();
  console.log("ZBay deployed to:", zbay.address);

  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const trueVerifier = await MockVerifier.deploy(true);
  console.log("TrueVerifier deployed to:", trueVerifier.address);

  await zbay.updateVerifiers(
    [0, 1, 2],
    [trueVerifier.address, trueVerifier.address, trueVerifier.address],
    [0, 100, 100],
  ).then((tx) => tx.wait());

  await token.mint(signer.address, ethers.utils.parseEther("10000"));
}

async function verification() {
  const zbay = await ethers.getContractAt("ZBay", "0x1951c64074f0c71125e2db34f4aCc55E3a4438A9");
  await zbay
    .submitVerification(1, ethers.utils.toUtf8Bytes("proof"), []);
}

verification().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
