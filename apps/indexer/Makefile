# Setups contracts on existing devnodes. Usefull to have devnodes
# running in an other terminal for debugging.
local_setup:
	make -C ../blockchain/ethereum/ starklane_local_setup config=.env.anvil
	make -C ../blockchain/starknet/ starklane_local_setup config=.env.katana

# Setups both anvil and katana from scratch with contracts and request.
local_setup_with_devnodes:
	@make stop_local_devnodes
	sleep 1
	@make start_local_devnodes
	sleep 1
	@make local_setup
	

start_local_devnodes:
	@echo "Starting devnodes..."
	katana &
	anvil &

stop_local_devnodes:
	@echo "Stopping devnodes..."
	- pkill katana
	- pkill anvil

db_reset:
	docker-compose -f ./docker-compose.yml down
	docker volume rm indexer_starklane_testnet -f
	docker-compose -f ./docker-compose.yml up -d

run_dev:
	cargo build
	@make db_reset
	RUST_LOG=debug cargo run -- --config-file local.config --mongodb mongodb://localhost:27017/starklane --api-server-ip 127.0.0.1:8080

run_server:
	RUST_LOG=starklane_indexer=debug cargo run -- --config-file testnet.config --mongodb mongodb://localhost:27017/starklane_testnet --api-server-ip 127.0.0.1:7890
