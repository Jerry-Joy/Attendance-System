const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AttendanceLedger with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const AttendanceLedger = await ethers.getContractFactory("AttendanceLedger");
  const contract = await AttendanceLedger.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nAttendanceLedger deployed to:", address);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("\nAdd this to your backend .env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
