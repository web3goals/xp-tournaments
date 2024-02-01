import { ethers } from "hardhat";

async function main() {
  console.log("👟 Start to deploy tournament contract");
  const contractFactory = await ethers.getContractFactory("Tournament");
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();
  console.log(`✅ Tournament contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
