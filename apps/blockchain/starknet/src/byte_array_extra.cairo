use core::serde::Serde;

impl FeltTryIntoByteArray of TryInto<felt252, ByteArray> {
    fn try_into(self: felt252) -> Option<ByteArray> {
        let mut res: ByteArray = Default::default();
        res.pending_word = self;
        let mut length = 0;
        let mut data: u256 = self.into();
        loop {
            if data == 0 {
                break;
            }
            data /= 0x100;
            length += 1;
        };
        res.pending_word_len = length;
        Option::Some(res)
    }
}


impl SpanFeltTryIntoByteArray of TryInto<Span<felt252>, ByteArray> {
    fn try_into(self: Span<felt252>) -> Option<ByteArray> {
        if self.len() == 0_usize {
            Option::None(())
        } else if self.len() == 1_usize {
            (*self[0]).try_into()
        } else {
            let mut self = self.clone();
            Serde::deserialize(ref self)
        }
    }
}



#[cfg(test)]
mod tests {
    use core::serde::Serde;
    use super::{FeltTryIntoByteArray, SpanFeltTryIntoByteArray};

    #[test]
    fn from_felt252() {
        let a = 'hello how are you?';
        let b: Option<ByteArray> = a.try_into();
        match b {
            Option::Some(e) => {
                assert!(e.data.is_empty(), "Data should be empty");
                assert_eq!(e.pending_word, 'hello how are you?', "Wrong pending word");
                assert_eq!(e.pending_word_len, 18, "Wrong pending word len");
            },
            Option::None => panic!("Should not be None")
        }
    }
    #[test]
    fn from_span_felt252_none() {
        let a: Array<felt252> = array![];
        let b: Option<ByteArray> = a.span().try_into();
        match b {
            Option::Some(_) => panic!("Should be None"),
            Option::None => {},
        }
    }

    #[test]
    fn from_span_felt252_felt252() {
        let a: Array<felt252> = array!['hello'];
        let b: Option<ByteArray> = a.span().try_into();
        match b {
            Option::Some(e) => assert_eq!(e, "hello", "String mismatch"),
            Option::None => panic!("Should not be None"),
        }
    }

    #[test]
    fn from_span_felt252_bytearray_shortstring() {
        let orig: ByteArray = "I'm here";
        let mut a = ArrayTrait::new();
        orig.serialize(ref a);
        let b: Option<ByteArray> = a.span().try_into();
        match b {
            Option::Some(e) => assert_eq!(e, orig, "String mismatch"),
            Option::None(_) => panic!("Should not be None"),
        }
    }

    #[test]
    fn bytearray_long_serialize() {
        let orig: ByteArray = "This palindrome is not as good, but at least it's long enough";
        let mut a = ArrayTrait::new();
        orig.serialize(ref a);
        assert_eq!(*a[0], 1, "Wrong data len");
        assert_eq!(*a[1], 0x546869732070616c696e64726f6d65206973206e6f7420617320676f6f642c, "Wrong data[0]");
        assert_eq!(*a[2], 0x20627574206174206c656173742069742773206c6f6e6720656e6f756768, "Wrong pending word");
        assert_eq!(*a[3], 30, "Wrong pending word len");
    }

}