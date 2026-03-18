# Blockchain Assignment 1 — ERC-20 Token on Sepolia

**Student ID:** S4112914

---

## Project Overview

This project deploys a standard **ERC-20 token** called **StudentToken (STK)** to the **Ethereum Sepolia testnet** using Hardhat, Ethers.js, and OpenZeppelin.

The deployment script also executes a transfer of **914 tokens** to a specified recipient address, embedding the custom data payload `FINAL-S4112914` (as hex) directly into the transaction's input data.

---

## Project Structure

```
Blockchain A1/
├── contracts/
│   └── StudentToken.sol          # ERC-20 smart contract (Solidity)
├── scripts/
│   └── deploy-and-interact.js    # Deployment & interaction script
├── .env.example                  # Template for secret environment variables
├── .gitignore                    # Files to exclude from Git
├── hardhat.config.js             # Hardhat project configuration
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

---

## Prerequisites

| Tool                          | Purpose                            | Install                                                                       |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| **Node.js ≥ 18**              | JavaScript runtime                 | [nodejs.org](https://nodejs.org/)                                             |
| **MetaMask**                  | Browser wallet for key management  | [metamask.io](https://metamask.io/)                                           |
| **Sepolia ETH**               | Test ETH to pay for gas            | See faucets below                                                             |
| **Infura or Alchemy account** | RPC provider to connect to Sepolia | [infura.io](https://www.infura.io/) / [alchemy.com](https://www.alchemy.com/) |

### Sepolia Faucets (get free test ETH)

- <https://sepoliafaucet.com>
- <https://www.infura.io/faucet/sepolia>
- <https://faucet.quicknode.com/ethereum/sepolia>
- <https://cloud.google.com/application/web3/faucet/ethereum/sepolia>
- <https://sepolia-faucet.pk910.de/>

---

## Setup — Step by Step

### 1. Install Dependencies

Open a terminal **in this folder** and run:

```bash
npm install
```

This installs Hardhat, Ethers.js, OpenZeppelin Contracts, and dotenv.

### 2. Create Your `.env` File

Copy the example and fill in your real values:

```bash
cp .env.example .env
```

Then open `.env` and set:

| Variable          | Where to get it                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `SEPOLIA_RPC_URL` | Infura → Create Project → copy Sepolia endpoint, e.g. `https://sepolia.infura.io/v3/abc123...` |
| `PRIVATE_KEY`     | MetaMask → Account Details → **Show private key** (paste without the `0x` prefix)              |


### 3. Set the Recipient Address

Open `scripts/deploy-and-interact.js` and replace:

```js
const RECIPIENT_ADDRESS = "0xREPLACE_WITH_LECTURER_ADDRESS";
```

with the actual Ethereum address your lecturer provides.

### 4. Compile the Contract

```bash
npx hardhat compile
```

You should see: `Compiled 1 Solidity file successfully`.

### 5. Deploy & Run the Transfer

```bash
npx hardhat run scripts/deploy-and-interact.js --network sepolia
```

The script will:

1. Deploy `StudentToken` to Sepolia.
2. Transfer **914 STK** to the recipient.
3. Embed `FINAL-S4112914` (hex: `0x46494e414c2d5334313132393134`) in the transaction data.
4. Print the transaction hash and Etherscan links.

---

## How the Custom Data Payload Works

An ERC-20 `transfer(address, uint256)` call produces 68 bytes of ABI-encoded data:

| Bytes | Content                                     |
| ----- | ------------------------------------------- |
| 0–3   | Function selector `0xa9059cbb`              |
| 4–35  | Recipient address (32 bytes, zero-padded)   |
| 36–67 | Token amount (32 bytes, big-endian uint256) |

The EVM only reads those 68 bytes. **Any additional bytes appended are ignored by the function** but are permanently stored in the transaction's `input` field on-chain.

We convert `"FINAL-S4112914"` → `0x46494e414c2d5334313132393134` and append it, so the full transaction data looks like:

```
[transfer calldata (68 bytes)] + [46494e414c2d5334313132393134]
```

You can verify this on [Sepolia Etherscan](https://sepolia.etherscan.io) by viewing the transaction's **Input Data** and decoding the trailing bytes back to UTF-8.

---

## Verifying on Etherscan

After running the script you will see output like:

```
🔗 View on Etherscan: https://sepolia.etherscan.io/tx/0x...
🔗 Token contract   : https://sepolia.etherscan.io/address/0x...
```

Click the transaction link → scroll to **Input Data** → switch to **UTF-8** view to confirm the `FINAL-S4112914` string is embedded.

---

## Key Technologies

| Technology                                               | Role                                             |
| -------------------------------------------------------- | ------------------------------------------------ |
| [Solidity](https://docs.soliditylang.org/)               | Smart contract language                          |
| [Hardhat](https://hardhat.org/)                          | Development environment, compiler, script runner |
| [Ethers.js](https://docs.ethers.org/v6/)                 | JavaScript library for Ethereum interaction      |
| [OpenZeppelin](https://docs.openzeppelin.com/contracts/) | Audited, standard smart contract library         |
| [Sepolia Testnet](https://sepolia.dev/)                  | Ethereum proof-of-stake test network             |

---

## Troubleshooting

| Problem                      | Solution                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `insufficient funds for gas` | Get more Sepolia ETH from a faucet                                                                 |
| `SEPOLIA_RPC_URL is empty`   | Make sure `.env` exists and has the correct URL                                                    |
| `could not detect network`   | Check your Infura/Alchemy project is set to Sepolia                                                |
| `nonce too low`              | Your wallet may have pending transactions; wait or reset in MetaMask (Settings → Advanced → Reset) |
