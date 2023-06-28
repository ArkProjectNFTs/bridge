#!/bin/bash

# export STARKNET_ACCOUNT=~/.accounts/katana_2 
# export STARKNET_RPC=http://0.0.0.0:5050
# export STARKNET_KEYSTORE=~/.keystore/katana_1 

ADMIN_ACCOUNT_ADDR=0x06f62894bfd81d2e396ce266b2ad0f21e0668d604e5bb1077337b6d570a54aea

# TODO: find a way to automatically detect those.
BRIDGE_CLASS_HASH=0x07a796713f53413f35c7bce37772dc6ef812f45c6ecc632c7d0ab4de8d96e624
ERC721_CLASS_HASH=0x02515edb3e3fd7034399095a0a712aa12f014cbdd8b27b483b7ad4485aafdbe2

# TODO: when startkli address book is out, don't need this anymore.
BRIDGE_ADDR=0x5434edebab3136aab9aa47128c4a6335615b7e907d36268632ca38bdd4329ea

starkli declare ./target/dev/starklane_Bridge.sierra.json
starkli declare ./target/dev/starklane_ERC721Bridgeable.sierra.json

# Deploy bridge, with admin addr.
echo "*** DEPLOYING Bridge"
starkli deploy "${BRIDGE_CLASS_HASH}" "${ADMIN_ACCOUNT_ADDR}"

# Deploy ERC721, with bridge addr and admin and admin account as collection owner.
# everai
TOKEN_NAME=0x657665726169
# DUO
TOKEN_SYMBOL=0x44554f

echo "*** DEPLOYING ERC721Bridgeable"
starkli deploy "${ERC721_CLASS_HASH}" \
        "${TOKEN_NAME}" \
        "${TOKEN_SYMBOL}" \
        "${BRIDGE_ADDR}" \
        "${ADMIN_ACCOUNT_ADDR}"

