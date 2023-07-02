#!/bin/bash

STARKLI=~/starknet/starkli/target/release/starkli

export STARKNET_ACCOUNT=./katana_account.json
export STARKNET_RPC=http://0.0.0.0:5050
export STARKNET_KEYSTORE=./katana_key.json

ADMIN_ACCOUNT_ADDR=0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0

# TODO: find a way to automatically detect those.
BRIDGE_CLASS_HASH=0x0548a02cfb04008ed4adadb49a427b061537a7a711a66bdc0341f9409a66c587
ERC721_CLASS_HASH=0x021ac711d5795b5b86cae6fb1d045f6ebc0c327ba21a3581cb25ebf3e5a6e7dc

# TODO: when startkli address book is out, don't need this anymore.
BRIDGE_ADDR=0x026fb840546e842f4a858a5b5ea2bfcfeabfdefa2705f56c13d16d966d0912c6

$STARKLI declare --compiler-version 2.0.0-rc6 ./target/dev/starklane_bridge.sierra.json --keystore-password 1234
$STARKLI declare --compiler-version 2.0.0-rc6 ./target/dev/starklane_erc721_bridgeable.sierra.json --keystore-password 1234

# Deploy bridge, with admin addr.
echo "*** DEPLOYING Bridge"
$STARKLI deploy "${BRIDGE_CLASS_HASH}" "${ADMIN_ACCOUNT_ADDR}" --keystore-password 1234

# Deploy ERC721, with bridge addr and admin and admin account as collection owner.
# everai
TOKEN_NAME=0x657665726169
# DUO
TOKEN_SYMBOL=0x44554f

echo "*** DEPLOYING ERC721Bridgeable"
$STARKLI deploy --keystore-password 1234 "${ERC721_CLASS_HASH}" \
        1 "${TOKEN_NAME}" \
        1 "${TOKEN_SYMBOL}" \
        "${BRIDGE_ADDR}" \
        "${ADMIN_ACCOUNT_ADDR}"


# curl --header "Content-Type: application/json"   --request POST   --data '{
#     "jsonrpc": "2.0",
#     "method": "katana_l1Handler",
#     "params": ["0x04d7d59188eaf370aa67e5f57cc51f98c4e59e930cf56776d6c37e3ba1d4172d", "0x02f4a221b39003ca67210ffb52bc7e958008e403625efaeacb7aba78c7456cab", "3"],
#     "id": 1
# }' http://0.0.0.0:5050
