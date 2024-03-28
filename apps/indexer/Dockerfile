FROM rust:1.75.0-bookworm AS builder

ARG GIT_HASH
ENV GIT_HASH ${GIT_HASH}

WORKDIR /usr/src/myapp

COPY Starklane_ABI.json .
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
COPY src src
# COPY doesn't check if file is present when matching is used
COPY git-versio[n] git-version

RUN cargo install --path .

#####
FROM debian:bookworm-slim

COPY --from=builder /usr/local/cargo/bin/starklane_indexer /usr/local/bin/starklane_indexer
CMD ["starklane_indexer"]
