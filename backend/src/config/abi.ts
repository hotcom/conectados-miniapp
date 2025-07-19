export const ABI = [
  // ERC20
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  // Ownable
  'function owner() view returns (address)',
  // Mintable
  'function mint(address to, uint256 amount)',
  // Pausable
  'function pause()',
  'function unpause()',
  'function paused() view returns (bool)',
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Paused(address account)',
  'event Unpaused(address account)',
];
