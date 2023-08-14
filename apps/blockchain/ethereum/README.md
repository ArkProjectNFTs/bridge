# Starklane: Ethererum.

Starklane, bridge for NTFs.

## Dev

[Foundry for ethereum](https://book.getfoundry.sh/) is used. Once foundry is installed:

1. Install the dependencies

```bash
forge install
```

2. Run the tests

```bash
forge test
```

## To deploy (anvil, testnet, etc...)

First, create a `.yourname.env` file copying the content from `.env.anvil`.
This file will remain ignored by git, and you can put there your credentials
to interact with the network.

Then, you can use the Makefile to operate. Most of variables are taken from
the environment file.

`make erc721_deploy config=.yourname.env`
`make starklane_deploy config=.yourname.env`

...


## TODO

Bridge bytecode is too big. We need to reduce code size.
Also, what can be a solution to deploy an ERC721 without embedding it
into out code?

