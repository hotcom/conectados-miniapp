const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Campaign Factory to Base Sepolia...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  // cBRL token address (already deployed)
  const CBRL_TOKEN_ADDRESS = "0x0f628966ea621e7283e9AB3C7935A626b9607718";
  console.log("🪙 Using cBRL token at:", CBRL_TOKEN_ADDRESS);
  
  // Deploy CampaignFactory
  console.log("\n📦 Deploying CampaignFactory...");
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy(CBRL_TOKEN_ADDRESS);
  
  await campaignFactory.deployed();
  
  console.log("✅ CampaignFactory deployed to:", campaignFactory.address);
  console.log("🔗 Transaction hash:", campaignFactory.deployTransaction.hash);
  
  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await campaignFactory.deployTransaction.wait(2);
  
  console.log("\n🎉 Deployment completed!");
  console.log("📋 Contract addresses:");
  console.log("  - CampaignFactory:", campaignFactory.address);
  console.log("  - cBRL Token:", CBRL_TOKEN_ADDRESS);
  
  console.log("\n🔍 Verify on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${campaignFactory.address}`);
  
  return campaignFactory.address;
}

main()
  .then((address) => {
    console.log("\n✅ SUCCESS! CampaignFactory deployed at:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
