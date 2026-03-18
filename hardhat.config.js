// ============================================================================
// hardhat.config.js — Hardhat project configuration
// ============================================================================

// Load environment variables from the .env file (RPC URL, private key, etc.)
require("dotenv").config();

// @nomicfoundation/hardhat-toolbox bundles everything we need:
//   • hardhat-ethers   (ethers.js integration)
//   • hardhat-chai     (assertion library for tests)
//   • solidity-coverage, gas-reporter, etc.
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // -------------------------------------------------------------------
  // Solidity compiler settings
  // -------------------------------------------------------------------
  solidity: {
    version: "0.8.24",          // Must be >= 0.8.20 for OpenZeppelin v5
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,              // Optimise for average number of function calls
      },
    },
  },

  // -------------------------------------------------------------------
  // Network configurations
  // -------------------------------------------------------------------
  networks: {
    // Ethereum Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      // `accounts` expects an array of private keys.
      // We only need the deployer's key.
      accounts:
        process.env.PRIVATE_KEY
          ? [process.env.PRIVATE_KEY]
          : [],
    },
  },
};
