// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "openzeppelin-contracts/contracts/utils/Strings.sol";

type felt252 is uint256;
type snaddress is uint256;

// TODO: add offset / array size checks for serialization.
// TODO: USE ASSERT instead of REQUIRE if it's only code logic checking.
//       USE ASSERT for all bound / offset checks.

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
library Cairo {

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
     * Wraps an uint256 into a felt252.
     * Ensures that the val can fit into a felt252.
     *
     * Require is used instead of assert as the uint256 may come from
     * external user.
     */
    function felt252Wrap(uint256 val)
        internal
        pure
        returns (felt252) {

        require(isFelt252(val), "Error wrapping uint256 into felt252.");
        return felt252.wrap(val);
    }

    /*
     * Wraps an uint256 into a snaddress.
     * Ensures that the val can fit into a felt252.
     *
     * Require is used instead of assert as the uint256 may come from
     * external user.
     */
    function snaddressWrap(uint256 val)
        internal
        pure
        returns (snaddress) {

        require(isFelt252(val), "Error wrapping uint256 into snaddress.");
        return snaddress.wrap(val);
    }

    /*
     * Serializes the given uint256 as a felt252 (low and high parts),
     * and returns increment that is applied to the
     * offset.
     */
    function uint256Serialize(uint256 val, uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {

        buf[offset] = uint128(val);
        buf[offset + 1] = uint128(val >> 128);
        return 2;
    }

    /*
     * Deserializes a Cairo uint256 representation into solidity uint256.
     */
    function uint256Deserialize(uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {

        // u256 in cairo is 2 felts long with low and high parts.
        require(offset + 1 < buf.length, "buffer too short to unpack u256.");
        return (buf[offset + 1] << 128) | uint128(buf[offset]);
    }

    /*
     * Serializes an array of uint256 as felt252 (low and high parts) array.
     * Returns the increment applied to the offset.
     */
    function uint256ArraySerialize(uint256[] memory arr, uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {
        uint256 _offset = offset;

        // Arrays always have their length first in Cairo.
        buf[_offset] = arr.length;
        _offset++;

        for (uint256 i = 0; i < arr.length; i++) {
            _offset += uint256Serialize(arr[i], buf, _offset);
        }

        return _offset - offset;
    }

    /*
     * Deserializes an array of uint256.
     * Returns the offset increment and the uint256[].
     */
    function uint256ArrayDeserialize(uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256, uint256[] memory) {

        uint256 len = buf[offset++];
        uint256[] memory uints = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            uints[i] = uint256Deserialize(buf, offset);
            offset += 2;
        }

        // + 1 to include array size itself.
        // *2 because uint256 in cairo is 2 felt252 long.
        return ((len * 2) + 1, uints);
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
     * Serializes an array of string as felt252 short strings.
     * Returns the increment applied to the offset.
     */
    function shortStringArraySerialize(string[] memory arr, uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {

        uint256 _offset = offset;

        // Arrays always have their length first in Cairo.
        buf[_offset++] = arr.length;

        for (uint256 i = 0; i < arr.length; i++) {
            _offset += shortStringSerialize(arr[i], buf, _offset);
        }

        return _offset - offset;
    }

    /*
     * Serializes the given string as a felt252 short string array,
     * and returns increment that is applied to the offset.
     */
    function shortStringSerialize(string memory str, uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256) {

        uint256[] memory packed = shortStringPack(str);

        if (packed.length == 0) {
            buf[offset] = 0;
            return 1;
        } else {
            buf[offset++] = packed.length;

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

            // The MSB must always be cleared to fit into a felt252.
            v &= (type(uint256).max >> 8);

            packedData[index] = v;
            index++;
        }

        return packedData;
    }

    /*
     * Deserializes a cairo short string into Solidity string.
     * Returns the offset increment and the deserialized string.
     */
    function shortStringDeserialize(uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256, string memory) {

        uint256 len = buf[offset++];
        string memory s = shortStringUnpack(buf, offset, len);

        // +1 to take in account the array length that was also deserialized.
        return (len + 1, s);
    }

    /*
     * Deserializes an array of cairo short strings into Solidity string[].
     * Returns the offset increment and the string[].
     */
    function shortStringArrayDeserialize(uint256[] memory buf, uint256 offset)
        internal
        pure
        returns (uint256, string[] memory) {

        uint256 _offset = offset;

        uint256 len = buf[_offset++];
        string[] memory strs = new string[](len);

        for (uint256 i = 0; i < len; i++) {
            (
                uint256 inc,
                string memory s
            ) = shortStringDeserialize(buf, _offset);

            _offset += inc;
            strs[i] = s;
        }

        return (_offset - offset, strs);
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
    function uint256AsciiToString(uint256 value)
        internal
        pure
        returns (string memory) {

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
