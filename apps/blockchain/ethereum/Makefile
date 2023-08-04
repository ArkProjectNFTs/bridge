include .env
export $(shell sed 's/=.*//' .env)

# Setup starklane from scratch on Anvil.
starklane_setup_anvil:
	STARKNET_CORE_L1_ADDRESS=0x0000000000000000000000000000000000000000
	STARKLANE_L1_PROXY_ADDRESS=0x0000000000000000000000000000000000000000
	forge script --broadcast --rpc-url ${ETH_RPC_URL} script/Starklane.s.sol:Deploy


