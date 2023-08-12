curl --header "Content-Type: application/json"   --request POST   --data '{
    "jsonrpc": "2.0",
    "method": "katana_l1Handler",
    "params": ["0x03d3d7ea7b5ab5fdb4055573e2e2c8400c265a660987f0495fd30aa3d66a6a45", "0x02f4a221b39003ca67210ffb52bc7e958008e403625efaeacb7aba78c7456cab", "3"],
    "id": 1
}' http://0.0.0.0:5050
