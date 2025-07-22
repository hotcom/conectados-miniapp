const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Campaign Factory to Base Sepolia...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // cBRL token address (already deployed)
  const CBRL_TOKEN_ADDRESS = "0x0f628966ea621e7283e9AB3C7935A626b9607718";
  console.log("🪙 Using cBRL token at:", CBRL_TOKEN_ADDRESS);
  
  // Deploy CampaignFactory
  console.log("\n📦 Deploying CampaignFactory...");
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  const campaignFactory = await CampaignFactory.deploy(CBRL_TOKEN_ADDRESS);
  
  await campaignFactory.deployed();
  
  console.log("✅ CampaignFactory deployed to:", campaignFactory.address);
  console.log("🔗 Transaction hash:", campaignFactory.deployTransaction.hash);
  
  // Wait for a few confirmations
  console.log("⏳ Waiting for confirmations...");
  await campaignFactory.deployTransaction.wait(3);
  
  console.log("\n🎉 Deployment completed!");
  console.log("📋 Contract addresses:");
  console.log("  - CampaignFactory:", campaignFactory.address);
  console.log("  - cBRL Token:", CBRL_TOKEN_ADDRESS);
  
  console.log("\n🔍 Verify on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${campaignFactory.address}`);
  
  // Test creating a sample campaign
  console.log("\n🧪 Testing campaign creation...");
  try {
    const tx = await campaignFactory.createCampaign(
      "Test Campaign",
      "This is a test campaign for demonstration",
      ethers.utils.parseEther("1000"), // 1000 cBRL goal
      deployer.address // beneficiary
    );
    
    const receipt = await tx.wait();
    const event = receipt.events?.find(e => e.event === 'CampaignCreated');
    
    if (event) {
      console.log("✅ Test campaign created!");
      console.log("  - Campaign ID:", event.args.campaignId.toString());
      console.log("  - Campaign Contract:", event.args.campaignContract);
      console.log("  - Goal: 1000 cBRL");
    }
  } catch (error) {
    console.log("⚠️ Test campaign creation failed (this is normal if no gas):", error.message);
  }
  
  console.log("\n📚 Next steps:");
  console.log("1. Update frontend with CampaignFactory address");
  console.log("2. Update backend with contract addresses");
  console.log("3. Test campaign creation from frontend");
  console.log("4. Test PIX donations flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
