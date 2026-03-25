const hre = require("hardhat");

async function main() {
  console.log("Deploying BountyBoard to Avalanche Fuji...");

  const BountyBoard = await hre.ethers.getContractFactory("BountyBoard");
  const bountyBoard = await BountyBoard.deploy();

  await bountyBoard.waitForDeployment();
  const address = await bountyBoard.getAddress();

  console.log(`BountyBoard deployed to: ${address}`);
  console.log("Update src/config/contractConfig.js with this address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
