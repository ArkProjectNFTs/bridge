use anyhow::Result;
use ethers::types::U256;
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

/// Normalize hex string
pub fn normalize_hex(s: &str) -> Result<String> {
    let value: U256 = U256::from_str_radix(s, 16)?;
    Ok(format!("0x{:064x}", value))
}

pub fn denormalize_hex(s: &str) -> Result<String> {
    let value: U256 = U256::from_str_radix(s, 16)?;
    Ok(format!("{:#x}", value))
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

    #[test]
    pub fn test_normalize_hex() {
        let s = "0x123456";
        let r = normalize_hex(s).unwrap();
        assert_eq!(
            r,
            "0x0000000000000000000000000000000000000000000000000000000000123456"
        );

        let s = "0x1212121212121212121212121212121212121212121212121212121212121212";
        let r = normalize_hex(s).unwrap();
        assert_eq!(r, s);

        // support ethereum checksum address
        let s = "0x8c7173Db918EB0f015ba2D319E94e1EaB95c63fb";
        let r = normalize_hex(s).unwrap();
        assert_eq!(
            r,
            "0x0000000000000000000000008c7173db918eb0f015ba2d319e94e1eab95c63fb"
        );
    }

    #[test]
    pub fn test_denormalize_hex() {
        let s = "0x0000000000000000000000000000000000000000000000000000000000123456";
        let r = denormalize_hex(s).unwrap();
        assert_eq!(r, "0x123456");

        let s = "0x1212121212121212121212121212121212121212121212121212121212121212";
        let r = denormalize_hex(s).unwrap();
        assert_eq!(r, s);

        // support ethereum checksum address
        let s = "0x0000000000000000000000008c7173db918eb0f015ba2d319e94e1eab95c63fb";
        let r = denormalize_hex(s).unwrap();
        assert_eq!(r, "0x8c7173db918eb0f015ba2d319e94e1eab95c63fb");
    }
}
