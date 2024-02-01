import { ethers } from "hardhat";

async function main() {
  console.log("👟 Start to deploy XP contract");
  const contractFactory = await ethers.getContractFactory("XP");
  const contract = await contractFactory.deploy(ethers.parseEther("100"));
  await contract.waitForDeployment();
  console.log(`✅ XP contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
