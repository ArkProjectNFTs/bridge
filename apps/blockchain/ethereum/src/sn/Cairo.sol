// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "openzeppelin-contracts/contracts/utils/Strings.sol";

type felt252 is uint256;
type snaddress is uint256;

// TODO: add offset / array size checks for serialization.
// TODO: USE ASSERT instead of REQUIRE if it's only code logic checking.
//       USE ASSERT for all bound / offset checks.

/*
   Modulus used for computation in Starknet. This is the maximum value.
 
   https://github.com/starkware-libs/cairo/blob/08efd7158bf1ef012fa6b42b3429a398e1a75e26/crates/cairo-lang-runner/src/casm_run/mod.rs#L52
   2  251 + 17  2  192 + 1;
*/
uint256 constant SN_MODULUS =
    3618502788666131213697322783095070105623107215331596699973092056135872020481;

/*
   Cairo Short String are 31 characters long.
 
   TODO: check how UTF-8 may be supported.
   but at the moment, everything is
   packed at byte level.
*/
uint256 constant CAIRO_STR_LEN = 31;

error CairoWrapError();

/**
   @title Adapter library to ensure compatibility with Cairo.
 
   Cairo works with felts (252 bits), so a felt always fits into a single uint256,
   but a uint256 may overflow.
   To convert a uint256 into a felt, the first 6 bits must be cleared.
*/
library Cairo {

    /**
       @notice Verifies if the given uint256 can be considered
       as a felt252.

       @param val Value to be checked as a felt252.

       @return True if the value can fit into a felt252, false otherwise.
    */
    function isFelt252(
        uint256 val
    )
        internal
        pure
        returns (bool)
    {
        return val < SN_MODULUS;
    }

    /**
       @notice Wraps an uint256 into a felt252.
       Ensures that the val can fit into a felt252.
       
       @param val Value to be wrapped.

       @return felt252 with wrapped value.

       @dev Reverts if val is too large for felt252.
     */
    function felt252Wrap(
        uint256 val
    )
        internal
        pure
        returns (felt252)
    {
        if (!isFelt252(val)) {
            revert CairoWrapError();
        }

        return felt252.wrap(val);
    }

    /**
       @notice Wraps an uint256 into a snaddress.
       Ensures that the val can fit into a felt252.

       @param val Value to be wrapped.

       @return snaddress with wrapped value.

       @dev Reverts if val is too large for felt252.
    */
    function snaddressWrap(
        uint256 val
    )
        internal
        pure
        returns (snaddress)
    {
        if (!isFelt252(val)) {
            revert CairoWrapError();
        }

        return snaddress.wrap(val);
    }

    /**
       @notice Serializes the given uint256 as a felt252 (low and high parts).

       @param val Value to be serialized.
       @param buf Buffer where serialized form is saved.
       @param offset Offset in `buf` where serialization must start.

       @return Offset increment applied to serialize the value.
    */
    function uint256Serialize(
        uint256 val,
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256)
    {    
        buf[offset] = uint128(val);
        buf[offset + 1] = uint128(val >> 128);
        return 2;
    }

    /**
       @notice Deserializes an uint256 from the given buffer.

       @param buf Buffer where data is serialized.
       @param offset Offset in `buf` where deserialization must start.

       @return The deserialized value.
    */
    function uint256Deserialize(
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256)
    {
        // u256 in cairo is 2 felts long with low and high parts.
        return (buf[offset + 1] << 128) | uint128(buf[offset]);
    }

    /**
       @notice Serializes an array of uint256.

       @param arr Array to be serialized.
       @param buf Buffer where serialized form is saved.
       @param offset Offset in `buf` where serialization must start.

       @return Offset increment applied to serialize the value.
    */
    function uint256ArraySerialize(
        uint256[] memory arr,
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256)
    {
        uint256 _offset = offset;

        // Arrays always have their length first in Cairo.
        buf[_offset] = arr.length;
        _offset++;

        for (uint256 i = 0; i < arr.length; i++) {
            _offset += uint256Serialize(arr[i], buf, _offset);
        }

        return _offset - offset;
    }

    /**
       @notice Deserializes an array of uint256 from the given buffer.

       @param buf Buffer where data is serialized.
       @param offset Offset in `buf` where deserialization must start.

       @return The offset increment applied to deserialize and the deserialized value.
    */
    function uint256ArrayDeserialize(
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256, uint256[] memory)
    {
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



    /**
        @notice Unpacks a cairo string (byte array) into a string.
     
        @param buf Buffer where the string is packed as a cairo string.
        @param offset Offset where the unpack must start.
        
        @return Unpacked string.
     */
    function cairoStringUnpack(
        uint256[] memory buf, 
        uint256 offset
    ) 
        internal 
        pure 
        returns (string memory) 
    {
        string memory s;
        uint256 dataLen = buf[offset];
        offset += 1;
        for (uint256 i = offset; i < (offset + dataLen); ++i) {
            s = string.concat(s, uint256AsciiNbcharsToString(buf[i], uint8(CAIRO_STR_LEN)));
        }
        offset += dataLen;
        
        // handle pending word
        uint8 nbChars = uint8(buf[offset + 1] & 0xFF);
        s = string.concat(s, uint256AsciiNbcharsToString(buf[offset], nbChars));
        return s;
    }

    /**
        @notice Packs a string into an array of uint256 (Cairo byte array string)

        @dev Cairo (byte array) string are chunk by 31 bytes.
     */
    function cairoStringPack(
        string memory str
    )
        internal
        pure
        returns (uint256[] memory)
    {
        bytes memory strBytes = bytes(str);
        uint256 dataLen = strBytes.length / CAIRO_STR_LEN;
        uint256 pendingLen = strBytes.length % CAIRO_STR_LEN;

        uint256 packedLen = 1 + dataLen + 1 + 1;
        uint256[] memory packedData = new uint256[](packedLen);
        
        uint256 index = 0;
        uint256 v;
        uint256 offset = 0x20; // length is first u256

        packedData[index] = dataLen;
        index++;

        for (uint256 i = 0; i < dataLen; i ++) {
            assembly { 
                v := mload(add(strBytes, offset)) 
                v := shr(8, v)
                }

            packedData[index] = v;
            index++;
            offset += CAIRO_STR_LEN;
        }

        // pending word
        assembly { 
            v := mload(add(strBytes, offset))
            v := shr(mul(sub(32, pendingLen), 8),v)
        }
                
        packedData[index] = v;
        index++;

        packedData[index] = pendingLen;

        return packedData;
    }

    /**
        @notice Deserializes a cairo (byte array) string from the given buffer

        @param buf Buffer where data is serialized.
        @param offset Offset in `buf` where deserialization must start.

        @return The offset increment applied to deserialize and the deserialized value.
    */
    function cairoStringDeserialize(
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256, string memory)
    {
        string memory s = cairoStringUnpack(buf, offset);
        uint256 packedLen = 1 + buf[offset] + 1 + 1;
        return (packedLen, s);
    }

    /** 
        @notice Commputes the length of the packed cairo string.

        @dev Same schema as Cairo byteArray serialize.
    */
    function cairoStringSerializedLength(
        string memory str
    )
        internal
        pure
        returns (uint256)
    {
        bytes memory strBytes = bytes(str);
        uint256 dataLen = strBytes.length / CAIRO_STR_LEN;
        uint256 packedLen = 1 + dataLen + 1 + 1;
        return packedLen;
    }

    /**
        @notice Serializes a string into a cairo (byte array) string.

        @param str String to be serialized.
        @param buf Buffer where serialized form is saved.
        @param offset Offset in `buf` where serialization must start.

        @return Offset increment applied to serialize the value.
     */
    function cairoStringSerialize(
        string memory str,
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256)
    {
        uint256[] memory packed = cairoStringPack(str);
        for (uint256 i = 0; i < packed.length; i++) {
            buf[offset + i] = packed[i];
        }
        return packed.length;
    }

    /**
        @notice Serializes an array for strings as cairo array of strings.

        @param arr Array to be serialized.
        @param buf Buffer where serialized form is saved.
        @param offset Offset in `buf` where serialization must start.

        @return Offset increment applied to serialize the value.
     */
    function cairoStringArraySerialize(
        string[] memory arr,
        uint256[] memory buf,
        uint256 offset
    ) 
        internal
        pure
        returns (uint256)
    {
        uint256 _offset = offset;

        buf[_offset++] = arr.length;

        for (uint256 i = 0; i < arr.length; i++) {
            _offset += cairoStringSerialize(arr[i], buf, _offset);
        }

        return _offset - offset;
    }

    /**
        @notice Deserializes an array of cairo strin from the given buffer.

        @param buf Buffer where data is serialized.
        @param offset Offset in `buf` where deserialization must start.

        @return The offset increment applied to deserialize and the deserialized value.
     */
    function cairoStringArrayDeserialize(
        uint256[] memory buf,
        uint256 offset
    )
        internal
        pure
        returns (uint256, string[] memory)
    {
        uint256 _offset = offset;

        uint256 len = buf[_offset++];
        string[] memory strs = new string[](len);

        for (uint256 i = 0; i < len; i++) {
            (
                uint256 inc,
                string memory s 
            ) = cairoStringDeserialize(buf, _offset);

            _offset += inc;
            strs[i] = s;
        }

        return (_offset - offset, strs);
    }

    /**
       @notice Converts an uint256 containing ascii characters
       as a string.

       @param value String from ascii characters.
    */
    function uint256AsciiToString(
        uint256 value
    )
        internal
        pure
        returns (string memory)
    {
        return uint256AsciiNbcharsToString(value, uint8(CAIRO_STR_LEN));
    }

    function uint256AsciiNbcharsToString(
        uint256 value,
        uint8 length
    )
        internal
        pure
        returns (string memory)
    {
        string memory s = new string(length);
        bytes memory byteString = bytes(s);

        // cairo string is 31 bytes with first character as higher bit
        for (uint256 i = 0; i < length; ++i) {
            uint256 asciiValue = (value >> (8 * (length - 1 - i))) & 0xFF;
            byteString[i] = bytes1(uint8(asciiValue));
        }

        return s;
    }


}
