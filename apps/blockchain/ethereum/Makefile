include .env
export $(shell sed 's/=.*//' .env)

# Starklane setup from scratch on Anvil impl + proxy.
starklane_setup_anvil:
	export STARKNET_CORE_L1_ADDRESS=0x0000000000000000000000000000000000000000 && \
	export STARKLANE_L1_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# Starklane deploy impl + proxy.
starklane_deploy:
	export STARKLANE_L1_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# Starklane upgrade.
starklane_upgrade:
	export STARKLANE_L1_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# ERC721Bridgeable deploy impl + proxy.
erc721_deploy:
	export ERC721_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

# ERC721Bridgeable upgrade.
erc721_upgrade:
	export ERC721_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

