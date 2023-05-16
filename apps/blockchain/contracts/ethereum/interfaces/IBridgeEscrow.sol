pragma solidity ^0.8.0;

interface IBridgeEscrow {
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

    function depositNFT(
        address tokenAddress,
        uint256 tokenId,
        address depositorAddress
    ) external;

    function getEscrowEntry(address tokenAddress, uint tokenId) external view;

    function withdrawDeposit(address tokenAddress, uint tokenId) external;

    function cancelDeposit(address tokenAddress, uint tokenId) external;

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
