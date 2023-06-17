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

use traits::Into;
use serde::Serde;
use array::{ArrayTrait, SpanTrait};
use integer::Felt252TryIntoU32;

// TODO(glihm): Remove this on new version of compiler.
use starklane::utils::serde::SpanSerde;

///! Token URI represented internally as a list of short string.
///!
///! It's not only a wrapper around Span because for the Dapp
///! to easily decode the data, a struct is well documented in the
///! ABI.
#[derive(Drop)]
struct TokenURI {
    // Number of felt252 (short string) used to represent the
    // entire URI.
    len: usize,

    // Span of felt252 (short string) to be concatenated
    // to have the complete URI.
    content: Span<felt252>,
}

///! Serde implementation for ERC721TokenURI.
impl TokenURISerde of serde::Serde<TokenURI> {

    fn serialize(self: @TokenURI, ref output: Array<felt252>) {
        // We don't need to add the length, as the Serde
        // for Span already add the length as the first
        // element of the array.
        self.content.serialize(ref output);
    }

    fn deserialize(ref serialized: Span<felt252>) -> Option<TokenURI> {
        // Same here, deserializing the Span gives us the len.
        let content = serde::Serde::<Span<felt252>>::deserialize(ref serialized)?;

        Option::Some(
            TokenURI {
		len: content.len(),
                content,
            }
        )
    }
}

///! Initializes a TokenURI from Array<felt252>.
impl ArrayIntoTokenURI of Into<Array<felt252>, TokenURI> {
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
    use array::SpanTrait;
    use array::ArrayTrait;
    use traits::Into;
    use option::OptionTrait;
    use super::{TokenURI, TokenURISerde, ArrayIntoTokenURI};

    /// Should init a TokenURI from Array<felt252>.
    #[test]
    #[available_gas(2000000000)]
    fn from_array_felt252() {
        let mut content = ArrayTrait::<felt252>::new();
        content.append('hello');
        content.append('world');

        let u1: TokenURI = content.into();
        assert(u1.len == 2, 'uri len');
        assert(u1.content.len() == 2, 'content len');
        assert(*u1.content[0] == 'hello', 'content 0');
        assert(*u1.content[1] == 'world', 'content 1');

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
        let u2 = serde::Serde::<TokenURI>::deserialize(ref sp).unwrap();
    }


}
