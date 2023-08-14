

# Setups both anvil and katana from scratch with contracts and request.
local_setup:
	@make stop_local_devnodes
	sleep 1
	@make start_local_devnodes
	sleep 1
	make -C ../blockchain/ethereum/ starklane_local_setup config=.env.anvil
	make -C ../blockchain/starknet/ starklane_local_setup config=.env.katana

start_local_devnodes:
	@echo "Starting devnodes..."
	~/starknet/dojo/target/release/katana &
	anvil &

stop_local_devnodes:
	@echo "Stopping devnodes..."
	- pkill katana
	- pkill anvil
