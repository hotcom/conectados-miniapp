// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Campaign.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CampaignFactory
 * @dev Factory contract to create and manage individual campaign contracts
 * Provides centralized registry of all campaigns for easy discovery
 */
contract CampaignFactory is Ownable, ReentrancyGuard {
    // cBRL token address
    address public immutable cBRLToken;
    
    // Campaign tracking
    uint256 public campaignCount;
    mapping(uint256 => address) public campaigns;           // campaignId => campaign contract address
    mapping(address => uint256[]) public creatorCampaigns;  // creator => array of campaign IDs
    mapping(address => uint256[]) public beneficiaryCampaigns; // beneficiary => array of campaign IDs
    
    // Campaign metadata for easy querying
    struct CampaignInfo {
        uint256 id;
        address contractAddress;
        string title;
        address creator;
        address beneficiary;
        uint256 goal;
        uint256 createdAt;
        bool active;
    }
    
    mapping(uint256 => CampaignInfo) public campaignInfo;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed campaignContract,
        address indexed creator,
        address beneficiary,
        string title,
        uint256 goal,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor
     * @param _cBRLToken Address of the cBRL token contract
     */
    constructor(address _cBRLToken) {
        require(_cBRLToken != address(0), "Invalid cBRL token address");
        cBRLToken = _cBRLToken;
    }
    
    /**
     * @dev Create a new campaign
     * @param title Campaign title
     * @param description Campaign description
     * @param goal Goal amount in cBRL (18 decimals)
     * @param beneficiary Organization wallet that will receive funds
     */
    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        address beneficiary
    ) external nonReentrant returns (uint256 campaignId, address campaignContract) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(goal > 0, "Goal must be greater than 0");
        require(beneficiary != address(0), "Invalid beneficiary address");
        
        // Increment campaign count
        campaignCount++;
        campaignId = campaignCount;
        
        // Deploy new Campaign contract
        Campaign newCampaign = new Campaign(
            title,
            description,
            goal,
            beneficiary,
            msg.sender,  // creator
            cBRLToken
        );
        
        campaignContract = address(newCampaign);
        
        // Store campaign mapping
        campaigns[campaignId] = campaignContract;
        
        // Store campaign info for easy querying
        campaignInfo[campaignId] = CampaignInfo({
            id: campaignId,
            contractAddress: campaignContract,
            title: title,
            creator: msg.sender,
            beneficiary: beneficiary,
            goal: goal,
            createdAt: block.timestamp,
            active: true
        });
        
        // Add to creator's campaigns
        creatorCampaigns[msg.sender].push(campaignId);
        
        // Add to beneficiary's campaigns (if different from creator)
        if (beneficiary != msg.sender) {
            beneficiaryCampaigns[beneficiary].push(campaignId);
        }
        
        // Emit event
        emit CampaignCreated(
            campaignId,
            campaignContract,
            msg.sender,
            beneficiary,
            title,
            goal,
            block.timestamp
        );
        
        return (campaignId, campaignContract);
    }
    
    /**
     * @dev Get campaign contract address by ID
     */
    function getCampaignContract(uint256 campaignId) external view returns (address) {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        return campaigns[campaignId];
    }
    
    /**
     * @dev Get campaigns created by a specific address
     */
    function getCreatorCampaigns(address creator) external view returns (uint256[] memory) {
        return creatorCampaigns[creator];
    }
    
    /**
     * @dev Get campaigns where address is beneficiary
     */
    function getBeneficiaryCampaigns(address beneficiary) external view returns (uint256[] memory) {
        return beneficiaryCampaigns[beneficiary];
    }
    
    /**
     * @dev Get campaign basic info by ID
     */
    function getCampaignInfo(uint256 campaignId) external view returns (CampaignInfo memory) {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        return campaignInfo[campaignId];
    }
    
    /**
     * @dev Get multiple campaigns info at once
     */
    function getCampaignsInfo(uint256[] memory campaignIds) external view returns (CampaignInfo[] memory) {
        CampaignInfo[] memory infos = new CampaignInfo[](campaignIds.length);
        
        for (uint256 i = 0; i < campaignIds.length; i++) {
            require(campaignIds[i] > 0 && campaignIds[i] <= campaignCount, "Invalid campaign ID");
            infos[i] = campaignInfo[campaignIds[i]];
        }
        
        return infos;
    }
    
    /**
     * @dev Get all campaigns (paginated)
     * @param offset Starting index
     * @param limit Number of campaigns to return
     */
    function getAllCampaigns(uint256 offset, uint256 limit) external view returns (CampaignInfo[] memory) {
        require(offset < campaignCount, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > campaignCount) {
            end = campaignCount;
        }
        
        uint256 length = end - offset;
        CampaignInfo[] memory infos = new CampaignInfo[](length);
        
        for (uint256 i = 0; i < length; i++) {
            infos[i] = campaignInfo[offset + i + 1]; // Campaign IDs start from 1
        }
        
        return infos;
    }
    
    /**
     * @dev Get campaign detailed info including current raised amount
     * @param campaignId Campaign ID to query
     */
    function getCampaignDetails(uint256 campaignId) external view returns (
        CampaignInfo memory info,
        uint256 raised,
        uint256 balance,
        uint256 progressPercentage
    ) {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        
        info = campaignInfo[campaignId];
        Campaign campaign = Campaign(campaigns[campaignId]);
        
        raised = campaign.raised();
        balance = campaign.getBalance();
        progressPercentage = campaign.getProgressPercentage();
        
        return (info, raised, balance, progressPercentage);
    }
    
    /**
     * @dev Emergency function to update campaign status (only owner)
     * In case a campaign needs to be marked as inactive
     */
    function updateCampaignStatus(uint256 campaignId, bool active) external onlyOwner {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        campaignInfo[campaignId].active = active;
    }
    
    /**
     * @dev Get total number of campaigns
     */
    function getTotalCampaigns() external view returns (uint256) {
        return campaignCount;
    }
}
