import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const MockToken = await ethers.getContractFactory("MockToken");
  const token = await MockToken.deploy();
  await token.deployed();
  // const token = await ethers.getContractAt("MockToken", "0xd8770Db54Fe49B82Aa93c308284Ec40a43a3BD54");
  console.log("Token deployed to:", token.address);

  const ZBay = await ethers.getContractFactory("ZBay");
  const zbay = await ZBay.deploy(
    ethers.constants.AddressZero, // trusted forwarer
    ethers.constants.AddressZero, // oracle
    // "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB", // oracle for goerli
    token.address,
  );
  await zbay.deployed();
  console.log("ZBay deployed to:", zbay.address);

  const ZBayAttestationVerifier = await ethers.getContractFactory("ZBayAttestationVerifier");
  const zbayAttestationVerifier = await ZBayAttestationVerifier.deploy();
  await zbayAttestationVerifier.deployed();
  console.log("ZBayAttestationVerifier deployed to:", zbayAttestationVerifier.address);

  const ZBayReputationVerifier = await ethers.getContractFactory("ZBayReputationVerifier");
  const zBayReputationVerifier = await ZBayReputationVerifier.deploy();
  await zBayReputationVerifier.deployed();
  console.log("ZBayReputationVerifier deployed to:", zBayReputationVerifier.address);

  const ZBaySismoVerifier = await ethers.getContractFactory("ZBaySismoVerifier");
  const zBaySismoVerifier = await ZBaySismoVerifier.deploy("0x10f9c1b389261a5bbc0ccd0c094d1e78");
  await zBaySismoVerifier.deployed();
  console.log("ZBaySismoVerifier deployed to:", zBaySismoVerifier.address);

  await zbay.updateVerifiers(
    [0, 1, 2],
    [zbayAttestationVerifier.address, zBayReputationVerifier.address, zBaySismoVerifier.address],
    [0, 100, 200],
  ).then((tx) => tx.wait());

  await token.mint(signer.address, ethers.utils.parseEther("10000"));
}

async function verification() {
  // const zbay = await ethers.getContractAt("ZBay", "0x51B561c4FAFdb5f508B38Aa8a7079234bb9B8888");
  const zbayAttestationVerifier = await ethers.getContractAt("ZBayAttestationVerifier", "0x113B1C12ad36C5ED1C0b348Bd0f5cb168d7e7993");
  const zBayReputationVerifier = await ethers.getContractAt("ZBayReputationVerifier", "0xacbeA74C4C6B8616B0B1Ad99DEeF02202d3f50Be");
  const zBaySismoVerifier = await ethers.getContractAt("ZBaySismoVerifier", "0x1059eC94528421f272aF9910948C5014CecC11A5");
  const token = await ethers.getContractAt("MockToken", "0xd8770Db54Fe49B82Aa93c308284Ec40a43a3BD54");

  const ZBay = await ethers.getContractFactory("ZBay");
  const zbay = await ZBay.deploy(
    ethers.constants.AddressZero, // trusted forwarer
    "0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB", // optimistic oracle for goerli
    token.address,
  );
  await zbay.deployed();
  console.log("ZBay deployed to:", zbay.address);

  await zbay.updateVerifiers(
    [0, 1, 2],
    [zbayAttestationVerifier.address, zBayReputationVerifier.address, zBaySismoVerifier.address],
    [0, 100, 200],
  ).then((tx) => tx.wait());

  console.log('updated');

  await token.mint("0xE432a8314d971441Ad7700e8b45d66cC326CE517", ethers.utils.parseEther("10000")).then((tx) => tx.wait());
  await token.mint("0x030D144c32B519B497e756F488Fdc98747201029", ethers.utils.parseEther("10000")).then((tx) => tx.wait());
}

async function ver2() {
  const ZBaySismoVerifier = await ethers.getContractFactory("ZBaySismoVerifier");
  const zBaySismoVerifier = await ZBaySismoVerifier.deploy("0x10f9c1b389261a5bbc0ccd0c094d1e78");
  console.log("ZBaySismoVerifier deployed to:", zBaySismoVerifier.address);

  const zbay = await ethers.getContractAt("ZBay", "0x93387F4cc9EC76233272D2a38Cc77a0B729925a6");
  await zbay.updateVerifiers(
    [2],
    [zBaySismoVerifier.address],
    [200],
  ).then((tx) => tx.wait());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
