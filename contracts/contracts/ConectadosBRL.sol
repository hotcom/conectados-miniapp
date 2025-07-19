// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ConectadosBRL
 * @dev ERC20 token for Conectados Impact platform
 * Represents a stablecoin pegged to Brazilian Real (BRL)
 */
contract ConectadosBRL is ERC20, Ownable, Pausable {
    event TokensMinted(address indexed to, uint256 amount);
    
    constructor() ERC20("Conectados BRL", "cBRL") {
        // Initial supply is 0, tokens are minted as PIX payments are received
    }

    /**
     * @dev Mints new tokens. Can only be called by the contract owner (admin backend)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Pauses token transfers and minting
     * Can only be called by the contract owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses token transfers and minting
     * Can only be called by the contract owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
