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

  // const MockVerifier = await ethers.getContractFactory("MockVerifier");
  // const trueVerifier = await MockVerifier.deploy(true);
  const trueVerifier = await ethers.getContractAt("MockVerifier", "0xA187567a4A87626a7DF9F5B3c389c2346Fc1D359");
  console.log("TrueVerifier deployed to:", trueVerifier.address);

  // const ZBayAttestationVerifier = await ethers.getContractFactory("ZBayAttestationVerifier");
  // const zbayAttestationVerifier = await ZBayAttestationVerifier.deploy();
  const zbayAttestationVerifier = await ethers.getContractAt("ZBayAttestationVerifier", "0x81B724d8bb2e343eb37478aE8A9f1b002f8A0aFd");
  console.log("ZBayAttestationVerifier deployed to:", zbayAttestationVerifier.address);

  const ZBayReputationVerifier = await ethers.getContractFactory("ZBayReputationVerifier");
  const zBayReputationVerifier = await ZBayReputationVerifier.deploy();
  console.log("ZBayReputationVerifier deployed to:", zBayReputationVerifier.address);

  await zbay.updateVerifiers(
    [0, 1, 2],
    [zbayAttestationVerifier.address, zBayReputationVerifier.address, trueVerifier.address],
    [0, 100, 200],
  ).then((tx) => tx.wait());

  await token.mint(signer.address, ethers.utils.parseEther("10000"));
}

async function verification() {
  const zbay = await ethers.getContractAt("ZBay", "0x93387F4cc9EC76233272D2a38Cc77a0B729925a6");

  const ZBayReputationVerifier = await ethers.getContractFactory("ZBayReputationVerifier");
  const zBayReputationVerifier = await ZBayReputationVerifier.deploy();
  console.log("ZBayReputationVerifier deployed to:", zBayReputationVerifier.address);

  await zbay.updateVerifiers(
    [1],
    [zBayReputationVerifier.address],
    [100],
  ).then((tx) => tx.wait());
}

async function mint() {
  const token = await ethers.getContractAt("MockToken", "0x9FBf4E70Aecfa43dd1B00dE828FDf68E903a6F25");
  await token.mint("0xE432a8314d971441Ad7700e8b45d66cC326CE517", ethers.utils.parseEther("10000"));
}

verification().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
