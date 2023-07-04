#!/bin/bash

STARKLI=~/starknet/starkli/target/release/starkli

export STARKNET_ACCOUNT=./katana_account.json
export STARKNET_RPC=http://0.0.0.0:5050
export STARKNET_KEYSTORE=./katana_key.json

ADMIN_ACCOUNT_ADDR=0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0
ETH_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# TODO: find a way to automatically detect those.
BRIDGE_CLASS_HASH=0x06698bc60f0d3a2aa22b3e9127343e887535a98f0d72c0a38f90eb5574e1378e
ERC721_CLASS_HASH=0x021ac711d5795b5b86cae6fb1d045f6ebc0c327ba21a3581cb25ebf3e5a6e7dc

# TODO: when startkli address book is out, don't need this anymore.
BRIDGE_ADDR=0x05405709d153fd8801db71030ca7983d5c964666f42adf195f07aad5ccdc921d

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

# starkli invoke 0x05405709d153fd8801db71030ca7983d5c964666f42adf195f07aad5ccdc921d write_dummy 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc http://0.0.0.0:5050 --account katana_account.json --keystore katana_key.json 
