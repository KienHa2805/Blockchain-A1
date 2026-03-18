// ============================================================================
// deploy-and-interact.js
// Deploys the StudentToken ERC-20 contract to Sepolia and sends a transfer
// transaction that carries a custom data payload on-chain.
//
// Usage:  npx hardhat run scripts/deploy-and-interact.js --network sepolia
// ============================================================================

const hre = require("hardhat");

async function main() {
  // ==========================================================================
  // 0.  CONFIGURATION — edit these two values before running
  // ==========================================================================

  // Recipient address 
  const RECIPIENT_ADDRESS = "0xee0633a08b3a0d4ff5170baecab215359731524b";

  // The number of whole tokens to transfer (last 3 digits of student ID).
  const TRANSFER_AMOUNT = "914";

  // The string that must appear in the transaction's data field.
  const PAYLOAD_STRING = "FINAL-S4112914";

  // Initial supply of tokens minted to the deployer at deployment.
  const INITIAL_SUPPLY = 10000; // 10,000 whole tokens

  // ==========================================================================
  // 1.  CONNECT — get the deployer signer (first account from Hardhat config)
  // ==========================================================================
  const [deployer] = await hre.ethers.getSigners();
  console.log("=".repeat(60));
  console.log("Deployer address :", deployer.address);

  // Show the deployer's ETH balance so we know we have gas money.
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance :", hre.ethers.formatEther(balance), "ETH");
  console.log("=".repeat(60));

  // ==========================================================================
  // 2.  DEPLOY — compile & deploy the StudentToken contract
  // ==========================================================================
  console.log("\n[Step 1] Deploying StudentToken contract...");

  // `getContractFactory` compiles the contract (if needed) and returns a
  // factory object that can deploy new instances.
  const TokenFactory = await hre.ethers.getContractFactory("StudentToken");

  // `deploy(initialSupply)` sends a deployment transaction to the network.
  // The constructor receives `initialSupply` and mints that many tokens
  // (scaled by 10^18 decimals) to the deployer.
  const token = await TokenFactory.deploy(INITIAL_SUPPLY);

  // Wait for the deployment transaction to be mined.
  await token.waitForDeployment();

  // Retrieve the on-chain address of the newly deployed contract.
  const tokenAddress = await token.getAddress();

  // Get the deployment transaction hash for submission record.
  const deploymentTx = await token.deploymentTransaction();
  const deploymentTxHash = deploymentTx.hash;

  console.log("✅ Token deployed at       :", tokenAddress);
  console.log("   Deployment Tx hash      :", deploymentTxHash);
  console.log("   Token name              :", await token.name());
  console.log("   Token symbol            :", await token.symbol());
  console.log("   Total supply            :", hre.ethers.formatUnits(await token.totalSupply(), 18), "STK");
  console.log("   Deployer token balance  :", hre.ethers.formatUnits(await token.balanceOf(deployer.address), 18), "STK");

  // ==========================================================================
  // 3.  TRANSFER WITH CUSTOM DATA PAYLOAD
  // ==========================================================================
  //
  // HOW THIS WORKS
  // ──────────────
  // A normal ERC-20 transfer calls:   token.transfer(recipient, amount)
  //
  // Under the hood, Ethers.js constructs a transaction whose `data` field is
  // the ABI-encoded function call:
  //     ┌─────────────┬──────────────────┬──────────────────┐
  //     │  4-byte      │  32-byte padded  │  32-byte padded  │
  //     │  selector    │  recipient addr  │  uint256 amount  │
  //     │  (0xa9059cbb)│                  │                  │
  //     └─────────────┴──────────────────┴──────────────────┘
  //
  // The EVM's ABI decoder only reads those 68 bytes.  Any EXTRA bytes we
  // append after them are IGNORED by the function logic but are permanently
  // recorded in the transaction's input data on-chain.
  //
  // So our strategy is:
  //   1. ABI-encode the transfer(address, uint256) call as usual.
  //   2. Convert "FINAL-S4112914" to its hexadecimal representation.
  //   3. Concatenate (2) onto the end of (1).
  //   4. Send a raw transaction with this combined `data` to the token
  //      contract address.
  //
  // The result: the ERC-20 transfer executes normally AND the custom string
  // is visible in the transaction's input data on any block explorer.
  // ==========================================================================

  console.log("\n[Step 2] Preparing transfer of", TRANSFER_AMOUNT, "STK with payload...");

  // --- 3a. Convert the token amount to the smallest unit (18 decimals) ------
  const amountInWei = hre.ethers.parseUnits(TRANSFER_AMOUNT, 18);

  // --- 3b. ABI-encode the transfer(address, uint256) function call ----------
  //     This produces the exact bytes the EVM expects for calling transfer().
  const transferCalldata = token.interface.encodeFunctionData("transfer", [
    RECIPIENT_ADDRESS,
    amountInWei,
  ]);
  console.log("   ABI-encoded transfer()  :", transferCalldata);

  // --- 3c. Convert the payload string to hexadecimal ------------------------
  //     "FINAL-S4112914" → each character's ASCII code in hex.
  //     ethers.toUtf8Bytes("FINAL-S4112914") → Uint8Array of bytes
  //     ethers.hexlify(...)                  → "0x46494e414c2d5334313132393134"
  const payloadBytes = hre.ethers.toUtf8Bytes(PAYLOAD_STRING);
  const payloadHex   = hre.ethers.hexlify(payloadBytes);
  console.log("   Payload string          :", PAYLOAD_STRING);
  console.log("   Payload hex             :", payloadHex);

  // --- 3d. Concatenate:  transferCalldata + payloadHex (strip its 0x) -------
  //     We remove the leading "0x" from payloadHex before appending so we
  //     don't get a double "0x" in the middle of the byte string.
  const combinedData = transferCalldata + payloadHex.slice(2);
  console.log("   Combined tx data        :", combinedData);

  // --- 3e. Send the raw transaction -----------------------------------------
  //     Instead of calling token.transfer() through ethers (which would not
  //     let us append extra data), we send a low-level transaction directly.
  //     `to` is the token contract, `data` is our crafted payload.
  console.log("\n[Step 3] Sending transfer transaction...");
  const tx = await deployer.sendTransaction({
    to: tokenAddress,      // send TO the token contract
    data: combinedData,    // our custom data (transfer call + payload)
    // No `value` needed — this is not an ETH transfer, it's a contract call.
  });

  console.log("   Transaction hash        :", tx.hash);
  console.log("   Waiting for confirmation...");

  // Wait for the transaction to be included in a block.
  const receipt = await tx.wait();
  console.log("   ✅ Confirmed in block   :", receipt.blockNumber);
  console.log("   Gas used                :", receipt.gasUsed.toString());

  // ==========================================================================
  // 4.  VERIFY — check final balances
  // ==========================================================================
  console.log("\n[Step 4] Verifying balances...");
  const deployerBalance  = await token.balanceOf(deployer.address);
  const recipientBalance = await token.balanceOf(RECIPIENT_ADDRESS);

  console.log("   Deployer balance        :", hre.ethers.formatUnits(deployerBalance, 18), "STK");
  console.log("   Recipient balance       :", hre.ethers.formatUnits(recipientBalance, 18), "STK");

  // ==========================================================================
  // 5.  SUMMARY
  // ==========================================================================
  console.log("\n" + "=".repeat(60));
  console.log("📋 SUBMISSION SUMMARY");
  console.log("=".repeat(60));
  console.log("\n📝 DEPLOYMENT RECORD");
  console.log("   Contract address        :", tokenAddress);
  console.log("   Deployment Tx hash      :", deploymentTxHash);
  console.log("   Deployment Explorer    : https://sepolia.etherscan.io/tx/" + deploymentTxHash);
  
  console.log("\n📝 INTERACTION RECORD (with FINAL Payload)");
  console.log("   Interaction Tx hash     :", tx.hash);
  console.log("   Payload string          :", PAYLOAD_STRING);
  console.log("   Payload hex             : 0x46494e414c2d5334313132393134");
  console.log("   Interaction Explorer    : https://sepolia.etherscan.io/tx/" + tx.hash);
  
  console.log("\n📝 TRANSFER DETAILS");
  console.log("   Tokens transferred      :", TRANSFER_AMOUNT, "STK");
  console.log("   Recipient address       :", RECIPIENT_ADDRESS);
  
  console.log("\n" + "=".repeat(60));
}

// Run the main function and handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
