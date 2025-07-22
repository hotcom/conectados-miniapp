// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Campaign
 * @dev Individual campaign contract that receives cBRL donations
 * Each campaign has its own contract for maximum transparency
 */
contract Campaign is ReentrancyGuard {
    // Campaign details
    string public title;
    string public description;
    uint256 public goal;           // Goal amount in cBRL (18 decimals)
    uint256 public raised;         // Amount raised so far
    address public beneficiary;    // Organization wallet address
    address public creator;        // Who created this campaign
    uint256 public createdAt;      // Timestamp of creation
    bool public active;            // Campaign status
    
    // Donor tracking
    mapping(address => bool) public hasDonated;  // Track if address has donated
    uint256 public donorCount;     // Number of unique donors
    
    // cBRL token contract
    IERC20 public immutable cBRL;
    
    // Events
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed beneficiary, uint256 amount, uint256 timestamp);
    event CampaignClosed(uint256 timestamp);
    event GoalReached(uint256 timestamp);
    
    // Modifiers
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Only beneficiary can call this");
        _;
    }
    
    modifier onlyActive() {
        require(active, "Campaign is not active");
        _;
    }
    
    /**
     * @dev Constructor - called by CampaignFactory
     */
    constructor(
        string memory _title,
        string memory _description,
        uint256 _goal,
        address _beneficiary,
        address _creator,
        address _cBRLToken
    ) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        require(_cBRLToken != address(0), "Invalid cBRL token address");
        
        title = _title;
        description = _description;
        goal = _goal;
        beneficiary = _beneficiary;
        creator = _creator;
        cBRL = IERC20(_cBRLToken);
        createdAt = block.timestamp;
        active = true;
    }
    
    /**
     * @dev Donate cBRL to this campaign
     * @param amount Amount of cBRL to donate (in wei, 18 decimals)
     */
    function donate(uint256 amount) external nonReentrant onlyActive {
        require(amount > 0, "Donation amount must be greater than 0");
        require(cBRL.balanceOf(msg.sender) >= amount, "Insufficient cBRL balance");
        require(cBRL.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        // Transfer cBRL from donor to this contract
        bool success = cBRL.transferFrom(msg.sender, address(this), amount);
        require(success, "cBRL transfer failed");
        
        // Track unique donors
        if (!hasDonated[msg.sender]) {
            hasDonated[msg.sender] = true;
            donorCount++;
        }
        
        // Update raised amount
        raised += amount;
        
        // Emit events
        emit DonationReceived(msg.sender, amount, block.timestamp);
        
        // Check if goal is reached
        if (raised >= goal) {
            emit GoalReached(block.timestamp);
        }
    }
    
    /**
     * @dev Backend function to receive cBRL from PIX donations
     * Only called by backend after PIX payment is confirmed
     * @param amount Amount of cBRL to add (minted by backend)
     * @param donor Address of the actual donor (for tracking unique donors)
     */
    function receivePIXDonation(uint256 amount, address donor) external nonReentrant onlyActive {
        require(amount > 0, "Donation amount must be greater than 0");
        require(donor != address(0), "Invalid donor address");
        require(cBRL.balanceOf(msg.sender) >= amount, "Backend insufficient cBRL balance");
        require(cBRL.allowance(msg.sender, address(this)) >= amount, "Backend insufficient allowance");
        
        // Transfer cBRL from backend to this contract
        bool success = cBRL.transferFrom(msg.sender, address(this), amount);
        require(success, "cBRL transfer failed");
        
        // Track unique donors (using actual donor address, not backend)
        if (!hasDonated[donor]) {
            hasDonated[donor] = true;
            donorCount++;
        }
        
        // Update raised amount
        raised += amount;
        
        // Emit events (using actual donor address)
        emit DonationReceived(donor, amount, block.timestamp);
        
        // Check if goal is reached
        if (raised >= goal) {
            emit GoalReached(block.timestamp);
        }
    }
    
    /**
     * @dev Withdraw raised funds to beneficiary
     * Can be called multiple times (partial withdrawals)
     */
    function withdraw(uint256 amount) external onlyBeneficiary nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(amount <= cBRL.balanceOf(address(this)), "Insufficient contract balance");
        
        // Transfer cBRL to beneficiary
        bool success = cBRL.transfer(beneficiary, amount);
        require(success, "cBRL transfer failed");
        
        emit FundsWithdrawn(beneficiary, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw all raised funds to beneficiary
     */
    function withdrawAll() external onlyBeneficiary nonReentrant {
        uint256 balance = cBRL.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        
        // Transfer all cBRL to beneficiary
        bool success = cBRL.transfer(beneficiary, balance);
        require(success, "cBRL transfer failed");
        
        emit FundsWithdrawn(beneficiary, balance, block.timestamp);
    }
    
    /**
     * @dev Close campaign (only beneficiary)
     * Prevents new donations but allows withdrawals
     */
    function closeCampaign() external onlyBeneficiary {
        active = false;
        emit CampaignClosed(block.timestamp);
    }
    
    /**
     * @dev Get campaign progress percentage (0-10000 for 0-100.00%)
     */
    function getProgressPercentage() external view returns (uint256) {
        if (goal == 0) return 0;
        return (raised * 10000) / goal;
    }
    
    /**
     * @dev Get contract cBRL balance
     */
    function getBalance() external view returns (uint256) {
        return cBRL.balanceOf(address(this));
    }
    
    /**
     * @dev Get campaign info in one call
     */
    function getCampaignInfo() external view returns (
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _raised,
        address _beneficiary,
        address _creator,
        uint256 _createdAt,
        bool _active,
        uint256 _balance,
        uint256 _donorCount
    ) {
        return (
            title,
            description,
            goal,
            raised,
            beneficiary,
            creator,
            createdAt,
            active,
            cBRL.balanceOf(address(this)),
            donorCount
        );
    }
}
