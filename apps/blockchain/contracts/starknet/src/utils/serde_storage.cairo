///! From scratch storage inspired from Dojoengine
///! as currently Cairo compiler is blocking the Storage read
///! if it's a user define struct.
///!
///! Work inspired from https://github.com/dojoengine/dojo and the compiler
///! storage handling: https://github.com/starkware-libs/cairo/blob/05d4a9ec46885ac199025f829c9458989c1ddbba/crates/cairo-lang-starknet/src/plugin/storage.rs#L13
///!
///! When we use a Storage struct, the compiler is generating
///! the key by computed the starknet_keccak of the name of the field.
///! So be careful, if you do the same, you need to be sure that no
///! other field in the Storage struct has the same name. It's good
///! to follow using the starknet_keccak to avoid conflicts and predictable
///! results. Just be sure that you don't duplicate the identifier.
///!
///! Basically, when we write into the storage, we need a felt252
///! as a key.
///! This key then has a complete range of values in the storage,
///! from a base address.
///! We then use an offset to store some felts. The offset is for
///! now limited as a u8, so we need to ensure the size
///! of the serialized value is not more than 255. (TODO: check that info).
///!
///! The value then, to be completely decoupled from the types of Cairo,
///! is always a span of felt252, which usually comes from serialized structures.
///!
///! TODO: test if the override of StorageAccess in Cairo 2.0.0 works
///! for custom structs.

use array::{ArrayTrait, SpanTrait};
use option::OptionTrait;
use starknet::SyscallResultTrait;
use traits::Into;
use poseidon::poseidon_hash_span;

use debug::PrintTrait;

const ADDRESS_DOMAIN: u32 = 0;

/// Gets a single value from storage from the given keys.
///
/// * `keys` - Keys hashed to compute a single felt252 key.
/// * `offset` - Offset of the key storage, limited to 256 values.
fn get(keys: Span<felt252>, offset: u8) -> Option<felt252> {
    let keys_hash = poseidon_hash_span(keys);

    let base = starknet::storage_base_address_from_felt252(keys_hash);

    match starknet::storage_read_syscall(
        ADDRESS_DOMAIN,
        starknet::storage_address_from_base_and_offset(base, offset)
    ) {
        Result::Ok(f) => Option::Some(f),
        Result::Err(_) => Option::None(()),
    }
}

/// Gets a span of felts from the storage.
///
/// * `keys` - Keys hashed to compute a single felt252 key.
/// * `offset` - Offset of the key storage, limited to 256 values (offset taken in account).
/// * `length` - Expected length of the span.
fn get_span(keys: Span<felt252>, offset: u8, length: usize) -> Span<felt252> {
    if length + offset.into() > 256 {
        let mut panic_data: Array<felt252> = ArrayTrait::new();
        panic_data.append('Storage of a span must');
        panic_data.append('be less than 256 felts.');
        panic(panic_data);
    }

    let keys_hash = poseidon_hash_span(keys);

    let base = starknet::storage_base_address_from_felt252(keys_hash);

    let target_offset = length + offset.into();

    let mut value = ArrayTrait::new();
    let mut offset = offset;
    loop {
        if offset.into() == target_offset {
            break ();
        }

        // TODO: check here how to abort the loop if the key is not found?
        value.append(
            starknet::storage_read_syscall(
                ADDRESS_DOMAIN,
                starknet::storage_address_from_base_and_offset(base, offset)
            ).unwrap_syscall()
        );

        offset += 1;
    };

    value.span()
}

/// Sets a single value to storage from the given keys.
///
/// * `keys` - Keys hashed to compute a single felt252 key.
/// * `offset` - Offset of the key storage, limited to 256 values.
/// * `value` - Value to store.
fn set(keys: Span<felt252>, offset: u8, value: felt252) {
    let keys_hash = poseidon_hash_span(keys);

    let base = starknet::storage_base_address_from_felt252(keys_hash);

    starknet::storage_write_syscall(
        ADDRESS_DOMAIN,
        starknet::storage_address_from_base_and_offset(base, offset),
        value
    );

}

/// Sets a span of felts into the storage.
///
/// * `keys` - Keys hashed to compute a single felt252 key.
/// * `offset` - Offset of the key storage, limited to 256 values.
/// * `value` - Span to be stored, must be less that 256 felts (taking offset in account).
fn set_span(keys: Span<felt252>, offset: u8, mut value: Span<felt252>) {
    if value.len() + offset.into() > 256 {
        let mut panic_data: Array<felt252> = ArrayTrait::new();
        panic_data.append('Storage of a span must');
        panic_data.append('be less than 256 felts.');
        panic(panic_data);
    }

    let keys_hash = poseidon_hash_span(keys);

    let base = starknet::storage_base_address_from_felt252(keys_hash);

    let mut offset = offset;
    loop {
        match value.pop_front() {
            Option::Some(v) => {
                starknet::storage_write_syscall(
                    ADDRESS_DOMAIN,
                    starknet::storage_address_from_base_and_offset(base, offset),
                    *v
                );
                offset += 1
            },
            Option::None(_) => {
                break ();
            },
        };
    };
}

