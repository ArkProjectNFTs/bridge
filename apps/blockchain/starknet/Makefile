# TODO: when starkli can support address book, it will be easier to
# maintain a state between calls.

# ... I need to code the starknet foundry broadcasting. <3

CLEAN_CONFIG:=$(shell rm -f .env)
COPY_CONFIG:=$(shell cp $(config) .env)

include .env
export $(shell sed 's/=.*//' .env)

bold := $(shell tput bold)
sgr0 := $(shell tput sgr0)

bridge_class_hash := $(shell starkli class-hash target/dev/starklane_bridge.sierra.json)
erc721b_class_hash := $(shell starkli class-hash target/dev/starklane_erc721_bridgeable.sierra.json)

# In starkli, we can't pass the keystore password as a variable.
priv_key := --private-key "${PRIVATE_KEY}"

# Declare
declare:
	@printf "$(bold)Ensure you don't forget the contract argument:\n"
	@echo "usage: make declare config=.yourconfig.env contract=./target/dev/contract.sierra.json"
	@printf "$(sgr0)\n"
	starkli declare $(contract) ${priv_key}

# Starklane deploy
starklane_deploy:
	starkli deploy ${bridge_class_hash} "${ADMIN_ACCOUNT_ADDR}" "${BRIDGE_L1_ADDRESS}" ${erc721b_class_hash} ${priv_key}

# Starklane upgrade with local version of starklane.
starklane_upgrade_auto:
	@printf "$(bold)Ensure you don't forget the bridge argument:\n"
	@echo "usage: make starklane_upgrade_auto config=.yourconfig.env bridge=0x..."
	@printf "$(sgr0)\n"
	starkli invoke $(bridge) upgrade ${bridge_class_hash} ${priv_key}

# ERC721 bridgeable deploy
# For now, only supports name and symbol of length 1.
erc721b_deploy:
	@printf "$(bold)Ensure you don't forget the name, symbol, bridge and owner arguments:\n"
	@echo "usage: make erc721b_deploy config=.yourconfig.env name=abcd symbol=SYM bridge=0x..."
	@printf "$(sgr0)\n"
	starkli deploy ${erc721b_class_hash} 1 str:$(name) 1 str:$(symbol) $(bridge) ${ADMIN_ACCOUNT_ADDR} ${priv_key}

