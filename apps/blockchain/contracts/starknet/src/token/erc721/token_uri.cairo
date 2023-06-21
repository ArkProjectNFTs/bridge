///! Token URI.
///!
///! On Starknet, there is no support for string.
///! Only short string (< 32 chars) are supported.
///!
///! To ensure we can represent any URI, we need
///! a cairo data structure to handle this.
///!
///! In this implementation, we leverage a struct
///! to store the length of the string and it's content.
///! We can see a token URI as an array of short strings.
///!
///! A Dapp or the L1 just have to convert the felt252
///! into a short string, and concatenate all the
///! short strings in the array.
///!
///! URI are composed of a pre-determined set of characters,
///! which are all supported by cairo short string.

use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};

use traits::{Into, TryInto};
use option::OptionTrait;
use starknet::{ContractAddress, SyscallResult, StorageAccess, StorageBaseAddress};

// #[derive(Copy, Drop)]
// extern type StorageAddress;

// #[derive(Copy, Drop)]
// extern type StorageBaseAddress;

// TODO(glihm): Remove this on new version of compiler.
use starklane::utils::{
    serde::SpanSerde,
    serde_storage
};

/// Token URI represented internally as a list of short string.
///
/// It's not only a wrapper around Span because for the Dapp
/// to easily decode the data, a struct is well documented in the
/// ABI.
#[derive(Drop)]
struct TokenURI {
    // Number of felt252 (short string) used to represent the
    // entire URI.
    len: usize,

    // Span of felt252 (short string) to be concatenated
    // to have the complete URI.
    content: Span<felt252>,
}


/// Returns a new URI after a call to
/// the collection contract.
/// TODO:
/// None if it fails? Or do we want to Revert?!
///
/// * `collection_address` - Collection address of the collection.
/// * `token_id` - Token id.
fn uri_from_collection_call(
    collection_address: ContractAddress,
    token_id: u256,
) -> Option<TokenURI> {
    // collection.transfer_from(from, to, token_id);

    // Here, we will use the call contract syscall to
    // deserialize the token uri as needed depending on the
    // implementation of the targetted collection.
    // With the call contract syscall we can control better the deserialization.


    Option::None(())
}

/// Stores a TokenURI into a storage for the given token id.
fn token_uri_to_storage(storage_key: felt252, token_id: u256, token_uri: @TokenURI) {
    let mut _keys: Array<felt252> = ArrayTrait::new();
    _keys.append(storage_key);
    _keys.append(token_id.try_into().expect('Token id out of range'));

    let keys = _keys.span();

    let mut offset = 0_u8;

    serde_storage::set(keys, offset, (*token_uri.len).into());
    offset += 1;
    serde_storage::set_many(keys, offset, *token_uri.content);
}

/// Retrieves a TokenURI from storage for the given token id.
fn token_uri_from_storage(storage_key: felt252, token_id: u256) -> TokenURI{
    let mut _keys: Array<felt252> = ArrayTrait::new();
    _keys.append(storage_key);
    _keys.append(token_id.try_into().expect('Token id out of range'));

    let keys = _keys.span();

    let mut offset = 0_u8;

    let len: usize = serde_storage::get(keys, offset)
        .expect('Token ID invalid')
        .try_into()
    // Always comes from TokenURI, the unwrap should be safe.
        .unwrap();

    offset += 1;
    let content = serde_storage::get_many(keys, offset, len);

    TokenURI {
        len,
        content
    }
}

/// Serde implementation for TokenURI.
impl TokenURISerde of serde::Serde<TokenURI> {
    ///
    fn serialize(self: @TokenURI, ref output: Array<felt252>) {
        // We don't need to add the length, as the Serde
        // for Span already add the length as the first
        // element of the array.
        self.content.serialize(ref output);
    }

    ///
    fn deserialize(ref serialized: Span<felt252>) -> Option<TokenURI> {
        // Same here, deserializing the Span gives us the len.
        let content = Serde::<Span<felt252>>::deserialize(ref serialized)?;

        Option::Some(
            TokenURI {
		len: content.len(),
                content,
            }
        )
    }
}

/// Initializes a TokenURI from a short string.
impl Felt252IntoTokenURI of Into<felt252, TokenURI> {
    ///
    fn into(self: felt252) -> TokenURI {
        let mut content = ArrayTrait::<felt252>::new();
        content.append(self);

        TokenURI {
            len: 1,
            content: content.span()
        }
    }
}

/// Initializes a TokenURI from Array<felt252>.
impl ArrayIntoTokenURI of Into<Array<felt252>, TokenURI> {
    ///
    fn into(self: Array<felt252>) -> TokenURI {
        TokenURI {
            len: self.len(),
            content: self.span()
        }
    }
}

/// Implement the StorageAccess to enable TokenURI being stored in Storage struct.
impl StorageAccessTokenURI of StorageAccess<TokenURI> {
    ///
    fn write(address_domain: u32, base: StorageBaseAddress, value: TokenURI) -> SyscallResult<()> {
        StorageAccess::<u32>::write(address_domain, base, value.len)?;

        let mut offset: u8 = 1;
        loop {
            if offset.into() == value.len {
                break ();
            }

            let index = offset - 1;
            let uri_chunk = value.content[index.into()];

            starknet::storage_write_syscall(
                address_domain,
                starknet::storage_address_from_base_and_offset(base, offset),
                *uri_chunk
            )?;

            offset += 1;
        };

        SyscallResult::Ok(())
    }

    ///
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<TokenURI> {
        let len = StorageAccess::<u32>::read(address_domain, base)?;

        let mut content: Array<felt252> = ArrayTrait::new();
        let mut offset: u8 = 1;
        loop {
            if offset.into() == len {
                break ();
            }

            starknet::storage_read_syscall(
                address_domain,
                starknet::storage_address_from_base_and_offset(base, offset)
            )?;

            offset += 1;
        };

        SyscallResult::Ok(TokenURI {
            len,
            content: content.span(),
        })
    }
}

#[cfg(test)]
mod tests {

    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use traits::Into;
    use option::OptionTrait;
    use super::{TokenURI, TokenURISerde, ArrayIntoTokenURI};

    /// Should init a TokenURI from felt252.
    #[test]
    #[available_gas(2000000000)]
    fn from_felt252() {
        let u1: TokenURI = 'https:...'.into();
        assert(u1.len == 1, 'uri len');
        assert(u1.content.len() == 1, 'content len');
        assert(*u1.content[0] == 'https:...', 'content 0');
    }

    /// Should init a TokenURI from Array<felt252>.
    #[test]
    #[available_gas(2000000000)]
    fn from_array_felt252() {
        let mut content = ArrayTrait::<felt252>::new();
        content.append('ipfs://bafybeigdyrzt5sfp7udm7h');
        content.append('u76uh7y26nf3efuylqabf3oclgtqy5');
        content.append('5fbzdi');

        let u1: TokenURI = content.into();
        assert(u1.len == 3, 'uri len');
        assert(u1.content.len() == 3, 'content len');
        assert(*u1.content[0] == 'ipfs://bafybeigdyrzt5sfp7udm7h', 'content 0');
        assert(*u1.content[1] == 'u76uh7y26nf3efuylqabf3oclgtqy5', 'content 1');
        assert(*u1.content[2] == '5fbzdi', 'content 2');

        let mut content_empty = ArrayTrait::<felt252>::new();

        let u2: TokenURI = content_empty.into();
        assert(u2.len == 0, 'uri len');
        assert(u2.content.len() == 0, 'content len');
    }

    /// Should serialize and deserialize a TokenURI.
    #[test]
    #[available_gas(2000000000)]
    fn serialize_deserialize() {
        let mut content = ArrayTrait::<felt252>::new();
        content.append('hello');
        content.append('world');

        let u1: TokenURI = content.into();

        let mut buf = ArrayTrait::<felt252>::new();
        u1.serialize(ref buf);

        assert(buf.len() == 3, 'serialized buf len');

        assert(*buf[0] == 2, 'expected len');
        assert(*buf[1] == 'hello', 'expected item 0');
        assert(*buf[2] == 'world', 'expected item 1');

        let mut sp = buf.span();

        // Will make the test fail if deserialization fails.
        let u2 = Serde::<TokenURI>::deserialize(ref sp).unwrap();
    }

}