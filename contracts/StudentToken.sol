// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StudentToken (STK)
/// @dev ERC-20 token with owner-restricted mint function.
contract StudentToken is ERC20, Ownable {
    // =====================================================================
    // Constructor
    // =====================================================================
    /// @notice Initialize token with name, symbol, and initial supply.
    /// @param initialSupply Initial token supply (scaled by 10^18 decimals).
    constructor(uint256 initialSupply) ERC20("StudentToken", "STK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // =====================================================================
    // Access Control: Owner-Only Mint
    // =====================================================================
    /// @notice Allow owner to mint additional tokens.
    /// @param to Recipient address for newly minted tokens.
    /// @param amount Number of tokens to mint.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
