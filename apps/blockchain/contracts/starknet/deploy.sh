#!/bin/bash

STARKLI=~/starknet/starkli/target/release/starkli

export STARKNET_ACCOUNT=./katana_account.json
export STARKNET_RPC=http://0.0.0.0:5050
export STARKNET_KEYSTORE=./katana_key.json

ADMIN_ACCOUNT_ADDR=0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0

# TODO: find a way to automatically detect those.
BRIDGE_CLASS_HASH=0x01e9f1d779951b868e1ae37b8b47f3d93cd727b545d2e762ed284d6df81e5c73
ERC721_CLASS_HASH=0x021ac711d5795b5b86cae6fb1d045f6ebc0c327ba21a3581cb25ebf3e5a6e7dc

# TODO: when startkli address book is out, don't need this anymore.
BRIDGE_ADDR=0x064749323f544aa6ff43fa0c57f4f91444a879a30580cdb2e13e7b9e91bf8e3b

$STARKLI declare --compiler-version 2.0.0 ./target/dev/starklane_bridge.sierra.json --keystore-password 1234
$STARKLI declare --compiler-version 2.0.0 ./target/dev/starklane_erc721_bridgeable.sierra.json --keystore-password 1234

# Deploy bridge, with admin addr.
echo "*** DEPLOYING Bridge"
$STARKLI deploy "${BRIDGE_CLASS_HASH}" "${ADMIN_ACCOUNT_ADDR}" --salt 0x1122 --keystore-password 1234

$STARKLI invoke "${BRIDGE_ADDR}" set_erc721_default_contract "${ERC721_CLASS_HASH}" --keystore-password 1234

# Deploy ERC721, with bridge addr and admin and admin account as collection owner.
# everai
TOKEN_NAME=0x657665726169
# DUO
TOKEN_SYMBOL=0x44554f

echo "*** DEPLOYING ERC721Bridgeable"
$STARKLI deploy --keystore-password 1234 --salt 0x12345 "${ERC721_CLASS_HASH}" \
        1 "${TOKEN_NAME}" \
        1 "${TOKEN_SYMBOL}" \
        "${BRIDGE_ADDR}" \
        "${ADMIN_ACCOUNT_ADDR}"


# curl --header "Content-Type: application/json"   --request POST   --data '{
#     "jsonrpc": "2.0",
#     "method": "starknet_getEvents",
#     "params": [{"chunk_size": 2000000, "to_block": "latest", "address": "0x001cfd8c9c9abbc988e294d818612e6b8f33053a2c845c00670b59adc8061aa3", "keys": [["0x03329e55631f02d8529cf652e1b300a30940bea35447ef38757b8c5a2be98bee"]]}],
#     "id": 1
# }' http://0.0.0.0:5050

