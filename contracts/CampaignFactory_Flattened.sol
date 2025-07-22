// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    
    constructor() {
        _status = _NOT_ENTERED;
    }
    
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Context.sol)
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)
abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    constructor() {
        _transferOwnership(_msgSender());
    }
    
    modifier onlyOwner() {
        _checkOwner();
        _;
    }
    
    function owner() public view virtual returns (address) {
        return _owner;
    }
    
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }
    
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title Campaign
 * @dev Individual campaign contract that receives cBRL donations
 */
contract Campaign is ReentrancyGuard {
    string public title;
    string public description;
    uint256 public goal;
    uint256 public raised;
    address public beneficiary;
    address public creator;
    uint256 public createdAt;
    bool public active;
    
    IERC20 public immutable cBRL;
    
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed beneficiary, uint256 amount, uint256 timestamp);
    event CampaignClosed(uint256 timestamp);
    event GoalReached(uint256 timestamp);
    
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Only beneficiary can call this");
        _;
    }
    
    modifier onlyActive() {
        require(active, "Campaign is not active");
        _;
    }
    
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
    
    function donate(uint256 amount) external nonReentrant onlyActive {
        require(amount > 0, "Donation amount must be greater than 0");
        require(cBRL.balanceOf(msg.sender) >= amount, "Insufficient cBRL balance");
        require(cBRL.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        bool success = cBRL.transferFrom(msg.sender, address(this), amount);
        require(success, "cBRL transfer failed");
        
        raised += amount;
        emit DonationReceived(msg.sender, amount, block.timestamp);
        
        if (raised >= goal) {
            emit GoalReached(block.timestamp);
        }
    }
    
    function receivePIXDonation(uint256 amount) external nonReentrant onlyActive {
        require(amount > 0, "Donation amount must be greater than 0");
        require(cBRL.balanceOf(msg.sender) >= amount, "Backend insufficient cBRL balance");
        require(cBRL.allowance(msg.sender, address(this)) >= amount, "Backend insufficient allowance");
        
        bool success = cBRL.transferFrom(msg.sender, address(this), amount);
        require(success, "cBRL transfer failed");
        
        raised += amount;
        emit DonationReceived(msg.sender, amount, block.timestamp);
        
        if (raised >= goal) {
            emit GoalReached(block.timestamp);
        }
    }
    
    function withdraw(uint256 amount) external onlyBeneficiary nonReentrant {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(amount <= cBRL.balanceOf(address(this)), "Insufficient contract balance");
        
        bool success = cBRL.transfer(beneficiary, amount);
        require(success, "cBRL transfer failed");
        
        emit FundsWithdrawn(beneficiary, amount, block.timestamp);
    }
    
    function withdrawAll() external onlyBeneficiary nonReentrant {
        uint256 balance = cBRL.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        
        bool success = cBRL.transfer(beneficiary, balance);
        require(success, "cBRL transfer failed");
        
        emit FundsWithdrawn(beneficiary, balance, block.timestamp);
    }
    
    function closeCampaign() external onlyBeneficiary {
        active = false;
        emit CampaignClosed(block.timestamp);
    }
    
    function getProgressPercentage() external view returns (uint256) {
        if (goal == 0) return 0;
        return (raised * 10000) / goal;
    }
    
    function getBalance() external view returns (uint256) {
        return cBRL.balanceOf(address(this));
    }
    
    function getCampaignInfo() external view returns (
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _raised,
        address _beneficiary,
        address _creator,
        uint256 _createdAt,
        bool _active,
        uint256 _balance
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
            cBRL.balanceOf(address(this))
        );
    }
}

/**
 * @title CampaignFactory
 * @dev Factory contract to create and manage individual campaign contracts
 */
contract CampaignFactory is Ownable, ReentrancyGuard {
    address public immutable cBRLToken;
    
    uint256 public campaignCount;
    mapping(uint256 => address) public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;
    mapping(address => uint256[]) public beneficiaryCampaigns;
    
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
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed campaignContract,
        address indexed creator,
        address beneficiary,
        string title,
        uint256 goal,
        uint256 timestamp
    );
    
    constructor(address _cBRLToken) {
        require(_cBRLToken != address(0), "Invalid cBRL token address");
        cBRLToken = _cBRLToken;
    }
    
    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        address beneficiary
    ) external nonReentrant returns (uint256 campaignId, address campaignContract) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(goal > 0, "Goal must be greater than 0");
        require(beneficiary != address(0), "Invalid beneficiary address");
        
        campaignCount++;
        campaignId = campaignCount;
        
        Campaign newCampaign = new Campaign(
            title,
            description,
            goal,
            beneficiary,
            msg.sender,
            cBRLToken
        );
        
        campaignContract = address(newCampaign);
        campaigns[campaignId] = campaignContract;
        
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
        
        creatorCampaigns[msg.sender].push(campaignId);
        
        if (beneficiary != msg.sender) {
            beneficiaryCampaigns[beneficiary].push(campaignId);
        }
        
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
    
    function getCampaignContract(uint256 campaignId) external view returns (address) {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        return campaigns[campaignId];
    }
    
    function getCreatorCampaigns(address creator) external view returns (uint256[] memory) {
        return creatorCampaigns[creator];
    }
    
    function getBeneficiaryCampaigns(address beneficiary) external view returns (uint256[] memory) {
        return beneficiaryCampaigns[beneficiary];
    }
    
    function getCampaignInfo(uint256 campaignId) external view returns (CampaignInfo memory) {
        require(campaignId > 0 && campaignId <= campaignCount, "Invalid campaign ID");
        return campaignInfo[campaignId];
    }
    
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
    
    function getTotalCampaigns() external view returns (uint256) {
        return campaignCount;
    }
}
