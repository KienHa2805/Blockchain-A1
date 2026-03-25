// Deploy StudentToken to Sepolia and transfer 914 tokens with custom payload.
// Usage: npx hardhat run scripts/deploy-and-interact.js --network sepolia

const hre = require("hardhat");

async function main() {
  // =========================================================================
  // Configuration
  // =========================================================================
  const RECIPIENT_ADDRESS = "0xee0633a08b3a0d4ff5170baecab215359731524b";
  const TRANSFER_AMOUNT = "914";
  const PAYLOAD_STRING = "FINAL-S4112914";
  const INITIAL_SUPPLY = 10000;

  // =========================================================================
  // Step 1: Connect to Deployer Wallet
  // =========================================================================
  const [deployer] = await hre.ethers.getSigners();
  console.log("=".repeat(60));
  console.log("Deployer address :", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance :", hre.ethers.formatEther(balance), "ETH");
  console.log("=".repeat(60));

  // =========================================================================
  // Step 2: Deploy StudentToken Contract
  // =========================================================================
  console.log("\n[Step 1] Deploying StudentToken contract...");
  const TokenFactory = await hre.ethers.getContractFactory("StudentToken");
  const token = await TokenFactory.deploy(INITIAL_SUPPLY);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  const deploymentTx = await token.deploymentTransaction();
  const deploymentTxHash = deploymentTx.hash;

  console.log("✅ Token deployed at       :", tokenAddress);
  console.log("   Deployment Tx hash      :", deploymentTxHash);
  console.log("   Token name              :", await token.name());
  console.log("   Token symbol            :", await token.symbol());
  console.log("   Total supply            :", hre.ethers.formatUnits(await token.totalSupply(), 18), "STK");
  console.log("   Deployer token balance  :", hre.ethers.formatUnits(await token.balanceOf(deployer.address), 18), "STK");

  // =========================================================================
  // Step 3: Prepare Transfer with Custom Payload
  // =========================================================================
  console.log("\n[Step 2] Preparing transfer with payload...");
  const amountInWei = hre.ethers.parseUnits(TRANSFER_AMOUNT, 18);
  
  // ABI-encode the standard transfer(address, uint256) call
  const transferCalldata = token.interface.encodeFunctionData("transfer", [
    RECIPIENT_ADDRESS,
    amountInWei,
  ]);
  
  // Convert payload string to hex and append to calldata
  const payloadBytes = hre.ethers.toUtf8Bytes(PAYLOAD_STRING);
  const payloadHex = hre.ethers.hexlify(payloadBytes);
  const combinedData = transferCalldata + payloadHex.slice(2);
  
  console.log("   Payload string:", PAYLOAD_STRING);
  console.log("   Payload hex:", payloadHex);

  // =========================================================================
  // Step 4: Send Transfer Transaction
  // =========================================================================
  console.log("\n[Step 3] Sending transfer transaction...");
  const tx = await deployer.sendTransaction({
    to: tokenAddress,
    data: combinedData,
  });

  console.log("   Transaction hash :", tx.hash);
  console.log("   Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("   ✅ Confirmed in block :", receipt.blockNumber);
  console.log("   Gas used :", receipt.gasUsed.toString());

  // =========================================================================
  // Step 5: Verify Final Balances
  // =========================================================================
  console.log("\n[Step 4] Verifying balances...");
  const deployerBalance = await token.balanceOf(deployer.address);
  const recipientBalance = await token.balanceOf(RECIPIENT_ADDRESS);
  console.log("   Deployer balance :", hre.ethers.formatUnits(deployerBalance, 18), "STK");
  console.log("   Recipient balance :", hre.ethers.formatUnits(recipientBalance, 18), "STK");

  // =========================================================================
  // Submission Summary
  // =========================================================================
  console.log("\n" + "=".repeat(60));
  console.log("📋 SUBMISSION SUMMARY");
  console.log("=".repeat(60));
  console.log("\n📝 DEPLOYMENT RECORD");
  console.log("   Contract address:", tokenAddress);
  console.log("   Deployment Tx hash:", deploymentTxHash);
  console.log("   Deployment Explorer: https://sepolia.etherscan.io/tx/" + deploymentTxHash);
  console.log("\n📝 INTERACTION RECORD (with FINAL Payload)");
  console.log("   Interaction Tx hash:", tx.hash);
  console.log("   Payload string:", PAYLOAD_STRING);
  console.log("   Payload hex: 0x46494e414c2d5334313132393134");
  console.log("   Interaction Explorer: https://sepolia.etherscan.io/tx/" + tx.hash);
  console.log("\n📝 TRANSFER DETAILS");
  console.log("   Tokens transferred:", TRANSFER_AMOUNT, "STK");
  console.log("   Recipient address:", RECIPIENT_ADDRESS);
  console.log("\n" + "=".repeat(60));
}

// Run the main function and handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
