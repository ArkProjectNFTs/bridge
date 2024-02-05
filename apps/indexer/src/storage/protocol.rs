
use num_bigint::BigUint;

use super::Request;


pub trait ProtocolParser {
    fn get_token_ids_offset(&self) -> usize;
    fn get_token_ids(&self) -> Vec<String>;
}

impl ProtocolParser for Request {
    fn get_token_ids_offset(&self) -> usize {
        let content: Vec<String> = serde_json::from_str(&self.content).unwrap();
        let mut offset = 7; // header version, hash low, hash high, collectionL1, collectionL2, ownerL1, ownerL2
        for _ in 0..3 { // 3 cairo strings: name, symbol and base_uri
            offset += usize::from_str_radix(content[offset].trim_start_matches("0x"), 16).unwrap() + 3;
        }
        offset
    }

    fn get_token_ids(&self) -> Vec<String> {
        let content: Vec<String> = serde_json::from_str(&self.content).unwrap();
        let mut offset = self.get_token_ids_offset();
        let nb_tokens: usize = usize::from_str_radix(content[offset].trim_start_matches("0x"), 16).unwrap();
        offset += 1;
        let mut output = Vec::new();
        for _ in 0..nb_tokens {            
            let low = BigUint::parse_bytes(content[offset].trim_start_matches("0x").as_bytes(), 16).unwrap();
            offset += 1;
            let mut high = BigUint::parse_bytes(content[offset].trim_start_matches("0x").as_bytes(), 16).unwrap();
            offset += 1;
            high = high << 128;
            high += low;
            output.push(high.to_str_radix(10));
        }
        output
    }
}