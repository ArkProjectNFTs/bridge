# Only .env file is loaded by foundry, and we can't specify a file.
# TODO: need a better way to force config arg is given...!
CLEAN_CONFIG:=$(shell rm .env)
COPY_CONFIG:=$(shell cp $(config) .env)

include .env
export $(shell sed 's/=.*//' .env)

bold := $(shell tput bold)
sgr0 := $(shell tput sgr0)

# TODO: for upgrades, check how to force proxy arg.

# Starklane local setup.
starklane_local_setup:
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/LocalTesting.s.sol:LocalSetup

# Starklane deposit tokens
starklane_deposit:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make starklane_deposit config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export STARKLANE_L1_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} --sender ${ACCOUNT_ADDRESS} script/Starklane.s.sol:Deposit

# Starklane withdraw tokens
starklane_withdraw:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make starklane_withdraw config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export STARKLANE_L1_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} --sender ${ACCOUNT_ADDRESS} script/Starklane.s.sol:WithdrawSN

# Starklane deploy impl + proxy.
starklane_deploy:
	export STARKLANE_L1_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# Starklane upgrade.
starklane_upgrade:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make starklane_upgrade config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export STARKLANE_L1_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# ERC721Bridgeable deploy impl + proxy.
erc721_deploy:
	export ERC721_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

# ERC721Bridgeable upgrade.
erc721_upgrade:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make erc721_upgrade config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export ERC721_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

# ERC1155Bridgeable deploy impl + proxy.
erc1155_deploy:
	export ERC1155_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/ERC1155.s.sol:Deploy

# ERC1155Bridgeable upgrade.
erc1155_upgrade:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make erc1155_upgrade config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export ERC1155_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast  --rpc-url ${ETH_RPC_URL} script/ERC1155.s.sol:Deploy

