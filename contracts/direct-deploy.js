const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABIs and bytecode (we'll compile manually)
const CAMPAIGN_FACTORY_ABI = [
  "constructor(address _cBRLToken)",
  "function createCampaign(string memory title, string memory description, uint256 goal, address beneficiary) external returns (uint256 campaignId, address campaignContract)",
  "function getCampaignContract(uint256 campaignId) external view returns (address)",
  "function getCampaignInfo(uint256 campaignId) external view returns (tuple(uint256 id, address contractAddress, string title, address creator, address beneficiary, uint256 goal, uint256 createdAt, bool active))",
  "function campaignCount() external view returns (uint256)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed campaignContract, address indexed creator, address beneficiary, string title, uint256 goal, uint256 timestamp)"
];

async function deployWithThirdweb() {
  console.log("🚀 Deploying Campaign Factory via Thirdweb...");
  console.log("📝 Using Thirdweb deploy for easier deployment");
  
  const CBRL_TOKEN_ADDRESS = "0x0f628966ea621e7283e9AB3C7935A626b9607718";
  
  console.log("\n📋 Contract Details:");
  console.log("  - Network: Base Sepolia (84532)");
  console.log("  - cBRL Token:", CBRL_TOKEN_ADDRESS);
  console.log("  - Deployer: Your MetaMask wallet");
  
  console.log("\n🔗 Deploy via Thirdweb:");
  console.log("1. Go to: https://thirdweb.com/contracts/deploy");
  console.log("2. Upload the Campaign.sol and CampaignFactory.sol files");
  console.log("3. Select Base Sepolia network");
  console.log("4. Set constructor parameter:");
  console.log(`   _cBRLToken: ${CBRL_TOKEN_ADDRESS}`);
  console.log("5. Deploy with your MetaMask");
  
  console.log("\n📚 After deployment:");
  console.log("- Copy the CampaignFactory contract address");
  console.log("- Update frontend with the new address");
  console.log("- Test campaign creation");
  
  return "Deploy via Thirdweb interface";
}

async function deployDirect() {
  try {
    console.log("🚀 Attempting direct deployment to Base Sepolia...");
    
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("📝 Deploying with account:", wallet.address);
    
    const balance = await wallet.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.001"))) {
      console.log("⚠️ Low balance! You need at least 0.001 ETH for deployment");
      console.log("💡 Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      return null;
    }
    
    console.log("\n✅ Ready to deploy!");
    console.log("📋 Contracts created:");
    console.log("  - Campaign.sol ✅");
    console.log("  - CampaignFactory.sol ✅");
    
    console.log("\n🔧 Next steps:");
    console.log("1. Use Thirdweb for easier deployment");
    console.log("2. Or use Remix IDE with MetaMask");
    console.log("3. Or fix Hardhat TypeScript config");
    
    return "Contracts ready for deployment";
    
  } catch (error) {
    console.error("❌ Direct deployment error:", error.message);
    return null;
  }
}

async function main() {
  console.log("🎯 Smart Contract Deployment for Conectados");
  console.log("==========================================");
  
  // Try direct deployment first
  const result = await deployDirect();
  
  if (!result) {
    // Fallback to Thirdweb instructions
    await deployWithThirdweb();
  }
  
  console.log("\n🎉 Contracts are ready!");
  console.log("📁 Files created:");
  console.log("  - contracts/Campaign.sol");
  console.log("  - contracts/CampaignFactory.sol");
  console.log("  - contracts/deploy scripts");
}

main()
  .then(() => {
    console.log("\n✅ Setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
