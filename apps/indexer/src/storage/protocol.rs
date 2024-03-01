use num_bigint::BigUint;
use sha3::{Digest, Keccak256};

use starknet::core::types::{FieldElement, MsgToL1};

use super::Request;

pub type MessageHash = [u8; 32];

pub trait ProtocolParser {
    fn get_token_ids_offset(&self) -> usize;
    fn get_token_ids(&self) -> Vec<String>;
    fn message_to_l1_hash(&self, from: &String, to: &String) -> MessageHash;
}

impl ProtocolParser for Request {
    fn get_token_ids_offset(&self) -> usize {
        let content: Vec<String> = serde_json::from_str(&self.content).unwrap();
        let mut offset = 7; // header version, hash low, hash high, collectionL1, collectionL2, ownerL1, ownerL2
        for _ in 0..3 {
            // 3 cairo strings: name, symbol and base_uri
            offset +=
                usize::from_str_radix(content[offset].trim_start_matches("0x"), 16).unwrap() + 3;
        }
        offset
    }

    fn get_token_ids(&self) -> Vec<String> {
        let content: Vec<String> = serde_json::from_str(&self.content).unwrap();
        let mut offset = self.get_token_ids_offset();
        let nb_tokens: usize =
            usize::from_str_radix(content[offset].trim_start_matches("0x"), 16).unwrap();
        offset += 1;
        let mut output = Vec::new();
        for _ in 0..nb_tokens {
            let low = BigUint::parse_bytes(content[offset].trim_start_matches("0x").as_bytes(), 16)
                .unwrap();
            offset += 1;
            let mut high =
                BigUint::parse_bytes(content[offset].trim_start_matches("0x").as_bytes(), 16)
                    .unwrap();
            offset += 1;
            high = high << 128;
            high += low;
            output.push(high.to_str_radix(10));
        }
        output
    }

    fn message_to_l1_hash(&self, from: &String, to: &String) -> MessageHash {
        let content: Vec<String> = serde_json::from_str(&self.content).unwrap();
        let payload: Vec<FieldElement> = content
            .iter()
            .map(|v| FieldElement::from_hex_be(v).unwrap())
            .collect();
        let msg = MsgToL1 {
            from_address: FieldElement::from_hex_be(&from).unwrap(),
            to_address: FieldElement::from_hex_be(&to).unwrap(),
            payload,
        };
        hash(&msg)
    }
}

/// Calculates the message hash based on the algorithm documented here:
///
/// https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/messaging-mechanism/#structure_and_hashing_l2-l1
fn hash(msg: &MsgToL1) -> MessageHash {
    let mut hasher = Keccak256::new();

    // FromAddress
    hasher.update(msg.from_address.to_bytes_be());

    // ToAddress
    hasher.update(msg.to_address.to_bytes_be());

    // Payload.length
    hasher.update([0u8; 24]);
    hasher.update((msg.payload.len() as u64).to_be_bytes());

    // Payload
    for item in msg.payload.iter() {
        hasher.update(item.to_bytes_be());
    }

    let hash = hasher.finalize();

    // Because we know hash is always 32 bytes
    unsafe { *(hash[..].as_ptr() as *const [u8; 32]) }
}

#[cfg(test)]
mod tests {
    use starknet::core::types::{FieldElement, MsgToL1};

    use crate::storage::protocol::hash;

    #[test]
    fn test_msg_to_l1_hash() {
        // Goerli-1 tx (L1): 59e37da138dcf7ab9ca4fc7fde15d3f113a06781c4181dfcf0d74753023060b1 Log #40.
        // Goerli-1 tx (L2): 4e0bbc07ff29e5df13dfbcb7e4746fdde52c3649a6a69bd86b15397769722fd

        let msg = MsgToL1 {
            from_address: FieldElement::from_hex_be(
                "0x0164cba33fb7152531f6b4cfc3fff26b4d7b26b4900e0881042edd607b428a92",
            )
            .unwrap(),
            to_address: FieldElement::from_hex_be("0xb6dbfaa86bb683152e4fc2401260f9ca249519c0")
                .unwrap(),
            payload: vec![
                FieldElement::from_hex_be("0x0").unwrap(),
                FieldElement::from_hex_be("0x0").unwrap(),
                FieldElement::from_hex_be("0x0182b8").unwrap(),
                FieldElement::from_hex_be("0x0").unwrap(),
                FieldElement::from_hex_be("0x0384").unwrap(),
                FieldElement::from_hex_be("0x0").unwrap(),
            ],
        };

        /* let expected_hash =
            Hash256::from_hex("0x326a04493fc8f24ac6c6ae7bdba23243ce03ec3aae53f0ed3a0d686eb8cac930")
                .unwrap();
        */
        // assert_eq!(hash(&msg), expected_hash);
        println!("{:?}", hash(&msg));
    }
}
