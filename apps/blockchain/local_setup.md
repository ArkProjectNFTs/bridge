# ArkProject Bridge Local setup

## Dependencies version
- jq: 1.7.1
- foundry: forge 0.2.0 (ea7817c)
- asdf: v0.14.0
- scarb: 2.6.4
- dojo: 0.7.0
- starkli: 0.2.9
- starknet-foundry: 0.19.0

## Bridge setup
### L1 setup
##### Enter `ethereum` directory
```shell
blockchain$ cd ethereum
```

##### Copy environment file
```shell
ethereum$ cp .env.anvil .env
```

##### Start Anvil in another shell
```shell
ethereum$ anvil
```

##### Deploy messaging contract
```shell
ethereum$ forge script --broadcast --rpc-url anvil script/LocalMessaging.s.sol:LocalMessaging
```
Local messaging contract address is available in `logs/local_messaging_deploy.json`:
```
{
  "data": {
    "sncore_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "success": true
  }
}
```

##### Deploy ERC721Bridgeable contract
```shell
ethereum$ ERC721_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 forge script --broadcast --rpc-url anvil script/ERC721.s.sol:Deploy
```
ERC721 contract address is available in `logs/erc721_deploy.json`:
```
{
  "data": {
    "impl_address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "proxy_address": "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    "success": true
  }
}
```

##### Deploy Bridge and local messaging contract
```shell
ethereum$ STARKNET_CORE_L1_ADDRESS=$(cat logs/local_messaging_deploy.json | jq '.data.sncore_address' | sed 's|"||g') forge script --broadcast --rpc-url anvil script/Starklane.s.sol:Deploy

```
Bridge contract address is available in `logs/starklane_deploy.json`:
```
{
  "data": {
    "impl_address": "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    "proxy_address": "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    "sncore_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "success": true
  }
}
```
**Bridge L1 address: `0x5FC8d32690cc91D4c39d9d3abcBD16989F875707`**
```shell
ethereum$ export BRIDGE_L1_ADDR=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

------
### L2 setup
##### Enter `starknet` directory
```shell
blockchain$ cd starknet
```

##### Start katana in another shell
```shell
starknet$ katana --messaging ./data/anvil.messaging.json --seed 0
```

##### Build contracts
```shell
starknet$ scarb build
```

##### Setup environment
```shell
starknet$ cp .env.katana .env
starknet$ source .env
```

##### Declare ERC721 bridgeable class
```shell
starknet$ starkli_deployer declare --compiler-version 2.6.2 --watch ./target/dev/starklane_erc721_bridgeable.contract_class.json 
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Declaring Cairo 1 class: 0x0122d394f5b7a23efd3c9a80740ce6e0c9764ab66c75f2bb5df2968e02a7206e
Compiling Sierra class to CASM with compiler version 2.6.2...
CASM class hash: 0x0192a1b69fa90d13eb8514b05b85b47f035db2a8b9e8cf949ffc91a31fb1cc13
Contract declaration transaction: 0x05f58015bfbcf65ec8c74329266a89c32d760ccde538b5b9591d98187a18fbf8
Waiting for transaction 0x05f58015bfbcf65ec8c74329266a89c32d760ccde538b5b9591d98187a18fbf8 to confirm...
Transaction not confirmed yet...
Transaction 0x05f58015bfbcf65ec8c74329266a89c32d760ccde538b5b9591d98187a18fbf8 confirmed
Class hash declared:
0x0122d394f5b7a23efd3c9a80740ce6e0c9764ab66c75f2bb5df2968e02a7206e
```
**ERC721 Bridgeable class hash is: `0x0122d394f5b7a23efd3c9a80740ce6e0c9764ab66c75f2bb5df2968e02a7206e`**
```shell
starknet$ export ERC721_BRIDGEABLE_CLASSHASH=0x0122d394f5b7a23efd3c9a80740ce6e0c9764ab66c75f2bb5df2968e02a7206e
```

##### Declare Bridge class
```shell
starknet$ starkli_deployer declare --compiler-version 2.6.2 --watch ./target/dev/starklane_bridge.contract_class.json 
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Declaring Cairo 1 class: 0x04121c3429b2f6496b2334b780657b6368267fd2c3d37be414065a37ef1311db
Compiling Sierra class to CASM with compiler version 2.6.2...
CASM class hash: 0x002fd7b0c45bbc0df368bc724ececcdd1e9b8028f5f6ca154adffad264e73f73
Contract declaration transaction: 0x01037d5d1f91e1bc2e35936ea1fa026e114d06a44601144ceb284d2587b02eeb
Waiting for transaction 0x01037d5d1f91e1bc2e35936ea1fa026e114d06a44601144ceb284d2587b02eeb to confirm...
Transaction not confirmed yet...
Transaction 0x01037d5d1f91e1bc2e35936ea1fa026e114d06a44601144ceb284d2587b02eeb confirmed
Class hash declared:
0x04121c3429b2f6496b2334b780657b6368267fd2c3d37be414065a37ef1311db
```
**Bridge classhash is `0x04121c3429b2f6496b2334b780657b6368267fd2c3d37be414065a37ef1311db`**
```shell
starknet$ export BRIDGE_CLASSHASH=0x04121c3429b2f6496b2334b780657b6368267fd2c3d37be414065a37ef1311db
```

##### Deploy bridge
```shell
starknet$ starkli_deployer deploy --salt 0x1234 --watch ${BRIDGE_CLASSHASH} ${STARKNET_ADMIN_ADDR} ${BRIDGE_L1_ADDR} ${ERC721_BRIDGEABLE_CLASSHASH} 
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Deploying class 0x04121c3429b2f6496b2334b780657b6368267fd2c3d37be414065a37ef1311db with salt 0x0000000000000000000000000000000000000000000000000000000000001234...
The contract will be deployed at address 0x0155713d9f99c3cba8eea4dcf3224a60162de750a426d6d17ba81b338d82ce6d
Contract deployment transaction: 0x022bfc3e16913155edfed1bdb2318c4a2a8e002303c7dbe1062017685e57c48e
Waiting for transaction 0x022bfc3e16913155edfed1bdb2318c4a2a8e002303c7dbe1062017685e57c48e to confirm...
Transaction not confirmed yet...
Transaction 0x022bfc3e16913155edfed1bdb2318c4a2a8e002303c7dbe1062017685e57c48e confirmed
Contract deployed:
0x0155713d9f99c3cba8eea4dcf3224a60162de750a426d6d17ba81b338d82ce6d
```
**Bridge address is `0x0155713d9f99c3cba8eea4dcf3224a60162de750a426d6d17ba81b338d82ce6d`**
```shell
starknet$ export BRIDGE_L2_ADDR=0x0155713d9f99c3cba8eea4dcf3224a60162de750a426d6d17ba81b338d82ce6d
```
------
### Testing transfert

A mintable collection is already deployed at **`${ERC721_L1_ADDR}`** and token ID 3 & 4 are owned by **`${ETHEREUM_USER}`**

##### Enable L1 Bridge white list
```shell
ethereum$ cast_admin_send ${BRIDGE_L1_ADDR} "enableWhiteList(bool)" true
```

##### Set L1 collection mapping
```shell
ethereum$ cast_admin_send ${BRIDGE_L1_ADDR} "setL1L2CollectionMapping(address,uint256,bool)" ${ERC721_L1_ADDR} ${ERC721_L2_ADDR} false
```

##### Whitelist L1 collection
```shell
ethereum$ cast_admin_send ${BRIDGE_L1_ADDR} "whiteList(address,bool)" ${ERC721_L1_ADDR} true
```

##### Enable L1 Bridge
```shell
ethereum$ cast_admin_send ${BRIDGE_L1_ADDR} "enableBridge(bool)" true
```

##### Deploy ERC721 bridgeable as a test ERC721 collection
```
ByteArray
collection_test -> 0x0 0x636f6c6c656374696f6e5f74657374 0xf
CTEST -> 0x0 0x4354455354 0x5
URI -> 0x0 0x555249 0x3
```
```shell
starknet$ starkli_deployer deploy --salt 0x8822 --watch ${ERC721_BRIDGEABLE_CLASSHASH} 0x0 0x636f6c6c656374696f6e5f74657374 0xf 0x0 0x4354455354 0x5 0x0 0x555249 0x3 ${BRIDGE_L1_ADDR} ${STARKNET_OWNER_ADDR}
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Deploying class 0x0122d394f5b7a23efd3c9a80740ce6e0c9764ab66c75f2bb5df2968e02a7206e with salt 0x0000000000000000000000000000000000000000000000000000000000008822...
The contract will be deployed at address 0x024c05a4d71b45b536a3e94e1f06b7ca7c948ac4db328d672760ed2dd1ecea29
Contract deployment transaction: 0x07f0ed60dc8033e54ae54fbfc36868d00bc246512e1cc96dfa76b94251084995
Contract deployed:
0x024c05a4d71b45b536a3e94e1f06b7ca7c948ac4db328d672760ed2dd1ecea29
```
**Collection address is `0x024c05a4d71b45b536a3e94e1f06b7ca7c948ac4db328d672760ed2dd1ecea29`**
```shell
starknet$ export ERC721_L2_ADDR=0x024c05a4d71b45b536a3e94e1f06b7ca7c948ac4db328d672760ed2dd1ecea29
```

##### Mint NFT for user
```shell
starknet$ starkli_owner invoke --watch ${ERC721_L2_ADDR} mint_range ${STARKNET_USER_ACCOUNT_ADDR} u256:0 u256:10
```

##### Enable Bridge white list
```shell
starknet$ starkli_admin invoke --watch ${BRIDGE_L2_ADDR} enable_white_list 1
```

##### Set collection mapping
```shell
starknet$ starkli_admin invoke --watch ${BRIDGE_L2_ADDR} set_l1_l2_collection_mapping ${ERC721_L1_ADDR} ${ERC721_L2_ADDR}
```

##### Whitelist collection
```shell
starknet$ starkli_admin invoke --watch ${BRIDGE_L2_ADDR} white_list_collection ${ERC721_L2_ADDR} 1
```

##### Enable Bridge
```shell
starknet$ starkli_admin invoke --watch ${BRIDGE_L2_ADDR} enable 1
```

-----
#### L1->L2 transfert

##### Approve ERC721 for transfert
```shell
ethereum$ cast_user_send ${ERC721_L1_ADDR} "approve(address,uint256)" ${BRIDGE_L1_ADDR} 3
```
```shell
ethereum$ cast_user_send ${ERC721_L1_ADDR} "approve(address,uint256)" ${BRIDGE_L1_ADDR} 4
```

##### Bridge NFT 3 & 4
```shell
ethereum$ cast_user_send ${BRIDGE_L1_ADDR} "depositTokens(uint256,address,uint256,uint256[],bool)" 0x123 ${ERC721_L1_ADDR} ${STARKNET_USER_ACCOUNT_ADDR} "[3,4]" false
```

------
#### L2->L1 transfert

##### Approve ERC721 for transfert
```shell
starknet$ starkli_user invoke --watch ${ERC721_L2_ADDR} approve ${BRIDGE_L2_ADDR} u256:1
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Invoke transaction: 0x0756a1b0ddb2b12d966a2698838416b119015ca1d36e6986d5b1e7f811e82d6a
Waiting for transaction 0x0756a1b0ddb2b12d966a2698838416b119015ca1d36e6986d5b1e7f811e82d6a to confirm...
Transaction not confirmed yet...
Transaction 0x0756a1b0ddb2b12d966a2698838416b119015ca1d36e6986d5b1e7f811e82d6a confirmed
```
```shell
starknet$ starkli_user invoke --watch ${ERC721_L2_ADDR} approve ${BRIDGE_L2_ADDR} u256:2
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Invoke transaction: 0x01a9e875ee67b7c8aebd2d50d0908716fd6d60ffa290fe82803483bb21e618df
Waiting for transaction 0x01a9e875ee67b7c8aebd2d50d0908716fd6d60ffa290fe82803483bb21e618df to confirm...
Transaction not confirmed yet...
Transaction 0x01a9e875ee67b7c8aebd2d50d0908716fd6d60ffa290fe82803483bb21e618df confirmed
```

##### Bridge NFT 1 & 2
```shell
starknet$ starkli_user invoke --watch ${BRIDGE_L2_ADDR} deposit_tokens $(date +%s%N) ${ERC721_L2_ADDR} ${ETH_ACCOUNT} 2 u256:1 u256:2 0 0
```
```console
WARNING: using private key in plain text is highly insecure, and you should ONLY do this for development. Consider using an encrypted keystore instead. (Check out https://book.starkli.rs/signers on how to suppress this warning)
Invoke transaction: 0x04a40e9a337fe35ccdddb9a2f646c2f5e205673ca656ab77d4049f127deacde2
Waiting for transaction 0x04a40e9a337fe35ccdddb9a2f646c2f5e205673ca656ab77d4049f127deacde2 to confirm...
Transaction not confirmed yet...
Transaction 0x04a40e9a337fe35ccdddb9a2f646c2f5e205673ca656ab77d4049f127deacde2 confirmed
```
**Transaction hash: `0x04a40e9a337fe35ccdddb9a2f646c2f5e205673ca656ab77d4049f127deacde2`**

Payload required to withdraw ERC721 on L1, can be extracted with:
```shell
starknet$ starkli_user tx-receipt 0x04a40e9a337fe35ccdddb9a2f646c2f5e205673ca656ab77d4049f127deacde2 | jq '.messages_sent[0].payload'
```

