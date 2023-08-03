// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/utils/Strings.sol";

/*
 * Modulus used for computation in Starknet. This is the maximum value.
 *
 * https://github.com/starkware-libs/cairo/blob/08efd7158bf1ef012fa6b42b3429a398e1a75e26/crates/cairo-lang-runner/src/casm_run/mod.rs#L52
 *  2 ** 251 + 17 * 2 ** 192 + 1;
 */
uint256 constant SN_MODULUS =
    3618502788666131213697322783095070105623107215331596699973092056135872020481;

/*
 * Cairo Short String are 31 characters long.
 *
 * TODO: check how UTF-8 may be supported.
 *       but at the moment, everything is
 *       packed at byte level.
 */
uint256 constant CAIRO_STR_LEN = 31;

/*
 * A wrapper to type felt252
 * to ensure readability and better
 * compatibility with Starknet.
 *
 * TODO: will add gas cost due to struct instanciation...
 * keep it for now as the readability would be very nice,
 * but type alias are not available yet...
 */
/* struct Felt252 { */
/*     uint256 inner; */
/* } */

/*
 * Adapter library to ensure compatibility with Cairo.
 *
 * Cairo works with felts (252 bits), so a felt fits into a uint256,
 * but a uint256 may overflow.
 * To convert a uint256 into a felt, the first 6 bits must be cleared.
 */
library CairoAdapter {

    /*
     * Verifies if the given uint256 can be considered
     * as a valid ContractAddress on Starknet.
     */
    function isContractAddress(uint256 val)
        internal
        pure
        returns (bool) {

        return val > 0 && val < SN_MODULUS;
    }

    /*
     * Verifies if the given uint256 can be considered
     * as a felt252.
     */
    function isFelt252(uint256 val)
        internal
        pure
        returns (bool) {

        return val < SN_MODULUS;
    }

    /*
     * Represents a uint256 as an array of felt252
     * to be compatible with Starknet.
     *
     * Always return an array of 2 uint256.
     */
    function uint256IntoFelt252(uint256 val)
        internal
        pure
        returns (uint256[] memory) {

        // TODO: check if low and high parts are in the right order.
        uint256[] memory felts = new uint256[](2);
        felts[0] = uint128(val);
        felts[1] = uint128(val >> 128);
        return felts;
    }

    /*
     *
     */
    function uint256FromCairo(uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {
        // u256 in cairo is 2 felts long.
        require(offset + 1 < buf.length, "buffer too short to unpack u256.");
        return (buf[offset + 1] << 128) | uint128(buf[offset]);
    }

    /*
     * Serializes the given uint256 as a felt252,
     * and returns increment that is applied to the
     * offset.
     */
    function uint256Serialize(
        uint256 val,
        uint256[] memory buf,
        uint256 offset)
        internal
        pure
        returns (uint256) {

        uint256[] memory felts = uint256IntoFelt252(val);

        buf[offset] = felts[0];
        buf[offset + 1] = felts[1];
        return 2;
    }

    /*
     * Computes the lengths of the packed cairo string and add
     * one uint256 for the encoded length itself.
     *
     * Packed cairo string is represented as uint256[] and the length
     * is always preceding the array in serialization.
     *
     * This is cheaper than packing the string to get the length.
     */
    function shortStringSerializedLength(string memory str)
        internal
        pure
        returns (uint256) {

        // Even if the string is empty, we should return 1
        // as the serialization is expecting a uint256 as length of the Span<felt>.
        bytes memory strBytes = bytes(str);
        return ((strBytes.length + CAIRO_STR_LEN) / 32) + 1;
    }

    /*
     * Serializes the given string as a felt252 short string array,
     * and returns increment that is applied to the offset.
     */
    function shortStringSerialize(
        string memory str,
        uint256[] memory buf,
        uint256 offset)
        internal
        pure
        returns (uint256) {

        uint256[] memory packed = shortStringPack(str);

        if (packed.length == 0) {
            buf[offset] = 0;
            return 1;
        } else {
            buf[offset] = packed.length;
            offset++;

            for (uint256 i = 0; i < packed.length; i++) {
                buf[offset + i] = packed[i];
            }

            return 1 + packed.length;
        }
    }

    /*
     * Packs a string into an array of uint256 (Cairo Short String -> felt).
     *
     * Cairo short strings are 31 chars long, so here we pack every
     * 31 chars into a uint256 (representing a felt).
     * To ensure there are not overflow, the first six bits are cleared.
     */
    function shortStringPack(string memory str)
        internal
        pure
        returns (uint256[] memory) {

        bytes memory strBytes = bytes(str);
        uint256 packedLen = (strBytes.length + CAIRO_STR_LEN) / 32;

        uint256[] memory packedData = new uint256[](packedLen);

        if (packedLen == 0) {
            return packedData;
        }

        uint256 index = 0;
        uint256 v;

        for (uint256 i = 0; i < strBytes.length; i += CAIRO_STR_LEN) {

            // We take only CAIRO_STR_LEN to ensure it fits in a felt252.
            assembly { v := mload(add(add(strBytes, i), CAIRO_STR_LEN)) }

            // The MSB must be cleared to fit into a felt.
            v &= (type(uint256).max >> 8);

            packedData[index] = v;
            index++;
        }

        return packedData;
    }

    /*
     *
     */
    function shortStringUnpack(uint256[] memory buf, uint256 offset, uint256 len)
        internal
        pure
        returns (string memory) {

        string memory s;
        for (uint256 i = offset; i < offset + len; i++) {
            s = string.concat(s, uint256AsciiToString(buf[i]));
        }

        return s;
    }

    /*
     *
     */
    function uint256AsciiToString(uint256 value) internal pure returns (string memory) {
        string memory s = new string(32);
        bytes memory byteString = bytes(s);
        uint256 notNullCharCount = 0;

        // Extract all ascii values inside the uint256.
        for (uint256 i = 0; i < 32; i++) {
            uint256 asciiValue = (value >> (8 * (31 - i))) & 0xFF;
            byteString[i] = bytes1(uint8(asciiValue));
            if (asciiValue > 0) {
                notNullCharCount++;
            }
        }

        // Only use the not null ascii character to rebuild the string.
        bytes memory finalString = new bytes(notNullCharCount);

        // Not opti, but accurate to remove all null chars in this situation.
        uint256 finalIdx = 0;
        for (uint256 i = 0; i < 32; i++) {
            if (byteString[i] > 0) {
                finalString[finalIdx] = byteString[i];
                finalIdx += 1;
            }
        }        

        return string(finalString);
    }


}
