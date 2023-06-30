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

use debug::PrintTrait;
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


/// Token URI represented internally as a list of short string.
///
/// It's not only a wrapper around Span because for the Dapp
/// to easily decode the data, a struct is well documented in the
/// ABI.
#[derive(Copy, Drop)]
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
fn token_uri_from_contract_call(
    collection_address: ContractAddress,
    token_id: u256,
) -> Option<TokenURI> {

    // TODO: add the interface detection when the standard is out.

    let token_uri_selector = 0x0226ad7e84c1fe08eb4c525ed93cccadf9517670341304571e66f7c4f95cbe54;
    let tokenUri_selector = 0x0362dec5b8b67ab667ad08e83a2c3ba1db7fdb4ab8dc3a33c057c4fddec8d3de;

    let mut _calldata: Array<felt252> = ArrayTrait::new();
    token_id.serialize(ref _calldata);

    let calldata = _calldata.span();
    
    match starknet::call_contract_syscall(
        collection_address,
        token_uri_selector,
        calldata,
    ) {
        Result::Ok(span) => token_uri_from_span(span),
        Result::Err(e) => {
            e.print();
            match starknet::call_contract_syscall(
                collection_address,
                tokenUri_selector,
                calldata,
            ) {
                Result::Ok(span) => token_uri_from_span(span),
                Result::Err(e) => {
                    e.print();
                    Option::None(())
                }
            }
        }
    }
}

/// Token URI may be a single felt or an already
/// serialized TokenURI for contract that supports it.
///
/// * `data` - Data that may contain a single felt URI or a TokenURI.
fn token_uri_from_span(data: Span<felt252>) -> Option<TokenURI> {

    if data.len() == 0_usize {
        Option::None(())
    } else if data.len() == 1_usize {
        let uri: felt252 = *data[0];
        Option::Some(uri.into())
    } else {
        // We need to remove the first felt252 which is the length.
        let len = (*data[0]).try_into().expect('Bad URI len from span');

        let mut content: Array<felt252> = ArrayTrait::new();

        let mut i = 1_usize;
        loop {
            if i == len + 1 {
                break();
            }

            content.append(*data[i]);

            i += 1;
        };

        Option::Some(TokenURI {
            len,
            content: content.span()
        })
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

impl TokenURIStorageAccess of starknet::StorageAccess<TokenURI> {

    fn read(address_domain: u32, base: starknet::StorageBaseAddress) -> SyscallResult::<TokenURI> {
        let len = StorageAccess::<u32>::read(address_domain, base)?;

        let mut content: Array<felt252> = ArrayTrait::new();
        let mut offset: u8 = 1;
        loop {
            if offset.into() == len + 1 {
                break ();
            }

            match starknet::storage_read_syscall(
                address_domain,
                starknet::storage_address_from_base_and_offset(base, offset)
            ) {
                Result::Ok(r) => content.append(r),
                Result::Err(e) => panic(e)
            };

            offset += 1;
        };

        SyscallResult::Ok(TokenURI {
            len,
            content: content.span(),
        })
    }


    fn write(address_domain: u32, base: StorageBaseAddress, value: TokenURI) -> SyscallResult::<()> {
        StorageAccess::<u32>::write(address_domain, base, value.len)?;

        let mut offset: u8 = 1;

        loop {
            if offset.into() == value.len + 1 {
                break ();
            }

            let index = offset - 1;
            let uri_chunk = value.content[index.into()];

            match starknet::storage_write_syscall(
                address_domain,
                starknet::storage_address_from_base_and_offset(base, offset),
                *uri_chunk
            ) {
                Result::Ok(r) => r,
                Result::Err(e) => panic(e),
            }

            offset += 1;
        };

        SyscallResult::Ok(())
    }

    fn read_at_offset_internal(address_domain: u32, base: StorageBaseAddress, offset: u8) -> SyscallResult<TokenURI> {
        TokenURIStorageAccess::read_at_offset_internal(address_domain, base, offset)
    }

    fn write_at_offset_internal(address_domain: u32, base: StorageBaseAddress, offset: u8, value: TokenURI) -> SyscallResult<()> {
        TokenURIStorageAccess::write_at_offset_internal(address_domain, base, offset, value)
    }

    fn size_internal(value: TokenURI) -> u8 {
        value.len.try_into().unwrap() + 1_u8
    }
}

impl TokenURILegacyHash of hash::LegacyHash::<TokenURI> {
    #[inline(always)]
    fn hash(state: felt252, value: TokenURI) -> felt252 {
        let mut buf: Array<felt252> = ArrayTrait::new();
        value.serialize(ref buf);
        let k = poseidon::poseidon_hash_span(buf.span());
        hash::LegacyHash::hash(state, k)
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
