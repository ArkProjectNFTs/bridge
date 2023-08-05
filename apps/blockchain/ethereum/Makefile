# Only .env file is loaded by foundry, and we can't specify a file.
# TODO: need a better way to force config arg is given...!
CLEAN_CONFIG:=$(shell rm .env)
COPY_CONFIG:=$(shell cp $(config) .env)

include .env
export $(shell sed 's/=.*//' .env)

bold := $(shell tput bold)
sgr0 := $(shell tput sgr0)

# TODO: for upgrades, check how to force proxy arg.

# Starklane deploy impl + proxy.
starklane_deploy:
	export STARKLANE_L1_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# Starklane upgrade.
starklane_upgrade:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make starklane_upgrade config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export STARKLANE_L1_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy

# ERC721Bridgeable deploy impl + proxy.
erc721_deploy:
	export ERC721_PROXY_ADDRESS=0x0000000000000000000000000000000000000000 && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

# ERC721Bridgeable upgrade.
erc721_upgrade:
	@printf "$(bold)Ensure you don't forget the proxy argument:\n"
	@echo "usage: make erc721_upgrade config=.yourconfig.env proxy=0x1234"
	@printf "$(sgr0)\n"
	export ERC721_PROXY_ADDRESS=$(proxy) && \
	forge script --broadcast --verify --rpc-url ${ETH_RPC_URL} script/ERC721.s.sol:Deploy

