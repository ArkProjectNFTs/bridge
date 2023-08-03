///! An opiniated string implementation, waiting
///! the long string being supported by Cairo natively.
///!
///! Can be tracked here: https://github.com/orgs/starkware-libs/projects/1/views/1

use debug::PrintTrait;
use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use integer::{U8IntoFelt252, U32IntoFelt252, Felt252TryIntoU32};

use traits::{Into, TryInto};
use option::OptionTrait;
use starknet::{ContractAddress, SyscallResult, StorageAccess, StorageBaseAddress};

/// LongString represented internally as a list of short string.
#[derive(Copy, Drop)]
struct LongString {
    // Span of felt252 (short string) to be concatenated
    // to have the complete long string.
    // We take advantage of the Span serialization where
    // the size is always present.
    content: Span<felt252>,
}

/// Serde implementation for LongString.
impl LongStringSerde of serde::Serde<LongString> {
    ///
    fn serialize(self: @LongString, ref output: Array<felt252>) {
        // We don't need to add the length, as the Serde
        // for Span already add the length as the first
        // element of the array.
        self.content.serialize(ref output);
    }

    ///
    fn deserialize(ref serialized: Span<felt252>) -> Option<LongString> {
        // Same here, deserializing the Span gives us the len.
        let content = Serde::<Span<felt252>>::deserialize(ref serialized)?;
        Option::Some(LongString { content,  })
    }
}

/// StorageAccess implementation for LongString.
impl LongStringStorageAccess of starknet::StorageAccess<LongString> {
    ///
    fn read(
        address_domain: u32, base: starknet::StorageBaseAddress
    ) -> SyscallResult::<LongString> {
        let len = StorageAccess::<u32>::read(address_domain, base)?;

        let mut content: Array<felt252> = ArrayTrait::new();
        let mut offset: u8 = 1;
        loop {
            if offset.into() == len + 1 {
                break ();
            }

            match starknet::storage_read_syscall(
                address_domain, starknet::storage_address_from_base_and_offset(base, offset)
            ) {
                Result::Ok(r) => content.append(r),
                Result::Err(e) => panic(e)
            };

            offset += 1;
        };

        SyscallResult::Ok(LongString { content: content.span(),  })
    }

    ///
    fn write(
        address_domain: u32, base: StorageBaseAddress, value: LongString
    ) -> SyscallResult::<()> {
        StorageAccess::<u32>::write(address_domain, base, value.content.len())?;

        let mut offset: u8 = 1;

        loop {
            if offset.into() == value.content.len() + 1 {
                break ();
            }

            let index = offset - 1;
            let ll_chunk = value.content[index.into()];

            match starknet::storage_write_syscall(
                address_domain,
                starknet::storage_address_from_base_and_offset(base, offset),
                *ll_chunk
            ) {
                Result::Ok(r) => r,
                Result::Err(e) => panic(e),
            }

            offset += 1;
        };

        SyscallResult::Ok(())
    }

    ///
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<LongString> {
        LongStringStorageAccess::read_at_offset_internal(address_domain, base, offset)
    }

    ///
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: LongString
    ) -> SyscallResult<()> {
        LongStringStorageAccess::write_at_offset_internal(address_domain, base, offset, value)
    }

    ///
    fn size_internal(value: LongString) -> u8 {
        value.content.len().try_into().unwrap() + 1_u8
    }
}

/// LegacyHash implementation for LongString.
impl LongStringLegacyHash of hash::LegacyHash<LongString> {
    ///
    fn hash(state: felt252, value: LongString) -> felt252 {
        let mut buf: Array<felt252> = ArrayTrait::new();
        value.serialize(ref buf);
        let k = poseidon::poseidon_hash_span(buf.span());
        hash::LegacyHash::hash(state, k)
    }
}

/// Initializes a LongString from a short string.
impl Felt252IntoLongString of Into<felt252, LongString> {
    ///
    fn into(self: felt252) -> LongString {
        let mut content = ArrayTrait::<felt252>::new();
        content.append(self);

        LongString { content: content.span() }
    }
}

/// Initializes a LongString from Array<felt252>.
impl ArrayIntoLongString of Into<Array<felt252>, LongString> {
    ///
    fn into(self: Array<felt252>) -> LongString {
        LongString { content: self.span() }
    }
}

/// Long string from span.
impl SpanFeltTryIntoLongString of TryInto<Span<felt252>, LongString> {
    ///
    fn try_into(self: Span<felt252>) -> Option<LongString> {
        if self.len() == 0_usize {
            Option::None(())
        } else if self.len() == 1_usize {
            let ll: felt252 = *self[0];
            Option::Some(ll.into())
        } else {
            Option::Some(LongString { content: self })
        }
    }
}

/// Long string may be a single felt or an already
/// serialized LongString for contract that supports it.
impl SpanFeltSerializedTryIntoLongString of TryInto<Span<felt252>, LongString> {
    ///
    fn try_into(self: Span<felt252>) -> Option<LongString> {
        if self.len() == 0_usize {
            Option::None(())
        } else if self.len() == 1_usize {
            Option::Some((*self[0]).into())
        } else {
            // We need to skip the first felt252 which is the length.
            let len = (*self[0]).try_into().expect('Bad LongString len from span');

            let mut content: Array<felt252> = ArrayTrait::new();

            let mut i = 1_usize;
            loop {
                if i == len + 1 {
                    break ();
                }

                content.append(*self[i]);

                i += 1;
            };

            Option::Some(LongString { content: content.span() })
        }
    }
}

///
#[cfg(test)]
mod tests {
    use debug::PrintTrait;
    use serde::Serde;
    use array::{ArrayTrait, SpanTrait};
    use traits::{Into, TryInto};
    use option::OptionTrait;
    use result::ResultTrait;
    use super::{LongString, LongStringSerde, ArrayIntoLongString, SpanFeltTryIntoLongString};

    #[starknet::interface]
    trait IContract1<T> {
        fn get_ll(self: @T) -> LongString;
        fn set_ll(ref self: T, ll: LongString);

        fn get_ll_value(self: @T, key: u256) -> LongString;
        fn set_ll_value(ref self: T, key: u256, value: LongString);

        fn get_ll_key(self: @T, key: LongString) -> felt252;
        fn set_ll_key(ref self: T, key: LongString, value: felt252);
    }

    #[starknet::contract]
    mod contract1 {
        use super::{LongString, IContract1};

        #[storage]
        struct Storage {
            ll: LongString,
            uris: LegacyMap<u256, LongString>,
            strs: LegacyMap<LongString, felt252>,
        }

        #[external(v0)]
        impl Contract1 of IContract1<ContractState> {
            fn get_ll(self: @ContractState) -> LongString {
                self.ll.read()
            }

            fn set_ll(ref self: ContractState, ll: LongString) {
                self.ll.write(ll);
            }

            fn get_ll_value(self: @ContractState, key: u256) -> LongString {
                self.uris.read(key)
            }

            fn set_ll_value(ref self: ContractState, key: u256, value: LongString) {
                self.uris.write(key, value);
            }

            fn get_ll_key(self: @ContractState, key: LongString) -> felt252 {
                self.strs.read(key)
            }

            fn set_ll_key(ref self: ContractState, key: LongString, value: felt252) {
                self.strs.write(key, value)
            }
        }
    }

    ///
    fn deploy_contract1() -> IContract1Dispatcher {
        let mut calldata: Array<felt252> = ArrayTrait::new();

        let (addr, _) = starknet::deploy_syscall(
            contract1::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false
        )
            .expect('contract1 deploy failed');

        IContract1Dispatcher { contract_address: addr }
    }

    /// Should correctly get LongString from storage.
    #[test]
    #[available_gas(2000000000)]
    fn from_storage() {
        let c1: IContract1Dispatcher = deploy_contract1();

        c1.set_ll('salut'.into());

        let ll = c1.get_ll();
        assert(ll.content.len() == 1, 'bad len from storage');
        assert(*ll.content[0] == 'salut', 'bad content from storage');
    }

    /// Should correctly get LongString as a value of storage legacymap.
    #[test]
    #[available_gas(2000000000)]
    fn from_storage_value_hashmap() {
        let c1: IContract1Dispatcher = deploy_contract1();

        c1.set_ll_value(1_u256, 'salut'.into());

        let ll = c1.get_ll_value(1_u256);
        assert(ll.content.len() == 1, 'bad len from storage');
        assert(*ll.content[0] == 'salut', 'bad content from storage');

        let ll = c1.get_ll_value(2_u256);
        assert(ll.content.len() == 0, 'bad len 0 expected');
    }

    /// Should correctly get LongString as a key of storage legacymap.
    #[test]
    #[available_gas(2000000000)]
    fn from_storage_key_hashmap() {
        let c1: IContract1Dispatcher = deploy_contract1();

        let ll = 'salut'.into();

        c1.set_ll_key(ll, 1234);

        let f = c1.get_ll_key(ll);
        assert(f == 1234, 'bad felt from ll value');

        let f = c1.get_ll_key('blou'.into());
        assert(f == 0, 'bad felt 0 expected');
    }

    /// Should init a LongString from felt252.
    #[test]
    #[available_gas(2000000000)]
    fn from_felt252() {
        let u1: LongString = 'https:...'.into();
        assert(u1.content.len() == 1, 'll len');
        assert(*u1.content[0] == 'https:...', 'content 0');
    }

    /// Should init a LongString from Array<felt252>.
    #[test]
    #[available_gas(2000000000)]
    fn from_array_felt252() {
        let mut content = ArrayTrait::<felt252>::new();
        content.append('ipfs://bafybeigdyrzt5sfp7udm7h');
        content.append('u76uh7y26nf3efuylqabf3oclgtqy5');
        content.append('5fbzdi');

        let u1: LongString = content.into();
        assert(u1.content.len() == 3, 'll len');
        assert(*u1.content[0] == 'ipfs://bafybeigdyrzt5sfp7udm7h', 'content 0');
        assert(*u1.content[1] == 'u76uh7y26nf3efuylqabf3oclgtqy5', 'content 1');
        assert(*u1.content[2] == '5fbzdi', 'content 2');

        let mut content_empty = ArrayTrait::<felt252>::new();

        let u2: LongString = content_empty.into();
        assert(u2.content.len() == 0, 'll len');
    }

    /// Should init a LongString from Span<felt252>.
    #[test]
    #[available_gas(2000000000)]
    fn from_span_felt252() {
        let mut a: Array<felt252> = ArrayTrait::new();
        a.append('https:...');

        let u1: LongString = (a.span()).try_into().unwrap();
        assert(u1.content.len() == 1, 'll len');
        assert(*u1.content[0] == 'https:...', 'content 0');
    }

    /// Should serialize a LongString.
    #[test]
    #[available_gas(2000000000)]
    fn serialize() {
        let mut content = ArrayTrait::<felt252>::new();
        content.append('hello');
        content.append('world');

        let u1: LongString = content.into();

        let mut buf = ArrayTrait::<felt252>::new();
        u1.serialize(ref buf);

        assert(buf.len() == 3, 'Serialized buf len');

        assert(*buf[0] == 2, 'Expected len');
        assert(*buf[1] == 'hello', 'Expected item 0');
        assert(*buf[2] == 'world', 'Expected item 1');
    }

    /// Should deserialize a LongString.
    #[test]
    #[available_gas(2000000000)]
    fn deserialize() {
        let mut buf = ArrayTrait::<felt252>::new();
        buf.append(2);
        buf.append('hello');
        buf.append('world');

        let mut sp = buf.span();

        let ll = Serde::<LongString>::deserialize(ref sp).unwrap();
        assert(ll.content.len() == 2, 'Bad deserialized len');
        assert(*ll.content[0] == 'hello', 'Expected item 0');
        assert(*ll.content[1] == 'world', 'Expected item 1');
    }
}

