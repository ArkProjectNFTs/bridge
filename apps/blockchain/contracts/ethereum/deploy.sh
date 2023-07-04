#!/bin/bash

RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
STARKNET_CORE_ADDR=0x5FbDB2315678afecb367f032d93F642f64180aa3

# KATANA account address of an account
KATANA_ACCOUNT=0x03ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0

# TODO: automatize this one.. of made it constant.
BRIDGE_L2_ADDR=0x064749323f544aa6ff43fa0c57f4f91444a879a30580cdb2e13e7b9e91bf8e3b

# deposit_from_l1
BRIDGE_L2_SELECTOR=0x03fbd841a521983062b0a7adb2a91b5fe9f54499857cdc25ebdf1fa77df7a8d5

# Starknet Messaging broker. Keep it first to have predictable addr.
forge create --rpc-url "${RPC_URL}" \
    --private-key "${PRIVATE_KEY}" \
    src/StarknetMessaging.sol:StarknetMessaging

# ERC721Bridgeable.
forge create --rpc-url "${RPC_URL}" \
    --constructor-args "everai duo" "EVERDUO" \
    --private-key "${PRIVATE_KEY}" \
    src/ERC721Bridgeable.sol:ERC721Bridgeable

# Bridge.
forge create --rpc-url "${RPC_URL}" \
    --constructor-args "${STARKNET_CORE_ADDR}" "${BRIDGE_L2_ADDR}" "${BRIDGE_L2_SELECTOR}" \
    --private-key "${PRIVATE_KEY}" \
    src/Bridge.sol:Bridge

# OUTPUT (which is replicable each time the script runs in the same order)
# ⠆] Compiling...
# No files changed, compilation skipped
# Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# Transaction hash: 0xcbbde2bfc537faa2ddc5217297d66d03b3cc78efbdd1ce05e577ee30d9cb04ec
# [⠆] Compiling...
# No files changed, compilation skipped
# Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
# Transaction hash: 0x59357fc87540c671dabbdb033d1dfc3af6e68215ca7ad606414794f6700ea623
# [⠆] Compiling...
# No files changed, compilation skipped
# Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
# Transaction hash: 0xd46c38a493a8a6e7ad6bce9e5e6c4e11569a05a7f99e3ca3801be66036f6daf6



# Give approval to the bridge.
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "setApprovalForAll(address,bool)" 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 1 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Mint tokens 1 and 2.
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "test_mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "test_mint(address,uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 2 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deposit some tokens to send message to L2.
cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "depositTokens(uint256,address,uint256,uint256[])" 0xee 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "${KATANA_ACCOUNT}" '[1,2]' --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value 1


# cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "getStarknetCoreAddr(uint256)" 0xbeef --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value 1

# cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "emitTestEvent()" --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value 1

# cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "setBridgeL2Address(uint256)" "${BRIDGE_L2_ADDR}" --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value 1

# cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 "setBridgeL2Selector(uint256)" "${BRIDGE_L2_SELECTOR}" --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --value 1
