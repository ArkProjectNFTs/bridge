// build.rs
use std::io::Write;

use std::process::Command;
fn main() {
    let path = "git-version";

    // taken from https://stackoverflow.com/questions/43753491/include-git-commit-hash-as-string-into-rust-program
    let output = Command::new("git")
        .args(&["rev-parse", "HEAD"])
        .output()
        .expect("failed to execute process");
    let git_hash = if output.status.success() {
        let git_hash = String::from_utf8(output.stdout).unwrap();
        let outf = std::fs::File::create(path);
        if let Ok(mut f) = outf {
            let _ = write!(f, "{}", git_hash);
        }
        git_hash
    } else {
        std::fs::read_to_string(path).expect("Failed to retrieve git version from file")
    };

    println!("cargo:rustc-env=GIT_HASH={}", git_hash);
}
