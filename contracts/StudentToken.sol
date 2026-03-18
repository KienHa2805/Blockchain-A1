// SPDX-License-Identifier: MIT
// ============================================================================
// StudentToken.sol — ERC-20 Token for Assignment 1
// Student ID: S4112914
// ============================================================================

// Specify the Solidity compiler version.
// We use ^0.8.20 because OpenZeppelin v5 contracts require at least 0.8.20.
pragma solidity ^0.8.20;

// ---------------------------------------------------------------------------
// OpenZeppelin Imports
// ---------------------------------------------------------------------------
// ERC20.sol  – Provides the full ERC-20 standard implementation:
//              balanceOf, transfer, approve, transferFrom, allowance, etc.
//              We inherit from this so our token automatically supports
//              all standard ERC-20 functionality.
//
// Ownable.sol – A simple access-control module that stores an "owner"
//               address and provides the `onlyOwner` modifier.
//               Only the owner can call functions protected by that modifier.
// ---------------------------------------------------------------------------
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title  StudentToken (STK)
/// @notice A standard ERC-20 token with an owner-restricted mint function.
/// @dev    Inherits OpenZeppelin's ERC20 for token logic and Ownable for
///         access control.  The deployer automatically becomes the owner.
contract StudentToken is ERC20, Ownable {

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    /// @notice Deploys the token, names it, and mints an initial supply to
    ///         the deployer.
    /// @param  initialSupply The number of whole tokens to mint at deployment
    ///         (the contract will scale this by 10^decimals internally).
    ///
    /// How it works:
    ///   1. ERC20("StudentToken", "STK")  → sets the token name and symbol.
    ///   2. Ownable(msg.sender)           → records msg.sender (deployer) as
    ///                                       the contract owner.
    ///   3. _mint(...)                    → creates `initialSupply` tokens
    ///                                       (adjusted for decimals) and
    ///                                       credits them to the deployer.
    ///
    /// NOTE: `decimals()` returns 18 by default (same as ETH).
    ///       So if initialSupply = 10 000, the raw amount minted is
    ///       10 000 × 10^18 = 10 000 000 000 000 000 000 000 (wei-equivalent).
    constructor(
        uint256 initialSupply
    ) ERC20("StudentToken", "STK") Ownable(msg.sender) {
        // Mint the initial supply to the deployer's address.
        // We multiply by 10 ** decimals() so that `initialSupply` represents
        // whole tokens (e.g. 10 000 tokens, not 10 000 × 10^-18 tokens).
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // -----------------------------------------------------------------------
    // Owner-Only Mint Function
    // -----------------------------------------------------------------------
    /// @notice Allows the contract owner to mint additional tokens.
    /// @dev    Protected by the `onlyOwner` modifier from Ownable.sol.
    ///         If anyone other than the owner calls this, the transaction
    ///         will revert with "OwnableUnauthorizedAccount".
    /// @param  to     The address that will receive the newly minted tokens.
    /// @param  amount The number of tokens to mint (in the smallest unit,
    ///                i.e. already multiplied by 10^decimals if you want
    ///                whole tokens).
    function mint(address to, uint256 amount) public onlyOwner {
        // _mint is an internal function inherited from ERC20.
        // It increases `totalSupply` and credits `amount` to address `to`.
        _mint(to, amount);
    }
}
