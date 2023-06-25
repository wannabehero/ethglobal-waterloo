import { ethers } from "hardhat";

async function main() {
  const zBay = await ethers.getContractAt("ZBay", "0x74F3FBae423654E21a8Af75022118060aA593Eff");

  await zBay._resetScore("0xE432a8314d971441Ad7700e8b45d66cC326CE517").then((tx) => tx.wait());
  await zBay._resetScore("0x030D144c32B519B497e756F488Fdc98747201029").then((tx) => tx.wait());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
