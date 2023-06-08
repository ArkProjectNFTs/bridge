pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BridgeEscrow is AccessControl, ERC721Holder {
  using Address for address;

  enum EscrowStatus {
    Locked,
    Completed,
    Cancelled
  }

  struct EscrowEntry {
    uint256 entryId;
    uint256 nftId;
    address nftContractAddress;
    address depositor;
    address bridgeContractAddress;
    uint256 timestamp;
    EscrowStatus status;
  }

  uint256 public escrowCount = 0;
  mapping(uint => EscrowEntry) public allEscrowEntries;
  mapping(address => mapping(uint => uint)) public activeEscrowEntryIds;

  bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

  constructor() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function grantBridgeRole(address bridgeAddress) external {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
    _grantRole(BRIDGE_ROLE, bridgeAddress);
  }

  function revokeBridgeRole(address bridgeAddress) external {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Caller is not an admin");
    _revokeRole(BRIDGE_ROLE, bridgeAddress);
  }

  function depositNFT(address tokenAddress, uint256 tokenId, address depositorAddress) external {
    require(depositorAddress != address(0), "Deposit address cannot be zero");
    require(tokenAddress.isContract(), "Token address is not a contract");
    require(hasRole(BRIDGE_ROLE, msg.sender), "Caller is not the bridge contract");

    escrowCount++;
    uint256 currentEscrowCount = escrowCount;
    EscrowEntry storage escrowEntry = allEscrowEntries[currentEscrowCount];

    escrowEntry.entryId = currentEscrowCount;
    escrowEntry.nftId = tokenId;
    escrowEntry.nftContractAddress = tokenAddress;
    escrowEntry.depositor = depositorAddress;
    escrowEntry.bridgeContractAddress = msg.sender;
    escrowEntry.timestamp = block.timestamp;
    escrowEntry.status = EscrowStatus.Locked;

    activeEscrowEntryIds[tokenAddress][tokenId] = currentEscrowCount;

    IERC721(tokenAddress).safeTransferFrom(depositorAddress, address(this), tokenId);

    emit TokenTransferred(
      currentEscrowCount,
      tokenId,
      tokenAddress,
      depositorAddress,
      msg.sender,
      escrowEntry.timestamp,
      escrowEntry.status
    );
  }

  function getEscrowEntry(address tokenAddress, uint tokenId) public view returns (EscrowEntry memory) {
    uint256 entryId = activeEscrowEntryIds[tokenAddress][tokenId];
    return allEscrowEntries[entryId];
  }

  function withdrawDeposit(address tokenAddress, uint tokenId) external {
    uint256 entryId = activeEscrowEntryIds[tokenAddress][tokenId];
    EscrowEntry storage escrowEntry = allEscrowEntries[entryId];

    require(
      hasRole(BRIDGE_ROLE, msg.sender) && escrowEntry.bridgeContractAddress == msg.sender,
      "Caller is not the bridge contract"
    );
    require(escrowEntry.status == EscrowStatus.Locked, "Deposit status is not locked");

    escrowEntry.status = EscrowStatus.Completed;
    address depositor = escrowEntry.depositor;
    uint nftId = escrowEntry.nftId;
    IERC721(escrowEntry.nftContractAddress).safeTransferFrom(address(this), depositor, nftId);

    emit TokenTransferred(
      entryId,
      nftId,
      escrowEntry.nftContractAddress,
      depositor,
      escrowEntry.bridgeContractAddress,
      escrowEntry.timestamp,
      escrowEntry.status
    );
  }

  function cancelDeposit(address tokenAddress, uint tokenId) external {
    uint256 entryId = activeEscrowEntryIds[tokenAddress][tokenId];
    EscrowEntry storage escrowEntry = allEscrowEntries[entryId];

    require(
      hasRole(BRIDGE_ROLE, msg.sender) && escrowEntry.bridgeContractAddress == msg.sender,
      "Caller is not the bridge contract"
    );

    require(escrowEntry.status == EscrowStatus.Locked, "Deposit status is not locked");

    escrowEntry.status = EscrowStatus.Cancelled;
    address nftContractAddress = escrowEntry.nftContractAddress;
    uint nftId = escrowEntry.nftId;
    IERC721(nftContractAddress).safeTransferFrom(address(this), escrowEntry.depositor, nftId);

    emit TokenTransferred(
      entryId,
      nftId,
      nftContractAddress,
      escrowEntry.depositor,
      escrowEntry.bridgeContractAddress,
      escrowEntry.timestamp,
      escrowEntry.status
    );
  }

  event TokenTransferred(
    uint256 indexed id,
    uint256 indexed tokenId,
    address indexed tokenAddress,
    address sender,
    address tokenBridgeAddress,
    uint256 createdAt,
    EscrowStatus status
  );
}
