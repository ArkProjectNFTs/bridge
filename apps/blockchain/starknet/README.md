# Starklane Starknet.


## Dev

To build Cairo, the recommended way is to use [Scarb](https://docs.swmansion.com/scarb/docs.html).
We do recommend to use [asdf](https://docs.swmansion.com/scarb/download.html#install-via-asdf) method
to easily switch between versions.

For testing, this project uses [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/).

At the moment of this writting, some features in Starknet Foundry are not merged,
especially the [l1_handler_call PR](https://github.com/foundry-rs/starknet-foundry/pull/459).
So at least one test will fail with the regular installation of forge.

You can always [clone the fork](https://github.com/glihm/starknet-foundry/tree/cheatcode-l1-handler-call) and build the branch.

Once forge is installed, you can run:

```bash
snforge test
```

