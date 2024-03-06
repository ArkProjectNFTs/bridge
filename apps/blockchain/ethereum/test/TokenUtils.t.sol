// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/token/TokenUtil.sol";

interface IUnderscoreBaseUri {
    function _baseUri() view external returns(string memory);
}

interface IBaseUri {
    function baseUri() view external returns(string memory);
}

contract WithUnderscoreBaseUri is IUnderscoreBaseUri {
    function _baseUri() view external returns (string memory) {
        return "_baseURI here";
    }
}

contract WithBaseUri is IBaseUri {
    function baseUri() view external returns (string memory) {
        return "baseUri here";
    }
}

contract WithoutBaseUri {
    function dummy() pure external returns (string memory) {
        return "dummy";
    }
}
contract WithFallback {
    fallback() external payable {}
}

contract WithInternaBaseUri {
    function _baseUri() internal view returns (string memory) {
        return "internal _baseUri";
    }
}

contract TokenUtilTest is Test {

    function test_with_baseuri() public {
        bool success = false;
        string memory uri = "";

        address toCheck = address(new WithUnderscoreBaseUri());
        (success, uri) = TokenUtil._callBaseUri(toCheck);
        assert(success);
        assert(keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked(IUnderscoreBaseUri(toCheck)._baseUri())));

        toCheck = address(new WithBaseUri());
        (success, uri) = TokenUtil._callBaseUri(toCheck);
        assert(success);
        assert(keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked(IBaseUri(toCheck).baseUri())));
    }

    function test_withouy_baseuri() public {
        bool success = false;
        string memory uri = "";

        address toCheck = address(new WithoutBaseUri());
        (success, uri) = TokenUtil._callBaseUri(toCheck);
        assert(!success);
        assert(keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked("")));

        toCheck = address(new WithFallback());
        (success, uri) = TokenUtil._callBaseUri(toCheck);
        assert(!success);
        assert(keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked("")));

        toCheck = address(new WithInternaBaseUri());
        (success, uri) = TokenUtil._callBaseUri(toCheck);
        assert(!success);
        assert(keccak256(abi.encodePacked(uri)) == keccak256(abi.encodePacked("")));
    }
}