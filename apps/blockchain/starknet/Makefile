# TODO: when starkli can support address book, it will be easier to
# maintain a state between calls.

# ... I need to code the starknet foundry broadcasting. <3

# We can use script to log properly with colors in output files.
#	script -q -c "starkli declare $(contract) ${priv_key}" ${logfile}
# but we need to disable this when katana is used. To avoid too much logs on dev.
# mostly done for testnet and mainnet to avoid losing addresses.

CLEAN_CONFIG:=$(shell rm -f .env)
COPY_CONFIG:=$(shell cp $(config) .env)

include .env
export $(shell sed 's/=.*//' .env)

bold := "\\033[1m"
shiny := "\\033[31m"
normal := "\\033[0m"

bridge_class_hash := $(shell starkli class-hash target/dev/starklane_bridge.sierra.json)
erc721b_class_hash := $(shell starkli class-hash target/dev/starklane_erc721_bridgeable.sierra.json)

timestamp := $(shell date "+%d-%m-%Y_%H-%M-%S")
logfile := logs/make_setup_local.txt

# If a keystore is passed instead of a private key -> ask for the password.
ifndef STARKNET_KEYSTORE
priv_key := --private-key "${PRIVATE_KEY}"
else
priv_key := --keystore ${STARKNET_KEYSTORE}
endif

# Declare
declare:
	@printf "${bold}Ensure you don't forget the contract argument:\n${normal}"
	@echo "${shiny}usage: make declare config=.yourconfig.env contract=./target/dev/contract.sierra.json${normal}\n"
	starkli declare $(contract) ${priv_key}
	sleep 2

# Starklane deploy
starklane_deploy:
	starkli deploy ${bridge_class_hash} "${ADMIN_ACCOUNT_ADDR}" "${BRIDGE_L1_ADDRESS}" ${erc721b_class_hash} ${priv_key}

# Starklane upgrade with local version of starklane.
starklane_upgrade_auto:
	@printf "${bold}Ensure you don't forget the bridge argument:\n${normal}"
	@echo "${shiny}usage: make starklane_upgrade_auto config=.yourconfig.env bridge=0x...\n${normal}"
	scarb build
	$(eval new_class_hash=$(shell starkli class-hash ./target/dev/starklane_bridge.sierra.json))
	starkli declare ./target/dev/starklane_bridge.sierra.json ${priv_key}
	sleep 2
	starkli invoke $(bridge) upgrade ${new_class_hash} ${priv_key}

# Deposit tokens.
starklane_deposit:
	@printf "${bold}Ensure you don't forget the bridge, collection, owner_l1, tokens argument, withdraw_auto:\n${normal}"
	@echo "${shiny}usage: make starklane_deposit config=.yourconfig.env bridge=0x... collection=0x... owner_l1=0x... withdraw_auto=0 tokens=\"1 1 0\"\n${normal}"
	$(eval salt=$(shell date +%s%N))
	starkli invoke $(bridge) deposit_tokens ${salt} $(collection) $(owner_l1) $(tokens) $(withdraw_auto) 0 ${priv_key}
	sleep 2

# ERC721 bridgeable deploy
# For now, only supports name and symbol of length 1.
erc721b_deploy:
	@printf "${bold}Ensure you don't forget the name, symbol, bridge and owner arguments:\n${normal}"
	@echo "${shiny}usage: make erc721b_deploy config=.yourconfig.env name=abcd symbol=SYM bridge=0x...\n${normal}"
	starkli deploy ${erc721b_class_hash} 1 str:$(name) 1 str:$(symbol) $(bridge) ${ADMIN_ACCOUNT_ADDR} ${priv_key}

# Starklane local setup.
# Use a salt to ensure fixed addresses waiting for starkli address book.
starklane_local_setup:
	-mkdir -p logs
	scarb build

	# Declaring contracts
	starkli declare ./target/dev/starklane_erc721_bridgeable.sierra.json ${priv_key}
	sleep 2
	starkli declare ./target/dev/starklane_bridge.sierra.json ${priv_key}
	sleep 2
	# Deploying Bridge
	script -q -f -c "starkli deploy --salt 0x1234 ${bridge_class_hash} "${ADMIN_ACCOUNT_ADDR}" "${BRIDGE_L1_ADDRESS}" ${erc721b_class_hash} ${priv_key}" logs/a.txt
	sleep 2
	$(eval bridge_addr=$(shell cat logs/a.txt | tail -n 3 | head -n 1 | sed "s/\x1B\[[0-9;]*[JKmsu]//g"))

	echo "-------------> BRIDGE: ${bridge_addr}"

	# Deploying ERC721b
	script -q -f -c "starkli deploy --salt 0x8822 ${erc721b_class_hash} 1 str:collection_2 1 str:C2 ${bridge_addr} ${ADMIN_ACCOUNT_ADDR} ${priv_key}" logs/b.txt
	sleep 2
	$(eval erc721_addr=$(shell tail -n 3 logs/b.txt | head -n 1 | sed "s/\x1B\[[0-9;]*[JKmsu]//g"))

	echo "---> ERC721: ${erc721_addr}"

	# Minting and set approval for transfer
	starkli invoke ${erc721_addr} mint_range_free ${ADMIN_ACCOUNT_ADDR} u256:0 u256:100 ${priv_key}
	sleep 2
	starkli invoke ${erc721_addr} set_approval_for_all ${bridge_addr} 1 ${priv_key}
	sleep 2
	
	# Deposit tokens
	$(eval salt=$(shell date +%s%N))
	starkli invoke ${bridge_addr} deposit_tokens ${salt} ${erc721_addr} ${ETH_ACCOUNT} 2 u256:1 u256:2 1 0 ${priv_key}
