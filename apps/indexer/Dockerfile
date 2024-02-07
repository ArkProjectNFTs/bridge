FROM rust:1.75.0-bookworm AS builder

WORKDIR /usr/src/myapp

COPY Starklane_ABI.json .
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY src src
COPY git-version git-version

RUN cargo install --path .

#####
FROM debian:bookworm-slim

COPY --from=builder /usr/local/cargo/bin/starklane_indexer /usr/local/bin/starklane_indexer
CMD ["starklane_indexer"]
