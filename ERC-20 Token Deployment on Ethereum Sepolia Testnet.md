# ERC\-20 Token Deployment on Ethereum Sepolia Testnet

- **Workspace:** Blockchain A1 \(d:\\Blockchain A1\)
- **Messages:** 1
- **Created:** 2026\-03\-05T08:14:31\.417Z
- **Last message:** 2026\-03\-05T09:27:14\.748Z

## Message 1 — User
*2026\-03\-05T09:27:14\.748Z*

Role: Act as an expert blockchain developer and computer science tutor\. I am a university student learning about blockchain fundamentals, and I need to complete an assignment deploying an ERC\-20 token to the Ethereum Sepolia testnet\.
Task 1: Smart Contract \(Solidity\)
Please help me write a standard ERC\-20 smart contract in Solidity\. I am allowed to use standard libraries like OpenZeppelin\. The contract must include a specific minting function that is protected by access control so that only the contract owner \(the address that deploys it\) can call it\. Please include detailed inline comments explaining the logic\.
Task 2: Deployment & Interaction Script
I need a script to deploy and interact with this contract\. I prefer to write this in Javascript \(Ethers\.js/Hardhat\)
The script needs to do the following:
 1\. Connect to the Sepolia testnet via an RPC provider\.
 2\. Deploy the ERC\-20 contract\.
 3\. Execute a transaction that transfers exactly the last 3 digits of my student ID \(914\) tokens to a specific testnet address\. Make sure to leave place for this address, my lecturer will provide it later\.
 4\. In that exact same transfer transaction, include a custom data payload\. The payload must be the string "FINAL\-S4112914" converted into hexadecimal format and attached to the transaction's data field\.
 
Please provide the code, explain how to install the necessary dependencies, and walk me through how to run the script\.
The pdf file provides info about the requirement and recommended tools and resources\. You can ignore the requirement in the pdf file \( I have summarized for you above \) but pay attention to the recommended tools and resources\.

### Response 1 — GitHub Copilot

Let me first read the PDF to understand the recommended tools and resources, then create the project structure\.

Let me first read the PDF for recommended tools and resources, then build everything out\. 

The PDF is binary and not directly readable\. Let me fetch the GitHub resources page linked in the PDF instead, and proceed with building the project\. 

Now I have the context\. The recommended tools include:
\- Hardhat \(development environment\)
\- Ethers\.js \(JavaScript library\)
\- OpenZeppelin Contracts \(for ERC\-20\)

Let me create the full project:
1\. A Hardhat project with Solidity smart contract
2\. A deployment/interaction script
3\. Proper configuration files
4\. A README with setup instructions

Let me set up the project structure:
\- \`contracts/MyToken\.sol\` \- The ERC\-20 contract
\- \`scripts/deploy\-and\-interact\.js\` \- The deployment & interaction script
\- \`hardhat\.config\.js\` \- Hardhat configuration


\- \`package\.json\` \- Dependencies
\- \`\.env\.example\` \- Template for environment variables
\- \`README\.md\` \- Setup and run instructions

For the transfer with custom data payload, I need to handle the fact that standard ERC\-20 \`transfer\(\)\` doesn't support attaching arbitrary data\. The student wants to transfer 914 tokens with "FINAL\-S4112914" encoded as hex in the data field, so I'll need to use a low\-level transaction approach that includes the extra data alongside the transfer call\.

The cleanest way is to manually construct the transaction data by ABI\-encoding the transfer function call and appending the custom hex string to it—the EVM will parse the function parameters from the encoded portion and ignore the trailing bytes\. parameters and ignores trailing data\.

For a standard ERC\-20 transfer function, the ABI encoding uses 4 bytes for the function selector, then 32 bytes each for the address and amount parameters—totaling 68 bytes\. Any extra data appended after that gets included in the transaction input but doesn't affect how the function executes, so I can encode the transfer call normally, convert my identifier string to hex, append it to the encoded data, and send it as a raw transaction\.

Now I'm converting "FINAL\-S4112914" to its hex representation and setting up the contract files\. I need to create an ERC\-20 token with 18 decimals and a protected minting function that transfers exactly 914 tokens—the last three digits of the student ID\.

Setting up the project structure\.\.\. Now I'm setting up the Hardhat configuration for Sepolia, which requires an RPC URL and private key from the student\. I need to make sure I'm using ethers v6 syntax since that's what modern Hardhat includes—things like \`ethers\.parseUnits\(\)\` instead of the older utility methods\.

Writing the smart contract\.\.\.

I need to clarify the Ownable constructor differences between OpenZeppelin v4 and v5 — v5 requires an explicit owner address parameter while v4 doesn't\. I'll go with v5 since it's the current version, then move on to the deployment script that uses ethers to interact with the contract\.

Writing deployment script\.\.\. I'm verifying the approach—the ABI\-encoded transfer call is exactly 68 bytes, and appending the hex\-encoded payload after that works because the EVM decoder only reads what it needs for the function parameters, leaving the extra data intact on\-chain\. Now I need to set up the environment variables like \`SEPOLIA\_RPC\_URL\` and \`PRIVATE\_KEY\`, make sure dotenv is configured in the hardhat config, and finalize all the files with proper comments\. Now I'm setting up the package\.json with all the necessary dependencies for Hardhat, OpenZeppelin contracts, and dotenv for environment variable management\. I'll write out the contract file, deployment script, and configuration files to complete the setup\.

For the Solidity contract, I need to add detailed inline comments throughout so the student understands each concept as they learn\. Let me clarify how the transaction data payload works: the EVM uses the first 4 bytes to route to the correct function, then the ABI decoder processes the next 64 bytes for the parameters, and any extra bytes at the end get stored in the transaction's input data on\-chain but don't affect the function execution\. Now I'll generate all the files\.

Now I have the full picture\. The recommended stack is \*\*Hardhat \+ Ethers\.js \+ OpenZeppelin\*\*\. Let me build the entire project\. 

Now let me install the dependencies and compile the contract to make sure everything works: 

Dependencies installed\. Now let me compile the contract: 

All 7 Solidity files compiled successfully \(your contract \+ 6 OpenZeppelin dependencies\)\. Let me mark everything done: 

Everything is built and compiling\. Here's a walkthrough of what was created and how to use it:

\-\-\-

\#\# Project Structure

\| File \| Purpose \|
\|\-\-\-\-\-\-\|\-\-\-\-\-\-\-\-\-\|
\| 

 \| Your ERC\-20 smart contract \|
\| 

 \| Deploys the contract \+ executes the transfer with payload \|
\| 

 \| Hardhat configuration \(Sepolia network, compiler\) \|
\| 

 \| Node\.js dependencies \|
\| 

 \| Template for your secrets \|
\| 

 \| Full setup guide \|

\-\-\-

\#\# The Smart Contract



 inherits from two OpenZeppelin contracts:
\- \*\*\`ERC20\`\*\* — gives you the full ERC\-20 standard \(\`transfer\`, \`balanceOf\`, \`approve\`, etc\.\)
\- \*\*\`Ownable\`\*\* — restricts the \`mint\(\)\` function so that only the deployer \(owner\) can call it

The constructor mints an initial supply of 10,000 tokens to the deployer's address\.

\-\-\-

\#\# The Deployment Script



 does everything in one run:

1\. \*\*Connects\*\* to Sepolia using your RPC URL and private key
2\. \*\*Deploys\*\* the \`StudentToken\` contract
3\. \*\*Transfers 914 STK\*\* to the recipient with \`"FINAL\-S4112914"\` embedded in the transaction data
4\. \*\*Prints\*\* Etherscan links for verification

The custom payload trick works by ABI\-encoding the \`transfer\(address, uint256\)\` call \(68 bytes\) and \*\*appending\*\* the hex of your string after it\. The EVM only reads the first 68 bytes for the function parameters — the extra bytes are ignored by the contract logic but permanently recorded on\-chain\.

\-\-\-

\#\# How to Run \(3 steps\)

\#\#\# Step 1 — Set up your \`\.env\` file
Copy 

 to \`\.env\` and fill in:
\- \*\*\`SEPOLIA\_RPC\_URL\`\*\* — from Infura or Alchemy \(free tier works fine\)
\- \*\*\`PRIVATE\_KEY\`\*\* — your MetaMask wallet private key \(make sure it has Sepolia ETH from a faucet\)

\#\#\# Step 2 — Set the recipient address
Open 

 and replace \`"0xREPLACE\_WITH\_LECTURER\_ADDRESS"\` with the address your lecturer gives you\.

\#\#\# Step 3 — Deploy
\`\`\`bash
npx hardhat run scripts/deploy\-and\-interact\.js \-\-network sepolia
\`\`\`

The script will print the \*\*transaction hash\*\* and \*\*Etherscan links\*\*\. On Etherscan, click the transaction → scroll to \*\*Input Data\*\* → switch to \*\*UTF\-8\*\* view to see \`FINAL\-S4112914\` embedded in the data\.