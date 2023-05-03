pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract BridgeEscrow is Ownable, ERC721Holder {
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

    function depositNFT(
        address tokenAddress,
        uint256 tokenId,
        address depositorAddress
    ) external {
        require(depositorAddress != address(0), "Invalid sender address.");
        require(tokenAddress.isContract(), "Token address is not a contract.");
        require(msg.sender.isContract(), "Bridge address is not a contract.");
        require(
            IERC721(tokenAddress).getApproved(tokenId) == address(this),
            "The NFT must be approved for transfer."
        );

        escrowCount++;
        EscrowEntry storage escrowEntry = allEscrowEntries[escrowCount];

        escrowEntry.entryId = escrowCount;
        escrowEntry.nftId = tokenId;
        escrowEntry.nftContractAddress = tokenAddress;
        escrowEntry.depositor = depositorAddress;
        escrowEntry.bridgeContractAddress = msg.sender;
        escrowEntry.timestamp = block.timestamp;
        escrowEntry.status = EscrowStatus.Locked;

        activeEscrowEntryIds[tokenAddress][tokenId] = escrowCount;

        IERC721(tokenAddress).safeTransferFrom(
            depositorAddress,
            address(this),
            tokenId
        );

        emit TokenTransfered(
            escrowEntry.entryId,
            escrowEntry.nftId,
            escrowEntry.nftContractAddress,
            escrowEntry.depositor,
            escrowEntry.bridgeContractAddress,
            escrowEntry.timestamp,
            escrowEntry.status
        );
    }

    function getEscrowEntry(
        address tokenAddress,
        uint tokenId
    ) public view returns (EscrowEntry memory) {
        return allEscrowEntries[activeEscrowEntryIds[tokenAddress][tokenId]];
    }

    function withdrawDeposit(address tokenAddress, uint tokenId) external {
        EscrowEntry storage escrowEntry = allEscrowEntries[
            activeEscrowEntryIds[tokenAddress][tokenId]
        ];

        require(
            escrowEntry.bridgeContractAddress == msg.sender,
            "Only the bridge can withdraw the NFT."
        );
        require(
            escrowEntry.status == EscrowStatus.Locked,
            "Invalid deposit status."
        );

        escrowEntry.status = EscrowStatus.Completed;
        IERC721(escrowEntry.nftContractAddress).safeTransferFrom(
            address(this),
            escrowEntry.depositor,
            escrowEntry.nftId
        );

        emit TokenTransfered(
            escrowEntry.entryId,
            escrowEntry.nftId,
            escrowEntry.nftContractAddress,
            escrowEntry.depositor,
            escrowEntry.bridgeContractAddress,
            escrowEntry.timestamp,
            escrowEntry.status
        );
    }

    function cancelDeposit(
        address tokenAddress,
        uint tokenId
    ) external onlyOwner {
        EscrowEntry storage escrowEntry = allEscrowEntries[
            activeEscrowEntryIds[tokenAddress][tokenId]
        ];

        require(
            escrowEntry.status == EscrowStatus.Locked,
            "Invalid deposit status."
        );

        escrowEntry.status = EscrowStatus.Cancelled;
        IERC721(escrowEntry.nftContractAddress).safeTransferFrom(
            address(this),
            msg.sender,
            escrowEntry.nftId
        );

        emit TokenTransfered(
            escrowEntry.entryId,
            escrowEntry.nftId,
            escrowEntry.nftContractAddress,
            escrowEntry.depositor,
            escrowEntry.bridgeContractAddress,
            escrowEntry.timestamp,
            escrowEntry.status
        );
    }

    event TokenTransfered(
        uint256 indexed id,
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address sender,
        address tokenBridgeAddress,
        uint256 createdAt,
        EscrowStatus status
    );
}
