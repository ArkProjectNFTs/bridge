// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

import "./IERC721Bridgeable.sol";

/*
 * ERC721 that can be minted by the bridge.
 *
 * NOTE: As this ERC721 must be upgradable, the name and symbol must
 * be overriden to work correctly, as the constructor can't be called,
 * but initialization function instead.
 */
contract ERC721Bridgeable is ERC721, Ownable, UUPSUpgradeable, IERC721Bridgeable {

    //
    string private _name;

    //
    string private _symbol;

    // Mapping for implementations initialization.
    mapping(address implementation => bool initialized) _initializedImpls;

    /*
     * Intialize used instead.
     */
    constructor()
        ERC721("", "")
    { }

    //
    function testMintRange(address to, uint256 tokenIdStart, uint256 tokenIdEnd)
        external {

        require(tokenIdStart < tokenIdEnd, "Bad range");
        uint256 id = tokenIdStart;
        for (id; id <= tokenIdEnd; id++) {
            _mint(to, id);
        }
    }

    /*
     * In this implementation, the owner is the bridge by default. So `onlyOwner`
     * is enough.
     */
    function mintFromBridge(address to, uint256 tokenId)
        public
        onlyOwner {

        _mint(to, tokenId);
    }

    /*
     * In this implementation, the owner is the bridge by default. So `onlyOwner`
     * is enough.
     */
    function burnFromBridge(uint256 id)
        public
        onlyOwner {

        _burn(id);
    }

    /*
     * Initializes the implementation.
     */
    function initialize(bytes calldata data)
        public {

        address impl = _getImplementation();
        require(!_initializedImpls[impl], "Implementation already initialized.");
        _initializedImpls[impl] = true;

        (string memory n, string memory s) = abi.decode(data, (string, string));

        _name = n;
        _symbol = s;

        _transferOwnership(_msgSender());
    }

    /*
     * Only owner should be able to upgrade.
     */
    function _authorizeUpgrade(address) internal override onlyOwner { }

    /*
     *
     */
    function name()
        public
        view
        override
        returns (string memory) {

        return _name;
    }

    /*
     *
     */
    function symbol()
        public
        view
        override
        returns (string memory) {

        return _symbol;
    }
}

