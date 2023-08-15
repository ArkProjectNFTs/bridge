use anyhow::Result;
use std::time::SystemTime;

/// Returns the number of seconds from EPOCH (UTC).
pub fn utc_now_seconds() -> u64 {
    match SystemTime::now().duration_since(SystemTime::UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    }
}

/// Parses hex string and convert to u64.
pub fn u64_from_hex(s: &str) -> Result<u64> {
    let no_prefix = s.trim_start_matches("0x");
    Ok(u64::from_str_radix(no_prefix, 16)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_u64_from_hex() {
        let u = u64_from_hex("ff").unwrap();
        assert_eq!(u, 255);

        let u = u64_from_hex("0x02").unwrap();
        assert_eq!(u, 2);

        let u = u64_from_hex("0x07389d2c79aaa42eb204814b6fe5d8bbf8dfdabc4de18c7a3bb8193ab9");
        if u.is_ok() {
            panic!("Expected overflow of u64");
        }
    }
}
